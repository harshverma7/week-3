const express = require("express");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");

mongoose.connect(
  "mongodb+srv://admin:9YT6XYXUB3qRsMCK@cluster0.85lcr.mongodb.net/todo-database"
);

const app = express();
app.use(express.json());

const { UserModel, TodoModel } = require("./db");
const { auth, jwt_secret } = require("./auth");

app.use(express.json());

app.post("/signup", async (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  const name = req.body.name;

  await UserModel.create({
    email: email,
    password: password,
    name: name,
  });

  res.json({
    message: "you are signed up",
  });
});

app.post("/signin", async function (req, res) {
  const email = req.body.email;
  const password = req.body.password;

  const response = await UserModel.findOne({
    email: email,
    password: password,
  });

  if (response) {
    const token = jwt.sign(
      {
        id: response._id.toString(),
      },
      jwt_secret
    );

    res.json({
      token,
    });
  } else {
    res.status(403).json({
      message: "Incorrect creds",
    });
  }
});

app.post("/todo", auth, (req, res) => {
  const userId = req.userId;
  const title = req.body.title;
  TodoModel.create({
    userId: userId,
    title: title,
  });
  res.json({
    message: "todo added",
  });
});

app.get("/todos", auth, async (req, res) => {
  const userId = req.userId;

  const todos = await TodoModel.find({
    userId: userId,
  });
  res.json(todos);
});

app.listen(3000, () => {
  console.log("Server is running on port 3000");
});
