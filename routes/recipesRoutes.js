const express = require("express");
const router = express.Router();
const {
  getRecipesData,
  addOneFavorite,
  displayFavorites,
  deleteFavorite,
  addComments,
  changeComment,
} = require("../controllers/recipesController");

router.get("/all", getRecipesData); //

router.get("/favorites", displayFavorites); //

router.post("/favorites/:id", addOneFavorite); //

router.delete("/favorites/:id", deleteFavorite); //

router.post("/favorites/:id/comments", addComments); //

router.put("/favorites/:favoriteId/comments/:commentId", changeComment);

module.exports = router;
