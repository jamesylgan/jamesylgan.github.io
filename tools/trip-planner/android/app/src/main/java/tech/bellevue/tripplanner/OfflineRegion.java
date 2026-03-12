package tech.bellevue.tripplanner;

/**
 * Metadata for a downloaded offline map region (PMTiles file).
 */
public class OfflineRegion {

    public String id;          // manifest key, e.g. "spain--madrid"
    public String name;        // display name, e.g. "Madrid"
    public String country;     // parent key, e.g. "spain"
    public String repo;        // source repo slug, e.g. "jamesylgan/Spain-pmtiles"
    public String filePath;    // local path to downloaded .pmtiles file
    public String downloadUrl; // GitHub release asset URL
    public double bboxWest;
    public double bboxSouth;
    public double bboxEast;
    public double bboxNorth;
    public int maxZoom;
    public long sizeBytes;         // expected total file size
    public long downloadedBytes;   // bytes downloaded so far
    public long downloadedAt;      // epoch millis when completed
    public String status;          // pending, downloading, complete, failed

    public OfflineRegion() {
        this.status = "pending";
        this.maxZoom = 14;
    }

    public OfflineRegion(String id, String name, String country, String repo,
                         String downloadUrl,
                         double bboxWest, double bboxSouth, double bboxEast, double bboxNorth,
                         int maxZoom, long sizeBytes) {
        this.id = id;
        this.name = name;
        this.country = country;
        this.repo = repo;
        this.downloadUrl = downloadUrl;
        this.bboxWest = bboxWest;
        this.bboxSouth = bboxSouth;
        this.bboxEast = bboxEast;
        this.bboxNorth = bboxNorth;
        this.maxZoom = maxZoom;
        this.sizeBytes = sizeBytes;
        this.status = "pending";
    }

    /**
     * Check if a tile coordinate falls within this region's bounding box.
     */
    public boolean containsTile(int z, int x, int y) {
        int n = 1 << z;
        double tileLonW = x * 360.0 / n - 180.0;
        double tileLonE = (x + 1) * 360.0 / n - 180.0;
        double tileLatN = Math.toDegrees(Math.atan(Math.sinh(Math.PI * (1 - 2.0 * y / n))));
        double tileLatS = Math.toDegrees(Math.atan(Math.sinh(Math.PI * (1 - 2.0 * (y + 1) / n))));

        return tileLonE > bboxWest && tileLonW < bboxEast
                && tileLatN > bboxSouth && tileLatS < bboxNorth;
    }
}
