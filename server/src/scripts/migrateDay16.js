// One-off, idempotent data fix: /uploads was moved under /api (so it's
// reachable through the same router as everything else, instead of being
// mounted separately on the bare app). New uploads already store their
// file_url with the /api prefix — this rewrites the ones saved before the
// move, which still point at the old, now-dead /uploads/... path.
//
// Safe to re-run: the WHERE clause only matches rows that haven't been
// rewritten yet.
import pool from "../config/db.js";

async function run() {
  const [result] = await pool.query(
    `UPDATE asset_documents
     SET file_url = CONCAT('/api', file_url)
     WHERE file_url LIKE '/uploads/%'`,
  );

  console.log(`Rewrote ${result.affectedRows} asset_documents.file_url value(s)`);

  process.exit(0);
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
