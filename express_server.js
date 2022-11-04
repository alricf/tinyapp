// Libraries required
const express = require("express");
const bcrypt = require("bcryptjs");
const cookieSession = require("cookie-session");
const { getUserByEmail, generateRandomString, urlsForUser } = require('./helpers.js');

// Configuration
const app = express();
const PORT = 8080; // default port 8080

// Express templating engine
app.set("view engine", "ejs");

// Databases
const urlDatabase = {};

const users = {};

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(cookieSession({
  name: 'session',
  keys: ["354b8845-6330-4389-bb9b-ce49ad91328f"],
  maxAge: 24 * 60 * 60 * 1000 // 24 hours
}));

// Routes //
// READ
app.get("/", (req, res) => {
  if (!req.session.user_id) {
    return res.redirect("/login");
  }
  return res.redirect("/urls");
});

app.get("/urls", (req, res) => {
  if (!req.session.user_id) {
    return res.send("Error: User not logged in. Kindly, register or login.");
  }

  const templateVars = {
    urls: urlsForUser(req.session.user_id, urlDatabase),
    user: users[req.session.user_id],
  };

  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  const templateVars = {
    user: users[req.session.user_id],
  };

  if (!templateVars.user) {
    res.redirect("/login");
    return;
  }

  res.render("urls_new", templateVars);
});

app.get("/urls/:id", (req, res) => {
  if (!req.session.user_id) {
    return res.send("Error: User not logged in. Kindly login!");
  }

  if (!urlDatabase[req.params.id]) {
    return res.send("Error: shortURL ID does not exist!");
  }

  if (urlDatabase[req.params.id].userID !== req.session.user_id) {
    return res.send("Error: shortURL not owned by user.");
  }

  const templateVars = {
    id: req.params.id,
    longURL: urlDatabase[req.params.id].longURL,
    user: users[req.session.user_id],
  };

  res.render("urls_show", templateVars);
});

app.get("/u/:id", (req, res) => {
  if (!urlDatabase[req.params.id]) {
    res.send('Error: Shortened URL does not exist.');
    return;
  }
  const { id } = req.params;
  const longURL = urlDatabase[id].longURL;

  res.redirect(longURL);
});

app.get("/register", (req, res) => {
  const userId = req.session.user_id;
  const user = users[userId];
  if (user) {
    res.redirect("/urls");
    return;
  }

  res.render("urls_registration", { user });
});

app.get("/login", (req, res) => {
  const userId = req.session.user_id;
  const user = users[userId];
  if (user) {
    res.redirect("/urls");
    return;
  }
  res.render("urls_login", { user });
});

// CREATE
app.post("/urls", (req, res) => {
  const userId = req.session.user_id;
  const user = users[userId];
  if (!user) {
    res.send("Error: Cannot shorten URLs because user is not logged in");
    return;
  }

  const shortURL = generateRandomString();
  const longURL = req.body.longURL;

  urlDatabase[shortURL] = { longURL, userID: userId };

  res.redirect(`/urls/${shortURL}`);
});

app.post("/login", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  const exist = getUserByEmail(email, users);

  if (!exist) {
    return res.send('403 status code error: E-mail cannot be found');
  }

  const passCheck = bcrypt.compareSync(password, exist.password);
  if (passCheck) {
    req.session.user_id = exist.id;
  } else {
    return res.send('403 status code error: Password does not match');
  }

  res.redirect("/urls");
});

app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect("/login");
});

app.post("/register", (req, res) => {
  const id = generateRandomString();
  const email = req.body.email;
  const password = req.body.password;

  if (email === "" || password === "") {
    return res.send('400 status code error: Email and/or Password field(s) are empty');
  }
  const hashedPassword = bcrypt.hashSync(password, 10);

  const exist = getUserByEmail(email, users);
  if (exist) {
    return res.send('400 status code error: Email already exists');
  }

  users[id] = {
    id,
    email,
    password: hashedPassword,
  };
  req.session.user_id = users[id].id;

  res.redirect("/urls");
});

// DELETE
app.post("/urls/:id/delete", (req, res) => {

  if (!urlDatabase[req.params.id]) {
    return res.send("Error: ShortURL does not exist!");
  }

  if (!req.session.user_id) {
    return res.send("Error: User is not logged in. Kindly, login");
  }

  if (urlDatabase[req.params.id].userID !== req.session.user_id) {
    return res.send("Error: URL does not belong to user.");
  }

  delete urlDatabase[req.params.id];
  res.redirect("/urls");
});

// UPDATE-Edit
app.post("/urls/:id", (req, res) => {
  if (!urlDatabase[req.params.id]) {
    return res.send("Error: ShortURL does not exist!");
  }

  if (!req.session.user_id) {
    return res.send("Error: User is not logged in. Kindly, login");
  }

  if (urlDatabase[req.params.id].userID !== req.session.user_id) {
    return res.send("Error: URL does not belong to user.");
  }

  urlDatabase[req.params.id].longURL = req.body.newURL;

  res.redirect("/urls");
});

// Port listen handle / Connection checker
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});