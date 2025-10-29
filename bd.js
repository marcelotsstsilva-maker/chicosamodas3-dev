// bd.js
import mysql from "mysql2/promise";

export const pool = mysql.createPool({
  host: "btrjdgtvkjxwwdhabaxu-mysql.services.clever-cloud.com",
  port: 3306,
  user: "ugqdqh8g9q15zwfr",
  password: "qimE9z4Wbqs13i7Q2PS8",
  database: "btrjdgtvkjxwwdhabaxu",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});
