package tech.bellevue.tripplanner;

import android.content.ContentValues;
import android.content.Context;
import android.database.Cursor;
import android.database.sqlite.SQLiteDatabase;
import android.database.sqlite.SQLiteOpenHelper;
import android.util.Log;

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Manages downloaded offline map PMTiles files and serves tiles from them.
 *
 * Each region corresponds to a local .pmtiles file. Tile lookups find the right
 * file by checking which region's bounding box contains the requested tile,
 * then read directly from the PMTiles file.
 */
public class OfflineMapStore extends SQLiteOpenHelper {

    private static final String TAG = "OfflineMapStore";
    private static final String DB_NAME = "offline_maps.db";
    private static final int DB_VERSION = 3;

    private static final String WORLD_BASEMAP_ASSET = "world-overview.pmtiles";
    private static final String WORLD_BASEMAP_FILE = "world-overview.pmtiles";

    private final Context context;

    // Cache of open PMTilesReader instances for complete regions
    private final Map<String, PMTilesReader> openReaders = new ConcurrentHashMap<>();
    private List<OfflineRegion> completeRegionCache = null;

    // Bundled world basemap reader (always available, zoom 0-4)
    private PMTilesReader worldReader;
    private boolean worldReaderInitialized = false;

    public OfflineMapStore(Context context) {
        super(context, DB_NAME, null, DB_VERSION);
        this.context = context;
    }

    @Override
    public void onCreate(SQLiteDatabase db) {
        db.execSQL("CREATE TABLE regions ("
                + "id TEXT PRIMARY KEY, "
                + "name TEXT NOT NULL, "
                + "country TEXT NOT NULL, "
                + "repo TEXT, "
                + "file_path TEXT, "
                + "download_url TEXT, "
                + "bbox_west REAL, bbox_south REAL, bbox_east REAL, bbox_north REAL, "
                + "max_zoom INTEGER DEFAULT 14, "
                + "size_bytes INTEGER DEFAULT 0, "
                + "downloaded_bytes INTEGER DEFAULT 0, "
                + "downloaded_at INTEGER, "
                + "status TEXT DEFAULT 'pending'"
                + ")");
    }

    @Override
    public void onUpgrade(SQLiteDatabase db, int oldVersion, int newVersion) {
        // Drop v1 tables (per-tile storage) and recreate
        db.execSQL("DROP TABLE IF EXISTS offline_tiles");
        db.execSQL("DROP TABLE IF EXISTS regions");
        onCreate(db);
    }

    /** Directory where PMTiles files are stored. */
    public File getMapsDir() {
        File dir = new File(context.getFilesDir(), "offline_maps");
        dir.mkdirs();
        return dir;
    }

    // --- Region CRUD ---

    public void insertRegion(OfflineRegion r) {
        SQLiteDatabase db = getWritableDatabase();
        ContentValues cv = new ContentValues();
        cv.put("id", r.id);
        cv.put("name", r.name);
        cv.put("country", r.country);
        cv.put("repo", r.repo);
        cv.put("file_path", r.filePath);
        cv.put("download_url", r.downloadUrl);
        cv.put("bbox_west", r.bboxWest);
        cv.put("bbox_south", r.bboxSouth);
        cv.put("bbox_east", r.bboxEast);
        cv.put("bbox_north", r.bboxNorth);
        cv.put("max_zoom", r.maxZoom);
        cv.put("size_bytes", r.sizeBytes);
        cv.put("downloaded_bytes", r.downloadedBytes);
        cv.put("downloaded_at", r.downloadedAt);
        cv.put("status", r.status);
        db.insertWithOnConflict("regions", null, cv, SQLiteDatabase.CONFLICT_REPLACE);
        invalidateCache();
    }

    public void updateDownloadProgress(String regionId, long downloadedBytes) {
        SQLiteDatabase db = getWritableDatabase();
        ContentValues cv = new ContentValues();
        cv.put("downloaded_bytes", downloadedBytes);
        db.update("regions", cv, "id=?", new String[]{regionId});
    }

    public void updateRegionStatus(String regionId, String status) {
        SQLiteDatabase db = getWritableDatabase();
        ContentValues cv = new ContentValues();
        cv.put("status", status);
        if ("complete".equals(status)) {
            cv.put("downloaded_at", System.currentTimeMillis());
        }
        db.update("regions", cv, "id=?", new String[]{regionId});
        invalidateCache();
    }

