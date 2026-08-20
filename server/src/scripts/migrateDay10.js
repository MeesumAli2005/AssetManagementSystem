// One-off, idempotent schema change: lets the admin leave a note visible to
// the employee whenever a request is approved or rejected, separate from
// repair_details (which stays admin-only/private — see requestController).
//
// New nullable column on `requests`:
//   review_notes — set on /review (approve or reject), any request type.
//
// Safe to re-run: only alters what isn't already in place.
import pool from '../config/db.js';

async function run() {
  const [rows] = await pool.query(
    `SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS
     WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'requests' AND COLUMN_NAME = 'review_notes'`
  );

  if (rows.length === 0) {
    await pool.query(`ALTER TABLE requests ADD COLUMN review_notes TEXT NULL AFTER completion_notes`);
    console.log('Added requests.review_notes');
  } else {
    console.log('requests.review_notes already exists, skipping');
  }

  process.exit(0);
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
