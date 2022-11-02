// Libraries required
const express = require("express");
const cookieParser = require('cookie-parser');
const bcrypt = require("bcryptjs");

// Configuration
const app = express();
const PORT = 8080; // default port 8080

// Express templating engine
app.set("view engine", "ejs");

// Databases
const urlDatabase = {
  b6UTxQ: {
    longURL: "https://www.tsn.ca",
    userID: "userRandomID",
  },
  i3BoGr: {
    longURL: "https://www.google.ca",
    userID: "user2RandomID",
  },
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
    if (users[item].email === userEmail) {
      return users[item];
    }
  }
  return null;
};

function urlsForUser(id) {
  let urls = {};
  for(let item in urlDatabase) {
    if(urlDatabase[item].userID === id) {
      urls[item] = urlDatabase[item].longURL;
    }
  }
  return urls;
}

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
  if(!req.cookies["user_id"]){
    return res.send("Error: User not logged in. Kindly, register or login.")
  }

  const templateVars = {
    urls: urlsForUser(req.cookies["user_id"]),
    user: users[req.cookies["user_id"]],
  };
  
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  const templateVars = {
    user: users[req.cookies["user_id"]],
  };

  if(!templateVars.user) {
    res.redirect("/login");
    return;
  }

  res.render("urls_new", templateVars);
});

app.get("/urls/:id", (req, res) => {
  if(!req.cookies["user_id"]) {
    return res.send("Error: User not logged in. Kindly login!")
  }
  
  if (urlDatabase[req.params.id].userID !== req.cookies["user_id"]) {
    return res.send("Error: URL does not belong to user.");
  }
  
  const templateVars = {
    id: req.params.id,
    longURL: urlDatabase[req.params.id].longURL,
    user: users[req.cookies["user_id"]],
  };
 
  res.render("urls_show", templateVars);
});

app.get("/u/:id", (req, res) => {
  if(!urlDatabase[req.params.id]) {
    res.send('Error: Shortened URL does not exist.');
    return;
  }
  const { id } = req.params;
  const longURL = urlDatabase[id].longURL;
 
  res.redirect(longURL);
});

app.get("/register", (req, res) => {
  const userId = req.cookies.user_id;
  const user = users[userId];
  if(user) {
    res.redirect("/urls");
    return;
  }

  res.render("urls_registration", { user });
});

app.get("/login", (req, res) => {
  const userId = req.cookies.user_id;
  const user = users[userId];
  if(user) {
    res.redirect("/urls");
    return;
  }
  res.render("urls_login", { user });
});

// CREATE
app.post("/urls", (req, res) => {
  const userId = req.cookies.user_id;
  const user = users[userId];
  if(!user) {
    res.send("Error: Cannot shorten URLs because user is not logged in");
    console.log(users);
    return;
  }
  
  const shortURL = generateRandomString();
  const longURL = req.body.longURL;
  //
  urlDatabase[shortURL].longURL = longURL;
  res.redirect(`/urls/${shortURL}`);
});

app.post("/login", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  const exist = getUserByEmail(email);
  // Test 
  // console.log(users);
  if (!exist) {
    return res.send('403 status code error: E-mail cannot be found');
  }

  if (exist.password !== password) {
    return res.send('403 status code error: Password does not match');
  } else {
    res.cookie("user_id", exist.id);
  }
  // test to check database
  // console.log(users);
  res.redirect("/urls");
});

app.post("/logout", (req, res) => {
  res.clearCookie("user_id");
  res.redirect("/login");
});

app.post("/register", (req, res) => {
  const id = generateRandomString();
  const email = req.body.email;
  const password = req.body.password;
 

  if (email === "" || password === "") {
    // console.log(users);
    return res.send('400 status code error: Email and/or Password field(s) are empty');
  }
  const hashedPassword = bcrypt.hashSync(password, 10);
  // Helper function call
  const exist = getUserByEmail(email);
  if (exist) {
    // console.log(users);
    return res.send('400 status code error: Email already exists');
  }

  users[id] = {
    id,
    email,
    password: hashedPassword,
  };
  res.cookie("user_id", id);
  // console.log(users);
  res.redirect("/urls");
});

// DELETE
app.post("/urls/:id/delete", (req, res) => {

  if(!urlDatabase[req.params.id]) {
    return res.send("Error: ShortURL does not exist!");
  }

  if(!req.cookies["user_id"]) {
    return res.send("Error: User is not logged in. Kindly, login");
  }

  if (urlDatabase[req.params.id].userID !== req.cookies["user_id"]) {
    return res.send("Error: URL does not belong to user.");
  }

  delete urlDatabase[req.params.id];
  res.redirect("/urls");
});

// UPDATE-Edit
app.post("/urls/:id", (req, res) => {
  if(!urlDatabase[req.params.id]) {
    return res.send("Error: ShortURL does not exist!");
  }

  if(!req.cookies["user_id"]) {
    return res.send("Error: User is not logged in. Kindly, login");
  }

  if(urlDatabase[req.params.id].userID !== req.cookies["user_id"]) {
    return res.send("Error: URL does not belong to user.");
  }

  urlDatabase[req.params.id].longURL = req.body.newURL;
  res.redirect("/urls");
});

// Port listen handle / Connection checker
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});