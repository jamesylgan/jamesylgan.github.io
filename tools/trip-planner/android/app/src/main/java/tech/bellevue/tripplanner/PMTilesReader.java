package tech.bellevue.tripplanner;

import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.File;
import java.io.IOException;
import java.io.InputStream;
import java.io.RandomAccessFile;
import java.net.HttpURLConnection;
import java.net.URL;
import java.nio.ByteBuffer;
import java.nio.ByteOrder;
import java.util.ArrayList;
import java.util.List;
import java.util.zip.GZIPInputStream;

/**
 * PMTiles v3 reader supporting both local files and HTTP range requests.
 *
 * For local files: uses RandomAccessFile for fast seeking.
 * For remote files: uses HTTP range requests (kept for backward compatibility).
 */
public class PMTilesReader {

    private static final byte[] MAGIC = "PMTiles".getBytes();
    private static final int HEADER_SIZE = 127;

    private static final int COMPRESSION_NONE = 1;
    private static final int COMPRESSION_GZIP = 2;

    private final String url;          // for HTTP mode
    private final File localFile;      // for local mode
    private RandomAccessFile raf;      // open handle for local mode

    // Parsed header fields
    private long rootDirOffset;
    private long rootDirLength;
    private long leafDirsOffset;
    private long tileDataOffset;
    private int internalCompression;
    private int tileCompression;
    private int headerMinZoom;
    private int headerMaxZoom;

    private List<Entry> rootDirectory;
    private boolean opened = false;

    /** Create a reader for a remote PMTiles file via HTTP range requests. */
    public PMTilesReader(String url) {
        this.url = url;
        this.localFile = null;
    }

    /** Create a reader for a local PMTiles file. */
    public PMTilesReader(File file) {
        this.localFile = file;
        this.url = null;
    }

    public void open() throws IOException {
        if (localFile != null) {
            raf = new RandomAccessFile(localFile, "r");
        }

        byte[] headerBytes = readBytes(0, HEADER_SIZE);
        if (headerBytes.length < HEADER_SIZE) {
            throw new IOException("PMTiles header too short");
        }

        for (int i = 0; i < MAGIC.length; i++) {
            if (headerBytes[i] != MAGIC[i]) {
                throw new IOException("Not a PMTiles file");
            }
        }

        int version = headerBytes[7] & 0xFF;
        if (version != 3) {
            throw new IOException("Unsupported PMTiles version: " + version);
        }

        ByteBuffer buf = ByteBuffer.wrap(headerBytes).order(ByteOrder.LITTLE_ENDIAN);
        rootDirOffset = buf.getLong(8);
        rootDirLength = buf.getLong(16);
        leafDirsOffset = buf.getLong(40);
        tileDataOffset = buf.getLong(56);
        internalCompression = headerBytes[97] & 0xFF;
        tileCompression = headerBytes[98] & 0xFF;
        headerMinZoom = headerBytes[100] & 0xFF;
        headerMaxZoom = headerBytes[101] & 0xFF;

        byte[] rootDirData = readBytes(rootDirOffset, rootDirLength);
        rootDirData = decompressInternal(rootDirData);
        rootDirectory = deserializeDirectory(rootDirData);

        opened = true;
    }

    public int getMinZoom() { return headerMinZoom; }
    public int getMaxZoom() { return headerMaxZoom; }

    public byte[] getTile(int z, int x, int y) throws IOException {
        if (!opened) throw new IllegalStateException("Call open() first");

        long tileId = zxyToTileId(z, x, y);

        Entry entry = findEntry(rootDirectory, tileId);
        if (entry == null) return null;

        if (entry.runLength == 0) {
            byte[] leafData = readBytes(leafDirsOffset + entry.offset, entry.length);
            leafData = decompressInternal(leafData);
            List<Entry> leafDir = deserializeDirectory(leafData);
            entry = findEntry(leafDir, tileId);
            if (entry == null) return null;
        }

        byte[] tileData = readBytes(tileDataOffset + entry.offset, entry.length);
        return decompressTile(tileData);
    }

    public void close() {
        rootDirectory = null;
        opened = false;
        if (raf != null) {
            try { raf.close(); } catch (IOException e) { /* ignore */ }
            raf = null;
        }
    }

    // --- I/O abstraction ---

    private byte[] readBytes(long offset, long length) throws IOException {
        if (localFile != null) {
            return localRead(offset, length);
        } else {
            return httpRangeRequest(offset, length);
        }
    }

    private byte[] localRead(long offset, long length) throws IOException {
        byte[] data = new byte[(int) length];
        synchronized (raf) {
            raf.seek(offset);
            int total = 0;
            while (total < length) {
                int n = raf.read(data, total, (int) length - total);
                if (n < 0) break;
                total += n;
            }
            if (total < length) {
                byte[] trimmed = new byte[total];
                System.arraycopy(data, 0, trimmed, 0, total);
                return trimmed;
            }
        }
        return data;
    }

    private byte[] httpRangeRequest(long offset, long length) throws IOException {
        HttpURLConnection conn = (HttpURLConnection) new URL(url).openConnection();
        conn.setRequestProperty("Range", "bytes=" + offset + "-" + (offset + length - 1));
        conn.setRequestProperty("User-Agent", "TripPlanner/1.0");
        conn.setConnectTimeout(10000);
        conn.setReadTimeout(30000);

        int code = conn.getResponseCode();
        if (code != 200 && code != 206) {
            throw new IOException("HTTP " + code + " for range request");
        }

        InputStream is = conn.getInputStream();
        ByteArrayOutputStream baos = new ByteArrayOutputStream((int) length);
        byte[] buf = new byte[8192];
        int n;
        while ((n = is.read(buf)) != -1) baos.write(buf, 0, n);
        is.close();
        conn.disconnect();
        return baos.toByteArray();
    }

