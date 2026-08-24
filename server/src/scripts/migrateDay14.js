// One-off, idempotent schema change: lets a request's detail page show a
// full lifecycle timeline (submitted -> reviewed -> completed -> [acked]),
// not just its current status. created_at, reviewed_at/reviewed_by, and
// acknowledged_at already exist — this adds the missing "completed" leg:
//
// New nullable columns on `requests`:
//   completed_at — set whenever a request reaches 'completed'
//                  (asset assigned / return completed / repair completed)
//   completed_by — the admin who did it
//
// Safe to re-run: only alters what isn't already in place.
import pool from '../config/db.js';

async function run() {
  const [rows] = await pool.query(
    `SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS
     WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'requests' AND COLUMN_NAME IN ('completed_at', 'completed_by')`
  );
  const existing = new Set(rows.map((r) => r.COLUMN_NAME));

  if (!existing.has('completed_at')) {
    await pool.query(`ALTER TABLE requests ADD COLUMN completed_at TIMESTAMP NULL AFTER reviewed_at`);
    console.log('Added requests.completed_at');
  } else {
    console.log('requests.completed_at already exists, skipping');
  }

  if (!existing.has('completed_by')) {
    await pool.query(`ALTER TABLE requests ADD COLUMN completed_by INT NULL AFTER completed_at`);
    console.log('Added requests.completed_by');
  } else {
    console.log('requests.completed_by already exists, skipping');
  }

  process.exit(0);
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
