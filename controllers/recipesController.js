const axios = require("axios");
require("dotenv").config();
const createError = require("http-errors");
const Recipe = require("../models/recipe");

exports.getRecipesData = async (req, res) => {
  const options = {
    method: "GET",
    url: "https://spoonacular-recipe-food-nutrition-v1.p.rapidapi.com/recipes/complexSearch",
    params: {
      query: "gluten free",
      intolerances: "gluten",
      number: 10,
    },
    headers: {
      "X-RapidAPI-Key": process.env.API_KEY,
      "X-RapidAPI-Host": "spoonacular-recipe-food-nutrition-v1.p.rapidapi.com",
    },
  };

  try {
    const response = await axios.request(options);
    res.send(response.data.results);
  } catch (error) {
    console.error(error);
  }
};

exports.addOneFavorite = async (req, res) => {
  const options = {
    method: "GET",
    url: `https://spoonacular-recipe-food-nutrition-v1.p.rapidapi.com/recipes/${req.params.id}/information`,
    headers: {
      "X-RapidAPI-Key": process.env.API_KEY,
      "X-RapidAPI-Host": "spoonacular-recipe-food-nutrition-v1.p.rapidapi.com",
    },
  };

  try {
    const response = await axios.request(options);
    const favorite = new Recipe({
      title: response.data.title,
      image: response.data.image,
      instructions: response.data.instructions,
      gluten: response.data.diets[0],
    });
    await favorite.save();
    res.send(favorite);
  } catch (error) {
    console.error(error);
  }
};

exports.displayFavorites = async (req, res) => {
  const favorites = await Recipe.find();
  res.send(favorites);
};

exports.deleteFavorite = async (req, res, next) => {
  const favoriteId = req.params.id;
  const deletedFavorite = await Recipe.findByIdAndDelete(favoriteId);
  res.send({ result: true });
};

exports.addComments = async (req, res) => {
  const recipeId = req.params.id;
  const favorite = await Recipe.findById(recipeId);
  console.log(favorite);
  favorite.comments.push({ text: req.body.text });
  await favorite.save();
  res.send(favorite);
};

exports.changeComment = async (req, res) => {
  const commentId = req.params.commentId;
  const favoriteId = req.params.favoriteId;
  const favorite = await Recipe.findById(favoriteId);
  favorite.comments.id(commentId).text = req.body.text;
  await favorite.save();
  res.send(favorite);
};