    public void updateFilePath(String regionId, String filePath, long sizeBytes) {
        SQLiteDatabase db = getWritableDatabase();
        ContentValues cv = new ContentValues();
        cv.put("file_path", filePath);
        cv.put("size_bytes", sizeBytes);
        cv.put("downloaded_bytes", sizeBytes);
        db.update("regions", cv, "id=?", new String[]{regionId});
    }

    public List<OfflineRegion> getAllRegions() {
        List<OfflineRegion> regions = new ArrayList<>();
        SQLiteDatabase db = getReadableDatabase();
        Cursor c = db.rawQuery("SELECT * FROM regions ORDER BY country, name", null);
        try {
            while (c.moveToNext()) {
                regions.add(cursorToRegion(c));
            }
        } finally {
            c.close();
        }
        return regions;
    }

    public void deleteRegion(String regionId) {
        // Close reader if open
        PMTilesReader reader = openReaders.remove(regionId);
        if (reader != null) reader.close();

        // Delete the file
        SQLiteDatabase db = getWritableDatabase();
        Cursor c = db.rawQuery("SELECT file_path FROM regions WHERE id=?", new String[]{regionId});
        try {
            if (c.moveToFirst()) {
                String path = c.getString(0);
                if (path != null) {
                    new File(path).delete();
                }
            }
        } finally {
            c.close();
        }
        db.delete("regions", "id=?", new String[]{regionId});
        invalidateCache();
    }

    public void deleteRegionsByCountry(String country) {
        SQLiteDatabase db = getWritableDatabase();
        Cursor c = db.rawQuery("SELECT id FROM regions WHERE country=?", new String[]{country});
        try {
            while (c.moveToNext()) {
                deleteRegion(c.getString(0));
            }
        } finally {
            c.close();
        }
    }

    public String getRegionsJson() {
        List<OfflineRegion> regions = getAllRegions();
        JSONArray arr = new JSONArray();
        for (OfflineRegion r : regions) {
            try {
                JSONObject obj = new JSONObject();
                obj.put("id", r.id);
                obj.put("name", r.name);
                obj.put("country", r.country);
                obj.put("repo", r.repo);
                obj.put("bboxWest", r.bboxWest);
                obj.put("bboxSouth", r.bboxSouth);
                obj.put("bboxEast", r.bboxEast);
                obj.put("bboxNorth", r.bboxNorth);
                obj.put("maxZoom", r.maxZoom);
                obj.put("sizeBytes", r.sizeBytes);
                obj.put("downloadedBytes", r.downloadedBytes);
                obj.put("downloadedAt", r.downloadedAt);
                obj.put("status", r.status);
                arr.put(obj);
            } catch (JSONException e) {
                // skip
            }
        }
        return arr.toString();
    }

    // --- Tile serving ---

    /**
     * Look up a tile across all complete regions' local PMTiles files,
     * falling back to the bundled world basemap for low zoom levels.
     * Returns decompressed MVT bytes or null if not found.
     */
    public byte[] getTile(int z, int x, int y) {
        // First check downloaded regions (higher detail)
        List<OfflineRegion> regions = getCompleteRegions();
        for (OfflineRegion r : regions) {
            if (z > r.maxZoom) continue;
            if (!r.containsTile(z, x, y)) continue;

            PMTilesReader reader = getOrOpenReader(r);
            if (reader == null) continue;

            try {
                byte[] data = reader.getTile(z, x, y);
                if (data != null) return data;
            } catch (IOException e) {
                Log.w(TAG, "Error reading tile from " + r.id, e);
            }
        }

        // Fall back to bundled world basemap (zoom 0-4)
        PMTilesReader world = getWorldReader();
        if (world != null && z <= 4) {
            try {
                byte[] data = world.getTile(z, x, y);
                if (data != null) return data;
            } catch (IOException e) {
                Log.w(TAG, "Error reading world basemap tile", e);
            }
        }
        return null;
    }

