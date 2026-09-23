// mysql connection pool, everything else just imports this
import mysql from "mysql2/promise";
import dotenv from "dotenv";

dotenv.config();

// host/user/password/database have no sensible default — the app can't
// run without them, so a missing one asserting non-null (and failing loudly
// when the pool tries to connect) is the same behavior this already had,
// just typed honestly instead of silently accepting `undefined`.
const pool = mysql.createPool({
  host: process.env.DB_HOST!,
  port: process.env.DB_PORT ? Number(process.env.DB_PORT) : 3306,
  user: process.env.DB_USER!,
  password: process.env.DB_PASSWORD!,
  database: process.env.DB_NAME!,
  waitForConnections: true,
  connectionLimit: 10,
});

export default pool;
