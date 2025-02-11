const express = require("express");
const app = express();
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
require("dotenv").config();
const { usermodel } = require("../backend/db");
const { todomodel } = require("../backend/db");
const { userauth } = require("../middleware/auth");
const { default: mongoose } = require("mongoose");
const jwt_key = process.env.jwt_key;

mongoose
  .connect(process.env.db_url)
  .then(() => {
    console.log("connected");
  })
  .catch((error) => {
    console.log("Unsuccesfull connection !", error);
  });

app.use(express.json());

app.post("/signup", async function (req, res) {
  const username = req.body.username;
  const password = req.body.password;
  const hashed_password = await bcrypt.hash(password, 5);
  const user = await usermodel.findOne({
    username: username,
  });
  if (user) {
    res.json({ msg: "Username not available" });
  } else {
    await usermodel.create({
      username: username,
      password: hashed_password,
    });
    res.json({ msg: "Signup Succesfull" });
    console.log(password);
  }
});

app.post("/signin", async function (req, res) {
  const { username, password } = req.body;
  const finduser = await usermodel.findOne({ username: username });
  if (finduser) {
    const valid = await bcrypt.compare(password, finduser.password);
    console.log(valid);

    if (valid) {
      const token = jwt.sign({ id: finduser._id.toString() }, jwt_key);
      res.json({ token: token });
    } else {
      res.json({ msg: "Invalid password !" });
    }
  } else {
    res.json({ msg: "User does not exist !" });
  }
});

app.post("/addtodo", userauth, async function (req, res) {
  const { task, done } = req.body;
  const userid = req.userid;
  const savetodo = await todomodel.create({
    task,
    done,
    userid,
  });
  res.json({ msg: "Task Added", taskid: savetodo._id });
});

app.put("/deletetodo", userauth, async function (req, res) {
  const taskid = req.body.taskid;
  const deletetask = await todomodel.deleteOne({ _id: taskid });
  res.json({ msg: "Task deleted" });
});

app.put("/edittodo", userauth, async function (req, res) {
  const taskid = req.body.taskid;
  const userid = req.userid;
  const { task, done } = req.body;
  try {
    const valid = await todomodel.findOne({ _id: taskid, userid: userid });
    console.log(valid);

    if (valid) {
      const update = await todomodel.updateOne(
        { _id: taskid },
        { task: task, done: done }
      );
      res.json({ msg: "Task updated" });
    } else {
      res.json({ msg: "Invalid Task Id" });
    }
  } catch (error) {
    res.json({ error: error.message });
  }
});

app.get("/todos", userauth, async function (req, res) {
  const userid = req.userid;
  const todos = await todomodel.find({ userid: userid });
  if (todos != []) {
    tasks = [];
    todos.forEach((todo) => {
      tasks.push(todo.task);
    });
    res.json({ tasks });
  } else {
    res.json({ msg: "No Task Found" });
  }
});

app.listen(3000);
