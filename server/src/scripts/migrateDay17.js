// One-off, idempotent schema hardening pass:
//   - requests.status and users.password_hash become NOT NULL — the app
//     never actually leaves these blank, but the schema let it.
//   - indexes on the columns we actually filter/sort by.
//   - a DB-level rule that an asset can only have one active assignment at
//     a time, via a generated column + unique index (MySQL has no partial
//     unique index, so this is the standard workaround: the generated
//     column is NULL for every inactive row, and NULL never collides with
//     NULL in a unique index — only two *active* rows for the same asset
//     would collide). This is what turns the assignment race condition
//     (fixed in assetController.js/requestController.js) into a hard
//     database error if it were ever somehow reintroduced, instead of
//     silent duplicate-assignment corruption.
//   - drops the unused audit_logs table.
//
// Every step checks for existing violations before altering, and aborts
// with a clear message instead of altering into a broken state. Safe to
// re-run: each step is a no-op once already applied.
import pool from "../config/db.js";

async function columnIsNullable(table, column) {
  const [rows] = await pool.query(
    `SELECT IS_NULLABLE FROM INFORMATION_SCHEMA.COLUMNS
     WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ? AND COLUMN_NAME = ?`,
    [table, column],
  );
  return rows[0]?.IS_NULLABLE === "YES";
}

async function indexExists(table, indexName) {
  const [rows] = await pool.query(
    `SELECT 1 FROM INFORMATION_SCHEMA.STATISTICS
     WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ? AND INDEX_NAME = ?`,
    [table, indexName],
  );
  return rows.length > 0;
}

async function columnExists(table, column) {
  const [rows] = await pool.query(
    `SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS
     WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ? AND COLUMN_NAME = ?`,
    [table, column],
  );
  return rows.length > 0;
}

async function tableExists(table) {
  const [rows] = await pool.query(
    `SELECT 1 FROM INFORMATION_SCHEMA.TABLES
     WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ?`,
    [table],
  );
  return rows.length > 0;
}

async function run() {
  // --- requests.status NOT NULL DEFAULT 'pending' ---
  if (await columnIsNullable("requests", "status")) {
    const [nullRows] = await pool.query(
      "SELECT COUNT(*) AS n FROM requests WHERE status IS NULL",
    );
    if (nullRows[0].n > 0) {
      throw new Error(
        `Refusing to alter requests.status — ${nullRows[0].n} row(s) have a NULL status. Fix or triage those first.`,
      );
    }
    await pool.query(
      `ALTER TABLE requests
       MODIFY status ENUM('pending','approved','rejected','completed','sent_for_repair')
       NOT NULL DEFAULT 'pending'`,
    );
    console.log("requests.status is now NOT NULL DEFAULT 'pending'");
  } else {
    console.log("requests.status already NOT NULL, skipping");
  }

  // --- users.password_hash NOT NULL ---
  if (await columnIsNullable("users", "password_hash")) {
    const [nullRows] = await pool.query(
      "SELECT COUNT(*) AS n FROM users WHERE password_hash IS NULL",
    );
    if (nullRows[0].n > 0) {
      throw new Error(
        `Refusing to alter users.password_hash — ${nullRows[0].n} row(s) have no password set. Fix or triage those first.`,
      );
    }
    await pool.query(
      `ALTER TABLE users MODIFY password_hash VARCHAR(255) NOT NULL`,
    );
    console.log("users.password_hash is now NOT NULL");
  } else {
    console.log("users.password_hash already NOT NULL, skipping");
  }

  // --- indexes on columns we actually filter/sort by ---
  const indexes = [
    { table: "assets", name: "idx_assets_status", columns: "status" },
    { table: "requests", name: "idx_requests_status", columns: "status" },
    {
      table: "asset_assignments",
      name: "idx_assignments_asset_active",
      columns: "asset_id, is_active",
    },
    {
      table: "asset_history",
      name: "idx_history_asset_created",
      columns: "asset_id, created_at",
    },
  ];
  for (const { table, name, columns } of indexes) {
    if (await indexExists(table, name)) {
      console.log(`${table}.${name} already exists, skipping`);
      continue;
    }
    await pool.query(`CREATE INDEX ${name} ON ${table} (${columns})`);
    console.log(`Added ${table}.${name} on (${columns})`);
  }

  // --- one active assignment per asset ---
  if (!(await columnExists("asset_assignments", "active_asset_id"))) {
    const [dupes] = await pool.query(
      `SELECT asset_id, COUNT(*) AS n FROM asset_assignments
       WHERE is_active = 1 GROUP BY asset_id HAVING COUNT(*) > 1`,
    );
    if (dupes.length > 0) {
      throw new Error(
        `Refusing to add the one-active-assignment rule — ${dupes.length} asset(s) already have more than one active assignment. Fix those rows first: ${JSON.stringify(dupes)}`,
      );
    }
    await pool.query(
      `ALTER TABLE asset_assignments
       ADD COLUMN active_asset_id INT
       GENERATED ALWAYS AS (IF(is_active = 1, asset_id, NULL)) STORED`,
    );
    console.log("Added asset_assignments.active_asset_id (generated column)");
  } else {
    console.log("asset_assignments.active_asset_id already exists, skipping");
  }

  if (!(await indexExists("asset_assignments", "uq_one_active_assignment"))) {
    await pool.query(
      `ALTER TABLE asset_assignments
       ADD UNIQUE KEY uq_one_active_assignment (active_asset_id)`,
    );
    console.log("Added unique key uq_one_active_assignment");
  } else {
    console.log("uq_one_active_assignment already exists, skipping");
  }

  // --- drop the unused audit_logs table ---
  if (await tableExists("audit_logs")) {
    const [rows] = await pool.query("SELECT COUNT(*) AS n FROM audit_logs");
    if (rows[0].n > 0) {
      throw new Error(
        `Refusing to drop audit_logs — it has ${rows[0].n} row(s) in it, so it's not actually unused. Investigate before dropping.`,
      );
    }
    await pool.query("DROP TABLE audit_logs");
    console.log("Dropped unused table audit_logs");
  } else {
    console.log("audit_logs already gone, skipping");
  }

  process.exit(0);
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
