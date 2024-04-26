import express from "express";
import * as db from "./module.js";
import bodyParser from "body-parser";
import { engine } from "express-handlebars";
import { Server } from "socket.io";
import http from "http";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

const app = express();
const port = 3000;
const server = http.createServer(app);
const io = new Server(server);

app.use(bodyParser.json());
app.use(express.static("public"));
app.engine("handlebars", engine());
app.set("view engine", "handlebars");
app.set("views", "./views");

// let messages = await db.getMessages();

app.get("/", (req, res) => {
  res.render("login");
  // res.render("guestbook", { messages });
});

app.get("/main", async (req, res) => {
  res.render("mainsite");
});

app.post("/", async (req, res) => {
  if (req.body && req.body.usernameR && req.body.passwordR) {
    db.createUser(req.body.usernameR, req.body.passwordR).then(res.json());
  }
  if (req.body && req.body.username && req.body.password) {
    let logininfo = await db.getPassword(req.body.username);
    bcrypt.compare(req.body.password, logininfo.password, (err, result) => {
      if (result) {
        let token = jwt.sign(
          {
            sub: `${logininfo.id}`,
            name: `${req.body.username}`,
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
});

app.get("/auth", (req, res) => {
  let auth = req.headers["authorization"];

  if (auth === undefined) {
    res.status.send(401).send("Auth token missing");
  }
  let token = auth.slice(7);
  let decoded;
  try {
    decoded = jwt.verify(token, "hilmerärkort");
  } catch (error) {
    console.log(error);
    res.status(401).send("Invalid auth token");
  }
  res.send(decoded);
});

// io.on("connection", (socket) => {
//   socket.on("getNewData", async (res) => {
//     let userMessage = res;
//     await db.addMessage(userMessage);
//     messages = await db.getMessages2();
//     io.emit("receiveNewData", messages);
//   });
// });

server.listen(port, () => {
  console.log(`Servern körs nu på port ${port}.`);
});
