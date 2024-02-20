import express from "express";
// import * as db from "./module.js";
import bodyParser from "body-parser";
import { engine } from "express-handlebars";

const app = express();
const port = 3000;

app.use(bodyParser.json());
app.use(express.static("public"));
app.engine("handlebars", engine());
app.set("view engine", "handlebars");
app.set("views", "./views");

app.get("/", (req, res) => {
  res.render("login");
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}.`);
});
