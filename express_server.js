// Libraries required
const express = require("express");
const cookieParser = require('cookie-parser');

// Configuration
const app = express();
const PORT = 8080; // default port 8080

// Express templating engine
app.set("view engine", "ejs");

// Databases
const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com",
};

const users = {
  userRandomID: {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur",
  },
  user2RandomID: {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk",
  },
};

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Functions
// Helper function that generates random 6 character strings
function generateRandomString() {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

  const len = 6;
  let randomString = "";

  for (let i = 0; i < len; i++) {
    const randomNumber = Math.floor(Math.random() * chars.length);
    randomString += chars[randomNumber];
  }
  return randomString;
};

// Helper function to check if user email already exists
function getUserByEmail(userEmail) {
  for (let item in users) {
    if(users[item].email === userEmail) {
      return users[item];
    }
  }
  return null;
};

// Routing //
// READ
/*
app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});
*/

app.get("/urls", (req, res) => {
  const templateVars = {
    urls: urlDatabase,
    user: users[req.cookies["user_id"]],
  };
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  const templateVars = {
    user: users[req.cookies["user_id"]],
  };
  res.render("urls_new", templateVars);
});

app.get("/urls/:id", (req, res) => {
  const templateVars = {
    id: req.params.id,
    longURL: urlDatabase[req.params.id],
    user: users[req.cookies["user_id"]],
  };
  res.render("urls_show", templateVars);
});

app.get("/u/:id", (req, res) => {
  const { id } = req.params;
  const longURL = urlDatabase[id];
  res.redirect(longURL);
});

app.get("/register", (req, res) => {
  const templateVars = {
    user: users[req.cookies["user_id"]],
  };
  res.render("urls_registration", templateVars);
});

// CREATE
app.post("/urls", (req, res) => {
  const shortURL = generateRandomString();
  const longURL = req.body.longURL;
  urlDatabase[shortURL] = longURL;
  res.redirect(`/urls/${shortURL}`);
});

app.post("/login", (req, res) => {
  res.cookie('username', req.body.username);
  res.redirect("/urls");
});

app.post("/logout", (req, res) => {
  res.clearCookie("username");
  res.redirect("/urls");
});

app.post("/register", (req, res) => {
  const id = generateRandomString();
  const email = req.body.email;
  const password = req.body.password;

  if (email === "" || password === "") {
    console.log(users);
    return res.send('400 status code error: Email and/or Password field(s) are empty');
  }
  // Helper function call
  const exist = getUserByEmail(email);
  if (exist) {
    console.log(users);
    return res.send('400 status code error: Email already exists');
  }

  users[id] = {
    id,
    email,
    password,
  };
  res.cookie("user_id", id);
  console.log(users);
  res.redirect("/urls");
});

// DELETE
app.post("/urls/:id/delete", (req, res) => {
  delete urlDatabase[req.params.id];
  res.redirect("/urls");
});

// UPDATE
app.post("/urls/:id/edit", (req, res) => {
  urlDatabase[req.params.id] = req.body.newURL;
  res.redirect("/urls");
});

// Port listen handle / Connection checker
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});