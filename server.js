import express from "express";
import * as db from "./module.js";
import bodyParser from "body-parser";
import { engine } from "express-handlebars";
import { Server } from "socket.io";
import http from "http";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import cors from "cors";

const app = express();
const port = 3000;
const server = http.createServer(app);
const io = new Server(server);

io.on("connection", (socket) => {});

app.use(bodyParser.json());
app.use(express.static("public"));
app.engine("handlebars", engine());
app.set("view engine", "handlebars");
app.set("views", "./views");
app.use(cors());

app.get("/", (req, res) => {
  res.render("login");
});

app.get("/main", async (req, res) => {
  // Det här projektet var huvudsakligen gjort på en skärm med upplösning 2560x1440 så vissa saker kanske inte ser så bra ut. Notera att det även finns sql querys för att skapa tabellerna som jag använde i en fil i repositoryt .
  fetch("http://localhost:3000/auth", {
    method: "GET",
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${req.query.session}`,
    },
  })
    .then((res) => res.json())
    .then(async (decoded) => {
      if (decoded.sub != null) {
        let posts = await db.getPosts();
        let userPosts = await db.getPostsById(decoded.sub);
        let comments = await db.getComments(decoded.sub);
        res.render("mainsite", {
          posts: posts,
          oldPosts: userPosts,
          comments: comments,
          name: decoded.name,
        });
      }
    });
});

app.post("/", async (req, res) => {
  if (
    req.body &&
    req.body.usernameR &&
    req.body.passwordR &&
    req.body.username == null &&
    req.body.password == null
  ) {
    let userExists = await db.usernameExists(req.body.usernameR);
    if (!userExists) {
      let id = await db.createUser(req.body.usernameR, req.body.passwordR);
      let token = jwt.sign(
        {
          sub: id,
          name: req.body.usernameR,
        },
        "hilmerärkort",
        { expiresIn: "1h" }
      );
      res.json(token);
    } else {
      res.json(401);
    }
  }
  if (
    req.body &&
    req.body.username &&
    req.body.password &&
    req.body.usernameR == null &&
    req.body.passwordR == null
  ) {
    let logininfo = await db.getPassword(req.body.username);
    if (logininfo != null) {
      bcrypt.compare(req.body.password, logininfo.password, (err, result) => {
        if (result) {
          let token = jwt.sign(
            {
              sub: logininfo.id,
              name: req.body.username,
            },
            "hilmerärkort",
            { expiresIn: "1h" }
          );
          res.json(token);
        } else {
          console.log(err);
        }
      });
    }
  }
});

app.post("/addPost", async (req, res) => {
  if (req.body.title.length <= 80 && req.body.bodyText.length <= 3000) {
    fetch("http://localhost:3000/auth", {
      method: "GET",
      headers: {
        Accept: "application/json",
        Authorization: req.headers["authorization"],
      },
    })
      .then((res) => res.json())
      .then(async (decoded) => {
        db.addPost(req.body.title, req.body.bodyText, decoded.sub).then(
          async () => {
            let posts = await db.getPosts();
            io.emit("refreshPosts", posts);
          }
        );
      });
  }
});

app.post("/addComment", async (req, res) => {
  let postid = req.get("Referrer").split("/");
  postid = postid[postid.length - 1];
  if (req.body.bodyText.length <= 3000) {
    fetch("http://localhost:3000/auth", {
      method: "GET",
      headers: {
        Accept: "application/json",
        Authorization: req.headers["authorization"],
      },
    })
      .then((res) => res.json())
      .then((decoded) => {
        if (decoded.sub != null) {
          db.addComment(decoded.sub, req.body.bodyText, postid).then(
            async () => {
              let comments = await db.getCommentsByPostId(postid);
              io.emit("refreshComments", comments);
            }
          );
        }
      });
  }
});

app.get("/main/:postid", async (req, res) => {
  let postinfo = await db.getPostById(req.params.postid);
  let comments = await db.getCommentsByPostId(req.params.postid);
  res.render("post", { post: postinfo, comments: comments });
});

app.get("/auth", (req, res) => {
  let auth = req.headers["authorization"];

  if (auth === undefined) {
    res.json(401);
  }
  let token = auth.slice(7);
  let decoded;
  try {
    decoded = jwt.verify(token, "hilmerärkort");
  } catch (error) {
    console.log(error);
    res.json(401);
  }
  res.json(decoded);
});

app.post("/deletePost", async (req, res) => {
  fetch("http://localhost:3000/auth", {
    method: "GET",
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${req.body.token}`,
    },
  })
    .then((res) => res.json())
    .then(async (decoded) => {
      if (decoded.sub != null) {
        let posts = await db.getPostIds(decoded.sub);
        if (posts.includes(parseInt(req.body.postid))) {
          db.deletePost(req.body.postid); // Tar även bort relevanta kommentarer från databasen genom en on delete cascade relation
        }
      }
    });
});

app.post("/deleteComment", async (req, res) => {
  fetch("http://localhost:3000/auth", {
    method: "GET",
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${req.body.token}`,
    },
  })
    .then((res) => res.json())
    .then(async (decoded) => {
      if (decoded.sub != null) {
        let comments = await db.getCommentIds(decoded.sub);
        if (comments.includes(parseInt(req.body.commentid))) {
          db.deleteComment(req.body.commentid);
        }
      }
    });
});

server.listen(port, () => {
  console.log(`Servern körs nu på port ${port}.`);
});
