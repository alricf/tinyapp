// Helper function to check if user email already exists
const getUserByEmail = function(compareEmail, database) {
  for (let item in database) {
    let user = database[item];
    if (user.email === compareEmail) {
      return user;
    }
  }
  return null;
};

// Helper function that generates random 6 character strings
const generateRandomString = function() {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

  const len = 6;
  let randomString = "";

  for (let i = 0; i < len; i++) {
    const randomNumber = Math.floor(Math.random() * chars.length);
    randomString += chars[randomNumber];
  }
  return randomString;
};

// Helper function that returns which urls are owned by a logged in user.
const urlsForUser = function(id, database) {
  let urls = {};
  for(let item in database) {
    if(database[item].userID === id) {
      urls[item] = database[item].longURL;
    }
  }
  return urls;
}

module.exports = { getUserByEmail, generateRandomString, urlsForUser };