require("dotenv").config();
const axios = require("axios");
const createError = require("http-errors");
const Recipe = require("../models/recipe");
const bcrypt = require("bcryptjs");
const User = require("../models/user");
const jwt = require("jsonwebtoken");

exports.getRecipesData = async (req, res, next) => {
  const options = {
    method: "GET",
    url: "https://spoonacular-recipe-food-nutrition-v1.p.rapidapi.com/recipes/complexSearch",
    params: {
      query: req.params.query,
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
    res.json({ message: response.data.results });
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
    const userId = getUserIdFromReq(req);

    const favorite = new Recipe({
      title: response.data.title,
      image: response.data.image,
      instructions: response.data.instructions,
      gluten: response.data.diets[0],
      userId: userId,
    });
    await favorite.save();
    res.json({ message: favorite });
  } catch (error) {
    return next(createError(404, error.message));
  }
};

const getUserIdFromReq = (req) => {
  const cookie = req.cookies.jwt;

  const payload = jwt.verify(cookie, process.env.ACCESS_TOKEN_SECRET);

  if (!payload) {
    return next(createError(401, error.message));
  }

  return payload.id;
};

exports.displayFavorites = async (req, res, next) => {
  try {
    const userId = getUserIdFromReq(req);
    const favorites = await Recipe.find({ userId: userId });
    res.json({ message: favorites });
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

    res.json({ result: true });
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
    res.json({ message: favorite });
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
    if (!req.body.text) {
      await favoriteComment.deleteOne();
    } else {
      favoriteComment.text = req.body.text;
    }
    await favorite.save();

    res.json({ message: favorite });
  } catch (error) {
    return next(createError(500, error.message));
  }
};

exports.deleteComment = async (req, res, next) => {
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

    const deletedComment = await Recipe.findByIdAndDelete(favoriteComment);

    if (!deletedComment) {
      return next(createError(404, "No favorite recipe with that id"));
    }

    res.json({ result: true });
  } catch (error) {
    return next(createError(500, error.message));
  }
};

exports.signUp = async (req, res, next) => {
  try {
    //const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(req.body.password, 10);
    console.log(req.body.email, req.body.password);
    const user = new User({
      email: req.body.email,
      password: hashedPassword,
    });
    await user.save();
    res.json({ message: "Signup" });
  } catch (error) {
    return next(createError(500, error.message));
  }
};

exports.signIn = async (req, res, next) => {
  try {
    const userEmail = req.body.email;
    const user = await User.findOne({ email: userEmail });
    console.log(user);

    if (!user) {
      return next(createError(404, "The user not found"));
    }
    const result = await bcrypt.compare(req.body.password, user.password);

    if (result) {
      const accessToken = jwt.sign(
        { id: user._id, email: user.email },
        process.env.ACCESS_TOKEN_SECRET
      );
      //res.json({ accessToken: accessToken });
      res.cookie("jwt", accessToken, {
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000,
      });
      res.json({ message: "Success" });
    } else {
      return next(createError(401, "The password doesn't match"));
    }
  } catch (error) {
    return next(createError(500, error.message));
  }
};
