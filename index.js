const express = require("express");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const { z } = require("zod");

mongoose.connect("");

const app = express();
app.use(express.json());

const { UserModel, TodoModel } = require("./db");
const { auth, jwt_secret } = require("./auth");

app.use(express.json());

app.post("/signup", async (req, res) => {
  const requiredFields = z.object({
    email: z.string().min(1).max(100).email(),
    password: z.string().min(1).max(30),
    name: z.string().min(1).max(60),
  });

  const validated = requiredFields.safeParse(req.body);

  if (!validated.success) {
    res.status(403).json({
      message: validated.error.issues[0].message,
    });
    return;
  }

  const email = req.body.email;
  const password = req.body.password;
  const name = req.body.name;

  let errorThrown = false;

  try {
    const hashedPassword = await bcrypt.hash(password, 5);

    await UserModel.create({
      email: email,
      password: hashedPassword,
      name: name,
    });
  } catch (error) {
    errorThrown = true;
    res.status(403).json({
      message: "Email already exists",
    });
  }

  if (!errorThrown) {
    res.json({
      message: "you are signed up",
    });
  }
});

app.post("/signin", async function (req, res) {
  const email = req.body.email;
  const password = req.body.password;

  const response = await UserModel.findOne({
    email: email,
  });

  if (!response) {
    res.status(403).json({
      message: "Incorrect creds",
    });
    return;
  }

  const isMatch = await bcrypt.compare(password, response.password);

  if (isMatch) {
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
