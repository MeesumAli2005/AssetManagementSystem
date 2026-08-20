// One-off, idempotent schema migration for Day 6 (Asset Assignment).
//
// Adds:
//   - assets.usage_state ('active' | 'dormant') — an employee-settable flag,
//     independent of `status`, used for the My Assets summary buckets.
//   - 'acknowledgement' and 'usage_state_change' event types on asset_history.
//
// Safe to re-run: checks INFORMATION_SCHEMA before adding the column, and
// the enum MODIFY is a no-op if it already matches.
import pool from '../config/db.js';

async function columnExists(table, column) {
  const [rows] = await pool.query(
    `SELECT COUNT(*) AS count FROM INFORMATION_SCHEMA.COLUMNS
     WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ? AND COLUMN_NAME = ?`,
    [table, column]
  );
  return rows[0].count > 0;
}

async function run() {
  if (!(await columnExists('assets', 'usage_state'))) {
    await pool.query(
      "ALTER TABLE assets ADD COLUMN usage_state ENUM('active','dormant') NOT NULL DEFAULT 'active' AFTER `condition`"
    );
    console.log('Added assets.usage_state');
  } else {
    console.log('assets.usage_state already exists, skipping');
  }

  await pool.query(
    `ALTER TABLE asset_history MODIFY COLUMN event_type
     ENUM('purchase','assignment','return','repair','status_change','condition_change','retirement','acknowledgement','usage_state_change')
     NOT NULL`
  );
  console.log('asset_history.event_type enum is up to date');

  process.exit(0);
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
