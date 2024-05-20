import sql from "mysql2/promise";
import bcrypt from "bcrypt";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime.js";
import sv from "dayjs/locale/sv.js";
dayjs.extend(relativeTime);
dayjs.locale("sv");

async function getConnection() {
  return sql.createConnection({
    host: "localhost",
    user: "root",
    password: "",
    database: "forum",
  });
}

async function createUser(username, password) {
  let conn = await getConnection();
  let hash = await bcrypt.hash(password, 10);
  conn
    .execute(
      "insert into users (username, password) values (?, ?)",
      [username, hash] // det finns en unique-constraint på username också så att det inte kan finnas flera av samma användarnamn
    )
    .catch((e) => {
      console.error(e);
    });
  let [[query2]] = await conn.execute(
    "select id from users where username = ?",
    [username]
  );
  conn.end();
  return query2.id;
}

async function getPassword(username) {
  let conn = await getConnection();
  let [[query]] = await conn
    .execute("select password,id from users where username = ?", [username])
    .catch((e) => {
      console.error(e);
    });
  if (query != undefined) {
    conn.end();
    return { password: query.password, id: query.id };
  }
  conn.end();
}

async function addPost(title, body, userid) {
  let conn = await getConnection();
  let query = await conn.execute(
    "insert into posts (userid, title, bodyText, date) values (?, ?, ?, NOW())",
    [userid, title, body]
  );
  conn.end();
}

async function getPosts() {
  let conn = await getConnection();
  let [query] = await conn.query("select * from posts order by date desc");
  let posts = [];
  for (let i = 0; i < query.length; i++) {
    const e = query[i];
    let date = dayjs(e.date).fromNow();
    let [[user]] = await conn.execute(
      "select username from users where id = ?",
      [e.userid]
    );
    posts.push({
      username: user.username,
      title: e.title,
      bodyText: e.bodyText,
      date: date,
      postid: e.id,
    });
  }
  conn.end();
  return posts;
}

async function getPostById(postid) {
  let conn = await getConnection();
  let post;
  let [[query]] = await conn.execute("select * from posts where id = ?", [
    postid,
  ]);
  let date = dayjs(query.date).fromNow();
  let [[user]] = await conn.execute("select username from users where id = ?", [
    query.userid,
  ]);
  post = {
    username: user.username,
    title: query.title,
    bodyText: query.bodyText,
    date: date,
  };
  conn.end();
  return post;
}

async function getPostsById(id) {
  let conn = await getConnection();
  let posts = [];
  let [query] = await conn.execute("select * from posts where userid = ?", [
    id,
  ]);
  for (let i = 0; i < query.length; i++) {
    const e = query[i];
    let date = dayjs(e.date).fromNow();
    posts.push({
      title: e.title,
      bodyText: e.bodyText,
      date: date,
      postid: e.id,
    });
  }

  conn.end();
  return posts;
}

async function addComment(userid, bodyText, parent) {
  let conn = await getConnection();
  let query = conn.execute(
    "INSERT INTO comments (userid, bodyText, parent, date) VALUES (?, ?, ?, NOW())",
    [userid, bodyText, parent]
  );
  conn.end();
}

async function getCommentsByPostId(postid) {
  let conn = await getConnection();
  let [query] = await conn
    .execute("SELECT * FROM comments WHERE parent = ? order by date desc", [
      postid,
    ])
    .catch((e) => {
      console.log(e);
    });
  let comments = [];
  for (let i = 0; i < query.length; i++) {
    const e = query[i];
    let date = dayjs(e.date).fromNow();
    let [[user]] = await conn.execute(
      "select username from users where id = ?",
      [e.userid]
    );
    comments.push({
      user: user.username,
      bodyText: e.bodyText,
      date: date,
    });
  }
  conn.end();
  return comments;
}

async function getPostIds(userid) {
  let conn = await getConnection();
  let ids = [];
  let [query] = await conn.execute("select id from posts where userid = ?", [
    userid,
  ]);
  for (let i = 0; i < query.length; i++) {
    const e = query[i];
    ids.push(e.id);
  }
  conn.end();
  return ids;
}

async function deletePost(postid) {
  let conn = await getConnection();
  await conn.execute("delete from posts where id = ?", [postid]); // Tar även bort relevanta kommentarer från databasen genom cascade delete relation
  conn.end();
}

async function getComments(userid) {
  let conn = await getConnection();
  let comments = [];
  let [query] = await conn.execute(
    `SELECT comments.bodyText, comments.parent, comments.userid, comments.id as commentid,comments.date, posts.id, posts.title, users.id
    FROM comments
    inner JOIN posts ON comments.parent = posts.id
    inner JOIN users ON comments.userid = users.id
    where users.id = ?`,
    [userid]
  );
  for (let i = 0; i < query.length; i++) {
    const e = query[i];
    comments.push({
      bodyText: e.bodyText,
      title: e.title,
      date: dayjs(e.date).fromNow(),
      id: e.commentid,
    });
  }
  conn.end();
  return comments;
}

async function deleteComment(commentid) {
  let conn = await getConnection();
  await conn.execute("delete from comments where id = ?", [commentid]);
  conn.end();
}

async function getCommentIds(userid) {
  let conn = await getConnection();
  let ids = [];
  let [query] = await conn.execute("select id from comments where userid = ?", [
    userid,
  ]);
  for (let i = 0; i < query.length; i++) {
    const e = query[i];
    ids.push(e.id);
  }
  conn.end();
  return ids;
}

async function usernameExists(username) {
  let conn = await getConnection();
  let [[query]] = await conn.execute(
    "select exists (select username from users where username = ?)",
    [username]
  );
  let [id] = Object.values(query);
  if (id == 1) {
    return true;
  } else return false;
}

export {
  createUser,
  getPassword,
  addPost,
  getPosts,
  getPostById,
  getPostsById,
  addComment,
  getCommentsByPostId,
  getPostIds,
  deletePost,
  getComments,
  usernameExists,
  deleteComment,
  getCommentIds,
};
