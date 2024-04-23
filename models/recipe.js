const mongoose = require("mongoose");

const commentSchema = new mongoose.Schema({
  text: {
    type: String,
  },
});

const recipeSchema = new mongoose.Schema({
  title: {
    type: String,
  },
  image: {
    type: String,
  },
  instructions: {
    type: String,
  },
  gluten: {
    type: String,
  },
  userId: {
    type: String,
  },
  comments: [commentSchema],
});

module.exports = mongoose.model("Recipe", recipeSchema);
