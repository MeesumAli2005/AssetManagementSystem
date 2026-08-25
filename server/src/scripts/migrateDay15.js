// One-off, idempotent schema change: adds a "brand" column so asset
// creation can derive its display name (brand + category + id) instead of
// the admin typing a name/asset_tag by hand. Nullable at the DB level,
// same pattern as `name` — required-ness for new assets is enforced in
// createAsset's JS validation, not a DB constraint (existing rows have no
// brand value and can't retroactively satisfy a NOT NULL default).
//
// Safe to re-run: only alters what isn't already in place.
import pool from '../config/db.js';

async function run() {
  const [rows] = await pool.query(
    `SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS
     WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'assets' AND COLUMN_NAME = 'brand'`
  );

  if (rows.length === 0) {
    await pool.query(`ALTER TABLE assets ADD COLUMN brand VARCHAR(100) NULL AFTER category_id`);
    console.log('Added assets.brand');
  } else {
    console.log('assets.brand already exists, skipping');
  }

  process.exit(0);
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
