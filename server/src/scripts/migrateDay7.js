// One-off, idempotent schema fix for Day 7 (Asset Requests).
//
// `requests.resulting_asset_id` was created with a UNIQUE index, which
// assumes each asset is ever the fulfillment target of at most one request
// in its whole lifetime. That breaks the normal asset lifecycle: an asset
// gets returned, goes back to "available", and then legitimately fulfills
// a second (or third) request down the line — that second assignment hits
// a duplicate-key error under the UNIQUE constraint. This swaps it for a
// plain (non-unique) index, keeping the lookup performance without the
// incorrect constraint.
//
// Safe to re-run: only alters the index if it's currently unique.
import pool from '../config/db.js';

async function run() {
  const [rows] = await pool.query(
    `SELECT NON_UNIQUE FROM INFORMATION_SCHEMA.STATISTICS
     WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'requests' AND COLUMN_NAME = 'resulting_asset_id'
     LIMIT 1`
  );

  if (rows.length > 0 && rows[0].NON_UNIQUE === 0) {
    // The FK constraint on resulting_asset_id needs a covering index at all
    // times, so the replacement has to exist before the unique one is
    // dropped (MySQL refuses to drop the last index backing an FK).
    await pool.query('ALTER TABLE requests ADD INDEX resulting_asset_id_idx (resulting_asset_id)');
    await pool.query('ALTER TABLE requests DROP INDEX resulting_asset_id');
    await pool.query('ALTER TABLE requests RENAME INDEX resulting_asset_id_idx TO resulting_asset_id');
    console.log('Replaced UNIQUE index on requests.resulting_asset_id with a plain index');
  } else {
    console.log('requests.resulting_asset_id index is already non-unique, skipping');
  }

  process.exit(0);
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
