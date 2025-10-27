// bd.js
import mysql from "mysql2/promise";

export const pool = mysql.createPool({
  host: "btb6hubdqebszllhbb0i-mysql.services.clever-cloud.com",
  port: 3306,
  user: "uiqndzvfm7plxdsd",
  password: "ibJgywnXeNv2OVOZrnhB",
  database: "btb6hubdqebszllhbb0i",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});
