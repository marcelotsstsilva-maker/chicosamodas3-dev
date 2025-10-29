import mysql from "mysql2/promise";

export const pool = mysql.createPool({
  host: "gondola.proxy.rlwy.net",
  port: 22200,
  user: "root",
  password: "KvFWKQNwfssKKUbAJnvLrrxFWoyrVMJM",
  database: "railway",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  ssl: {
    rejectUnauthorized: false, // necessário no Render
  },
});


