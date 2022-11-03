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

module.exports = getUserByEmail;