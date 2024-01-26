const axios = require("axios");
require("dotenv").config();
const createError = require("http-errors");
const Recipe = require("../models/recipe");

exports.getRecipesData = async (req, res, next) => {
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
    return next(createError(404, error.message));
  }
};

exports.addOneFavorite = async (req, res, next) => {
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
    return next(createError(404, error.message));
  }
};

exports.displayFavorites = async (req, res, next) => {
  try {
    const favorites = await Recipe.find();
    res.send(favorites);
  } catch (error) {
    return next(createError(500, error.message));
  }
};

exports.deleteFavorite = async (req, res, next) => {
  try {
    const favoriteId = req.params.id;
    const deletedFavorite = await Recipe.findByIdAndDelete(favoriteId);

    if (!deletedFavorite) {
      return next(createError(404, "No favorite recipe with that id"));
    }

    res.send({ result: true });
  } catch (error) {
    return next(createError(500, error.message));
  }
};

exports.addComments = async (req, res, next) => {
  try {
    const recipeId = req.params.id;
    const favorite = await Recipe.findById(recipeId);

    if (!favorite) {
      return next(createError(404, "No favorite recipe with that id"));
    }

    favorite.comments.push({ text: req.body.text });
    await favorite.save();
    res.send(favorite);
  } catch (error) {
    return next(createError(500, error.message));
  }
};

exports.changeComment = async (req, res, next) => {
  try {
    const commentId = req.params.commentId;
    const favoriteId = req.params.favoriteId;
    const favorite = await Recipe.findById(favoriteId);

    if (!favorite) {
      return next(createError(404, "No favorite with that id"));
    }

    const favoriteComment = favorite.comments.id(commentId);

    if (!favoriteComment) {
      return next(createError(404, "No favorite comment with that id"));
    }

    favoriteComment.text = req.body.text;
    await favorite.save();
    res.send(favorite);
  } catch (error) {
    return next(createError(500, error.message));
  }
};