    // --- Directory entry lookup ---

    private Entry findEntry(List<Entry> directory, long tileId) {
        int lo = 0;
        int hi = directory.size() - 1;

        while (lo <= hi) {
            int mid = (lo + hi) >>> 1;
            Entry e = directory.get(mid);
            if (tileId < e.tileId) {
                hi = mid - 1;
            } else if (e.runLength > 0 && tileId >= e.tileId + e.runLength) {
                lo = mid + 1;
            } else if (e.runLength == 0 && tileId > e.tileId) {
                if (mid + 1 < directory.size() && tileId >= directory.get(mid + 1).tileId) {
                    lo = mid + 1;
                } else {
                    return e;
                }
            } else {
                return e;
            }
        }
        return null;
    }

    // --- Directory deserialization ---

    private List<Entry> deserializeDirectory(byte[] data) throws IOException {
        int[] pos = {0};

        int numEntries = (int) readVarint(data, pos);
        if (numEntries == 0) return new ArrayList<>();

        long[] tileIds = new long[numEntries];
        long lastId = 0;
        for (int i = 0; i < numEntries; i++) {
            long delta = readVarint(data, pos);
            tileIds[i] = lastId + delta;
            lastId = tileIds[i];
        }

        long[] runLengths = new long[numEntries];
        for (int i = 0; i < numEntries; i++) {
            runLengths[i] = readVarint(data, pos);
        }

        long[] lengths = new long[numEntries];
        for (int i = 0; i < numEntries; i++) {
            lengths[i] = readVarint(data, pos);
        }

        long[] offsets = new long[numEntries];
        for (int i = 0; i < numEntries; i++) {
            long v = readVarint(data, pos);
            if (i > 0 && v == 0) {
                offsets[i] = offsets[i - 1] + lengths[i - 1];
            } else {
                offsets[i] = v - 1;
            }
        }

        List<Entry> entries = new ArrayList<>(numEntries);
        for (int i = 0; i < numEntries; i++) {
            entries.add(new Entry(tileIds[i], offsets[i], lengths[i], runLengths[i]));
        }
        return entries;
    }

    private static long readVarint(byte[] data, int[] pos) {
        long result = 0;
        int shift = 0;
        while (pos[0] < data.length) {
            byte b = data[pos[0]++];
            result |= (long) (b & 0x7F) << shift;
            if ((b & 0x80) == 0) break;
            shift += 7;
        }
        return result;
    }

    // --- Hilbert curve ---

    static long zxyToTileId(int z, int x, int y) {
        if (z == 0) return 0;
        long base = (pow4(z) - 1) / 3;
        int n = 1 << z;
        return base + xy2d(n, x, y);
    }

    static int[] tileIdToZxy(long tileId) {
        if (tileId == 0) return new int[]{0, 0, 0};
        long acc = 0;
        for (int z = 0; z <= 30; z++) {
            long numTiles = pow4(z);
            if (acc + numTiles > tileId) {
                long pos = tileId - acc;
                int n = 1 << z;
                int[] xy = d2xy(n, pos);
                return new int[]{z, xy[0], xy[1]};
            }
            acc += numTiles;
        }
        throw new IllegalArgumentException("Invalid tile ID: " + tileId);
    }

    private static long pow4(int z) {
        return 1L << (2 * z);
    }

    private static long xy2d(int n, int x, int y) {
        long d = 0;
        for (int s = n / 2; s > 0; s /= 2) {
            int rx = (x & s) > 0 ? 1 : 0;
            int ry = (y & s) > 0 ? 1 : 0;
            d += (long) s * s * ((3 * rx) ^ ry);
            if (ry == 0) {
                if (rx == 1) {
                    x = s - 1 - x;
                    y = s - 1 - y;
                }
                int tmp = x;
                x = y;
                y = tmp;
            }
        }
        return d;
    }

    private static int[] d2xy(int n, long d) {
        int x = 0, y = 0;
        for (int s = 1; s < n; s *= 2) {
            int rx = ((int) (d / 2)) & 1;
            int ry = ((int) d ^ rx) & 1;
            if (ry == 0) {
                if (rx == 1) {
                    x = s - 1 - x;
                    y = s - 1 - y;
                }
                int tmp = x;
                x = y;
                y = tmp;
            }
            x += s * rx;
            y += s * ry;
            d /= 4;
        }
        return new int[]{x, y};
    }

    // --- Compression ---

    private byte[] decompressInternal(byte[] data) throws IOException {
        if (internalCompression == COMPRESSION_GZIP) return gunzip(data);
        return data;
    }

    private byte[] decompressTile(byte[] data) throws IOException {
        if (tileCompression == COMPRESSION_GZIP) return gunzip(data);
        return data;
    }

    private static byte[] gunzip(byte[] compressed) throws IOException {
        GZIPInputStream gis = new GZIPInputStream(new ByteArrayInputStream(compressed));
        ByteArrayOutputStream baos = new ByteArrayOutputStream(compressed.length * 3);
        byte[] buf = new byte[8192];
        int n;
        while ((n = gis.read(buf)) != -1) baos.write(buf, 0, n);
        gis.close();
        return baos.toByteArray();
    }

    static class Entry {
        final long tileId;
        final long offset;
        final long length;
        final long runLength;

        Entry(long tileId, long offset, long length, long runLength) {
            this.tileId = tileId;
            this.offset = offset;
            this.length = length;
            this.runLength = runLength;
        }
    }
}
