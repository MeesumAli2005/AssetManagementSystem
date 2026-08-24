// One-off, idempotent schema change: adds a "disposed" status, distinct
// from "retired" — retired means pulled from service but still around;
// disposed means physically gone for good. No separate table for disposed
// assets — same `assets` row, just a terminal status, same as retired.
//
// Changes:
//   assets.status       — add 'disposed' to the enum
//   assets.disposed_at  — new nullable timestamp, set when disposed
//   asset_history.event_type — add 'disposal' so it shows up in the asset's
//                              history timeline like every other event
//
// Safe to re-run: only alters what isn't already in place.
import pool from '../config/db.js';

async function run() {
  const [statusCol] = await pool.query(
    `SELECT COLUMN_TYPE FROM INFORMATION_SCHEMA.COLUMNS
     WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'assets' AND COLUMN_NAME = 'status'`
  );

  if (!statusCol[0].COLUMN_TYPE.includes("'disposed'")) {
    await pool.query(
      `ALTER TABLE assets MODIFY COLUMN status
       ENUM('available','assigned','under_repair','retired','disposed') NOT NULL DEFAULT 'available'`
    );
    console.log("Added 'disposed' to assets.status");
  } else {
    console.log("assets.status already has 'disposed', skipping");
  }

  const [disposedAtCol] = await pool.query(
    `SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS
     WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'assets' AND COLUMN_NAME = 'disposed_at'`
  );

  if (disposedAtCol.length === 0) {
    await pool.query(`ALTER TABLE assets ADD COLUMN disposed_at TIMESTAMP NULL AFTER updated_at`);
    console.log('Added assets.disposed_at');
  } else {
    console.log('assets.disposed_at already exists, skipping');
  }

  const [eventTypeCol] = await pool.query(
    `SELECT COLUMN_TYPE FROM INFORMATION_SCHEMA.COLUMNS
     WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'asset_history' AND COLUMN_NAME = 'event_type'`
  );

  if (!eventTypeCol[0].COLUMN_TYPE.includes("'disposal'")) {
    await pool.query(
      `ALTER TABLE asset_history MODIFY COLUMN event_type
       ENUM('purchase','assignment','return','repair','status_change','condition_change','retirement','disposal','acknowledgement','usage_state_change') NOT NULL`
    );
    console.log("Added 'disposal' to asset_history.event_type");
  } else {
    console.log("asset_history.event_type already has 'disposal', skipping");
  }

  process.exit(0);
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
