// One-off, idempotent schema change: lets the admin attach text notes to a
// request instead of everything being buried in asset_history.
//
// Two new nullable columns on `requests`:
//   1. repair_details — the admin's diagnosis/plan, captured when approving
//      a "repair" request (pending -> sent_for_repair).
//   2. completion_notes — the admin's closing note, captured when marking a
//      "return" or "repair" request completed.
//
// Safe to re-run: only alters what isn't already in place.
import pool from '../config/db.js';

async function addColumnIfMissing(column, definition) {
  const [rows] = await pool.query(
    `SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS
     WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'requests' AND COLUMN_NAME = ?`,
    [column]
  );

  if (rows.length === 0) {
    await pool.query(`ALTER TABLE requests ADD COLUMN ${column} ${definition}`);
    console.log(`Added requests.${column}`);
  } else {
    console.log(`requests.${column} already exists, skipping`);
  }
}

async function run() {
  await addColumnIfMissing('repair_details', 'TEXT NULL AFTER reason');
  await addColumnIfMissing('completion_notes', 'TEXT NULL AFTER repair_details');

  process.exit(0);
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
