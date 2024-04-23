const express = require("express");
const router = express.Router();
const {
  getRecipesData,
  addOneFavorite,
  displayFavorites,
  deleteFavorite,
  addComments,
  changeComment,
  signUp,
  signIn,
} = require("../controllers/recipesController");

router.get("/all/:query", getRecipesData);

router.get("/favorites", displayFavorites);

router.post("/favorites/:id", addOneFavorite);

router.delete("/favorites/:id", deleteFavorite);

router.post("/favorites/:id/comments", addComments);

router.put("/favorites/:favoriteId/comments/:commentId", changeComment);

//router.delete("/favorites/:favoriteId/comments/:commentId", deleteComment);

router.post("/signup", signUp);
router.post("/signin", signIn);

module.exports = router;
