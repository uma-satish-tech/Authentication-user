const express = require("express");
const app = express();
app.use(express.json());
const { open } = require("sqlite");
const path = require("path");
const dbPath = path.join(__dirname, "userData.db");
const sqlite3 = require("sqlite3");
const bcrypt = require("bcrypt");

let db = null;
const initializedDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });

    app.listen(3001, () => {
      console.log("server started running at localhost:3001");
    });
  } catch (error) {
    console.log(error.message);
    process.exit(1);
  }
};

initializedDBAndServer();

// register User
app.post("/register", async (request, response) => {
  const { username, name, password, gender, location } = request.body;
  const hashPassword = await bcrypt.hash(password, 10);
  const selectUserQuery = `SELECT * FROM user WHERE username = '${username}'`;
  const dbUser = await db.get(selectUserQuery);
  if (dbUser !== undefined) {
    response.status(400);
    response.send("User already exists");
  } else if (dbUser === undefined) {
    if (password.length < 5) {
      response.status(400);
      response.send("Password is too short");
    } else {
      const createQuery = `
        INSERT INTO user(username,name,password,gender,location)
        VALUES('${username}','${name}','${hashPassword}','${gender}','${location}');
        `;
      await db.run(createQuery);
      response.status(200);
      response.send("User created successfully");
    }
  }
});

//login using post method

app.post("/login", async (request, response) => {
  const { username, password } = request.body;
  const selectUserQuery = `SELECT * FROM user WHERE username = '${username}'`;
  const dbUser = await db.get(selectUserQuery);
  if (dbUser === undefined) {
    response.status(400);
    response.send("Invalid user");
  } else {
    const isPasswordMatched = await bcrypt.compare(password, dbUser.password);
    if (isPasswordMatched === true) {
      response.send("Login Success!");
    } else {
      response.status(400);
      response.send("Invalid Password");
    }
  }
});

module.exports = app;