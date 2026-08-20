// One-off, idempotent schema change for Day 8 (Returns and Repairs).
//
// Two changes to `requests`:
//   1. status gains a 'sent_for_repair' value — repair requests move
//      pending -> sent_for_repair (on approval) -> completed (on repair
//      completion), skipping the generic 'approved' resting state.
//   2. acknowledged_at (nullable timestamp) — used only by "return" type
//      requests, so the employee can confirm they've physically handed the
//      asset back once the admin marks the return completed. Asset/repair
//      requests keep using the existing asset_assignments.acknowledged_at
//      mechanism instead, since those involve a real assignment event.
//
// Safe to re-run: only alters what isn't already in place.
import pool from '../config/db.js';

async function run() {
  const [statusRows] = await pool.query(
    `SELECT COLUMN_TYPE FROM INFORMATION_SCHEMA.COLUMNS
     WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'requests' AND COLUMN_NAME = 'status'`
  );

  if (statusRows.length > 0 && !statusRows[0].COLUMN_TYPE.includes('sent_for_repair')) {
    await pool.query(
      `ALTER TABLE requests MODIFY status ENUM('pending','approved','rejected','completed','sent_for_repair') NULL`
    );
    console.log('Added "sent_for_repair" to requests.status');
  } else {
    console.log('requests.status already includes "sent_for_repair", skipping');
  }

  const [ackRows] = await pool.query(
    `SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS
     WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'requests' AND COLUMN_NAME = 'acknowledged_at'`
  );

  if (ackRows.length === 0) {
    await pool.query(`ALTER TABLE requests ADD COLUMN acknowledged_at TIMESTAMP NULL DEFAULT NULL AFTER reviewed_at`);
    console.log('Added requests.acknowledged_at');
  } else {
    console.log('requests.acknowledged_at already exists, skipping');
  }

  process.exit(0);
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
