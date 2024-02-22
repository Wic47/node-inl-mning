import express from "express";
import * as db from "./module.js";
import bodyParser from "body-parser";
import { engine } from "express-handlebars";
import { Server } from "socket.io";
import http from "http";

const app = express();
const port = 3000;
const server = http.createServer(app);
const io = new Server(server);

app.use(bodyParser.json());
app.use(express.static("public"));
app.engine("handlebars", engine());
app.set("view engine", "handlebars");
app.set("views", "./views");

let messages = await db.getMessages();

app.get("/", async (req, res) => {
  res.render("guestbook", { messages });
});

io.on("connection", (socket) => {
  socket.on("getNewData", async (res) => {
    let userMessage = res;
    await db.addMessage(userMessage);
    messages = await db.getMessages2();
    io.emit("receiveNewData", messages);
  });
});

server.listen(port, () => {
  console.log(`Servern körs nu på port ${port}.`);
});
