const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const bcryptNode = require("bcrypt-nodejs");
const bcrypt = require("bcrypt");

const userSchema = new Schema({
  email: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
});

userSchema.methods.encryptPassword = (password) => {
  return bcrypt.hashSync(password, bcrypt.genSaltSync(10));
};

userSchema.methods.validPassword = (password, storedPassword) => {
  console.log(password, storedPassword);
  return bcrypt.compareSync(password, storedPassword);
};

module.exports = mongoose.model("Users", userSchema);
