// One-off, idempotent schema change: lets the admin leave freeform internal
// notes on a request at any time, regardless of its status (pending,
// approved, rejected, completed, sent_for_repair) — a running paper trail,
// not a single field. Each note records who wrote it and what the request's
// status was at that moment, so the trail stays meaningful even after the
// request moves on.
//
// New table: request_notes
//   id, request_id (FK requests), admin_id (FK users),
//   note, status_at_time, created_at
//
// Admin-only, like repair_details — never shown to the employee.
//
// Safe to re-run: only creates what isn't already in place.
import pool from '../config/db.js';

async function run() {
  const [rows] = await pool.query(
    `SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES
     WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'request_notes'`
  );

  if (rows.length === 0) {
    await pool.query(`
      CREATE TABLE request_notes (
        id INT AUTO_INCREMENT PRIMARY KEY,
        request_id INT NOT NULL,
        admin_id INT NOT NULL,
        note TEXT NOT NULL,
        status_at_time ENUM('pending','approved','rejected','completed','sent_for_repair') NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (request_id) REFERENCES requests(id),
        FOREIGN KEY (admin_id) REFERENCES users(id)
      )
    `);
    console.log('Created request_notes table');
  } else {
    console.log('request_notes already exists, skipping');
  }

  process.exit(0);
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
