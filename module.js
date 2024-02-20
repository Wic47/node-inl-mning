import sql from "mysql2/promise";
import * as db from 

async function getConnection() {
  return sql.createConnection({
    host: "localhost",
    user: "root",
    password: "",
    database: "databas",
  });
}
