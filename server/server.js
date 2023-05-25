const PORT = process.env.SERVER_PORT ?? 8000;
const express = require("express");
const app = express();
const pool = require("./db");
const cors = require("cors");
const passwordEncoder = require("bcrypt");
const jwt = require("jsonwebtoken");
const { v4: uuid } = require("uuid");

app.use(cors());
app.use(express.json());

// get all todos
app.get("/todos/:userEmail", async (req, res) => {
  console.log(req);
  const userEmail = req.params.userEmail;

  try {
    const todos = await pool.query(
      "SELECT * FROM todos WHERE user_email = $1",
      [userEmail]
    );
    res.json(todos.rows);
  } catch (err) {
    console.error(err);
  }
});

// create a new todo
app.post("/todos", async (req, res) => {
  const { user_email, title, progress, date } = req.body;
  const id = uuid();
  try {
    const newToDo = await pool.query(
      `INSERT INTO todos(id, user_email, title, progress, date) VALUES ($1, $2, $3, $4, $5)`,
      [id, user_email, title, progress, date]
    );
    res.json(newToDo);
  } catch (err) {
    console.error(err);
  }
});

// edit a todo
app.put("/todos/:id", async (req, res) => {
  const { id } = req.params;
  const { user_email, title, progress, date } = req.body;
  try {
    const editTodo = await pool.query(
      "UPDATE todos SET user_email = $1, title = $2, progress = $3, date = $4 WHERE id = $5",
      [user_email, title, progress, date, id]
    );
    res.json(editTodo);
  } catch (err) {
    console.error(err);
  }
});

// delete a todo
app.delete("/todos/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const deletedTodo = await pool.query("DELETE FROM todos WHERE id = $1;", [
      id,
    ]);
    res.json(deletedTodo);
  } catch (err) {
    console.error(err);
  }
});

// sign up
app.post("/signup", async (req, res) => {
  const { email, password } = req.body;
  const salt = await passwordEncoder.genSalt(10);
  const hashedPassword = passwordEncoder.hashSync(password, salt);

  try {
    const signUp = await pool.query(
      `INSERT INTO users (email, hashed_password) VALUES($1, $2)`,
      [email, hashedPassword]
    );

    const token = jwt.sign({ email }, "secret", { expiresIn: "1hr" });

    res.json({ email, token });
  } catch (err) {
    console.log(err);
    if (err) {
      res.json({ detail: err.detail });
    }
  }
});

//login
app.post("/login", async (req, res) => {
  const { email, password } = req.body;
  try {
    const users = await pool.query("SELECT * FROM users WHERE email = $1", [
      email,
    ]);

    if (!users.rows.length) {
      return res.json({ detail: "User doesn't exist" });
    }

    const success = await passwordEncoder.compare(
      password,
      users.rows[0].hashed_password
    );

    if (success) {
      const token = jwt.sign({ email }, "secret", { expiresIn: "1hr" });

      res.json({ email: users.rows[0].email, token });
    } else {
      res.json({ detail: "Login failed" });
    }
  } catch (err) {
    console.log(err);
  }
});

app.listen(PORT, (req, res) => console.log(`Server running on port ${PORT}`));
