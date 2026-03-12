package tech.bellevue.tripplanner;

import android.content.Context;
import android.database.Cursor;
import android.database.sqlite.SQLiteDatabase;
import android.database.sqlite.SQLiteOpenHelper;
import android.database.sqlite.SQLiteStatement;

/**
 * SQLite-backed cache for OSM map tiles.
 *
 * Tiles are keyed by z/x/y coordinates. When the WebView requests a tile from
 * tile.openstreetmap.org, MainActivity checks this cache first. On a cache miss
 * the tile is fetched from the network and stored here for future offline use.
 *
 * The cache can also be pre-populated via a "Download Region" feature (future).
 */
public class TileCache extends SQLiteOpenHelper {

    private static final String DB_NAME = "tile_cache.db";
    private static final int DB_VERSION = 1;
    private static final long MAX_AGE_MS = 30L * 24 * 60 * 60 * 1000; // 30 days

    public TileCache(Context context) {
        super(context, DB_NAME, null, DB_VERSION);
    }

    @Override
    public void onCreate(SQLiteDatabase db) {
        db.execSQL("CREATE TABLE tiles ("
                + "z INTEGER NOT NULL, "
                + "x INTEGER NOT NULL, "
                + "y INTEGER NOT NULL, "
                + "data BLOB NOT NULL, "
                + "timestamp INTEGER NOT NULL, "
                + "PRIMARY KEY (z, x, y))");
    }

    @Override
    public void onUpgrade(SQLiteDatabase db, int oldVersion, int newVersion) {
        db.execSQL("DROP TABLE IF EXISTS tiles");
        onCreate(db);
    }

    /**
     * Returns cached tile PNG bytes, or null on cache miss / expired entry.
     */
    public byte[] getTile(int z, int x, int y) {
        SQLiteDatabase db = getReadableDatabase();
        Cursor c = db.rawQuery(
                "SELECT data, timestamp FROM tiles WHERE z=? AND x=? AND y=?",
                new String[]{String.valueOf(z), String.valueOf(x), String.valueOf(y)});
        try {
            if (c.moveToFirst()) {
                long timestamp = c.getLong(1);
                if (System.currentTimeMillis() - timestamp < MAX_AGE_MS) {
                    return c.getBlob(0);
                }
            }
            return null;
        } finally {
            c.close();
        }
    }

    /**
     * Stores a tile in the cache (insert or replace).
     */
    public void putTile(int z, int x, int y, byte[] data) {
        SQLiteDatabase db = getWritableDatabase();
        SQLiteStatement stmt = db.compileStatement(
                "INSERT OR REPLACE INTO tiles (z, x, y, data, timestamp) VALUES (?, ?, ?, ?, ?)");
        stmt.bindLong(1, z);
        stmt.bindLong(2, x);
        stmt.bindLong(3, y);
        stmt.bindBlob(4, data);
        stmt.bindLong(5, System.currentTimeMillis());
        stmt.executeInsert();
    }

    /**
     * Removes tiles older than MAX_AGE_MS.
     */
    public void evictExpired() {
        SQLiteDatabase db = getWritableDatabase();
        db.delete("tiles", "timestamp < ?",
                new String[]{String.valueOf(System.currentTimeMillis() - MAX_AGE_MS)});
    }
}