    private PMTilesReader getOrOpenReader(OfflineRegion region) {
        PMTilesReader reader = openReaders.get(region.id);
        if (reader != null) return reader;

        if (region.filePath == null) return null;
        File file = new File(region.filePath);
        if (!file.exists()) return null;

        try {
            reader = new PMTilesReader(file);
            reader.open();
            openReaders.put(region.id, reader);
            return reader;
        } catch (IOException e) {
            Log.e(TAG, "Failed to open PMTiles file for " + region.id, e);
            return null;
        }
    }

    private List<OfflineRegion> getCompleteRegions() {
        if (completeRegionCache != null) return completeRegionCache;
        List<OfflineRegion> result = new ArrayList<>();
        for (OfflineRegion r : getAllRegions()) {
            if ("complete".equals(r.status)) {
                result.add(r);
            }
        }
        completeRegionCache = result;
        return result;
    }

    private void invalidateCache() {
        completeRegionCache = null;
    }

    /** Check if any regions exist for a given repo slug. */
    public boolean hasRegionsForRepo(String repo) {
        SQLiteDatabase db = getReadableDatabase();
        Cursor c = db.rawQuery("SELECT COUNT(*) FROM regions WHERE repo=?", new String[]{repo});
        try {
            return c.moveToFirst() && c.getLong(0) > 0;
        } finally {
            c.close();
        }
    }

    public long getTotalStorageUsed() {
        SQLiteDatabase db = getReadableDatabase();
        Cursor c = db.rawQuery("SELECT COALESCE(SUM(size_bytes), 0) FROM regions WHERE status='complete'", null);
        try {
            if (c.moveToFirst()) return c.getLong(0);
            return 0;
        } finally {
            c.close();
        }
    }

    /**
     * Get the bundled world basemap reader, extracting from assets on first use.
     */
    private synchronized PMTilesReader getWorldReader() {
        if (worldReaderInitialized) return worldReader;
        worldReaderInitialized = true;

        File worldFile = new File(context.getFilesDir(), WORLD_BASEMAP_FILE);
        try {
            // Extract from assets if not present or outdated
            if (!worldFile.exists()) {
                InputStream is = context.getAssets().open(WORLD_BASEMAP_ASSET);
                java.io.FileOutputStream fos = new java.io.FileOutputStream(worldFile);
                byte[] buf = new byte[8192];
                int n;
                while ((n = is.read(buf)) != -1) fos.write(buf, 0, n);
                fos.close();
                is.close();
            }
            worldReader = new PMTilesReader(worldFile);
            worldReader.open();
        } catch (IOException e) {
            Log.e(TAG, "Failed to open world basemap", e);
            worldReader = null;
        }
        return worldReader;
    }

    public void closeAllReaders() {
        for (PMTilesReader reader : openReaders.values()) {
            reader.close();
        }
        openReaders.clear();
        if (worldReader != null) {
            worldReader.close();
            worldReader = null;
            worldReaderInitialized = false;
        }
    }

    // --- Helpers ---

    private OfflineRegion cursorToRegion(Cursor c) {
        OfflineRegion r = new OfflineRegion();
        r.id = c.getString(c.getColumnIndexOrThrow("id"));
        r.name = c.getString(c.getColumnIndexOrThrow("name"));
        r.country = c.getString(c.getColumnIndexOrThrow("country"));
        r.repo = c.getString(c.getColumnIndexOrThrow("repo"));
        r.filePath = c.getString(c.getColumnIndexOrThrow("file_path"));
        r.downloadUrl = c.getString(c.getColumnIndexOrThrow("download_url"));
        r.bboxWest = c.getDouble(c.getColumnIndexOrThrow("bbox_west"));
        r.bboxSouth = c.getDouble(c.getColumnIndexOrThrow("bbox_south"));
        r.bboxEast = c.getDouble(c.getColumnIndexOrThrow("bbox_east"));
        r.bboxNorth = c.getDouble(c.getColumnIndexOrThrow("bbox_north"));
        r.maxZoom = c.getInt(c.getColumnIndexOrThrow("max_zoom"));
        r.sizeBytes = c.getLong(c.getColumnIndexOrThrow("size_bytes"));
        r.downloadedBytes = c.getLong(c.getColumnIndexOrThrow("downloaded_bytes"));
        r.downloadedAt = c.getLong(c.getColumnIndexOrThrow("downloaded_at"));
        r.status = c.getString(c.getColumnIndexOrThrow("status"));
        return r;
    }
}
