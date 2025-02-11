const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const object_id = Schema.ObjectId;

const user = new Schema({
  username: { type: String, unique: true, required: true },
  password: { type: String, required: true },
});

const todo = new Schema({
  task: String,
  done: Boolean,
  userid: object_id,
});

const usermodel = mongoose.model("usermodel", user);
const todomodel = mongoose.model("todomodel", todo);

module.exports = {
  usermodel,
  todomodel,
};
