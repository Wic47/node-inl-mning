import sql from "mysql2/promise";
import bcrypt from "bcrypt";

async function getConnection() {
  return sql.createConnection({
    host: "localhost",
    user: "root",
    password: "",
    database: "forum",
  });
}

async function addMessage(message) {
  let conn = await getConnection();
  conn.query(`Insert into messages (message) values ("${message}")`);
  conn.end();
}

async function getMessages() {
  let conn = await getConnection();
  let query = await conn.query(
    "select message,time from messages order by time desc"
  );
  let messages = [];
  for (let row of query[0]) {
    messages.push({ message: row.message, time: row.time.toLocaleString() });
  }
  conn.end();
  return messages;
}

async function getMessages2() {
  let conn = await getConnection();
  let query = await conn.query("select message,time from messages");
  let messages = [];
  for (let row of query[0]) {
    messages.push({ message: row.message, time: row.time.toLocaleString() });
  }
  conn.end();
  return messages;
}

async function createUser(username, password) {
  let conn = await getConnection();
  bcrypt.hash(password, 10, async (err, hash) => {
    try {
      conn
        .query(
          `insert into users (username, password) values ("${username}","${hash}");`
        )
        .then(() => {
          conn.end();
        });
    } catch (err) {
      console.log(err);
    }
  });
}

async function getLoginInfo(username) {
  let conn = await getConnection();
  let query = await conn.query(
    `select password,id from users where username = "${username}"`
  );
  conn.end();
  return { password: query[0][0].password, id: query[0][0].id };
}

export { addMessage, getMessages, getMessages2, createUser, getLoginInfo };
