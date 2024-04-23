require("dotenv").config();
const express = require("express");
const cors = require("cors");
const app = express();
const PORT = process.env.PORT || 3001;
const router = require("./routes/recipesRoutes");
const cookieParser = require("cookie-parser");

const mongoose = require("mongoose");
mongoose
  .connect(process.env.DB_CONNECT, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("MongoDB connected..."))
  .catch((err) => console.log(err));

app.use(cookieParser());

//for sending cookies with axios req
app.use(
  cors({
    credentials: true,
    origin: (origin, callback) => callback(null, true),
  })
);
app.use(express.json());
app.use(router);

app.get("/", (req, res) => {
  res.send(
    "<h1>Welcome to Gluten Free Recipes API!</h1> <p>Enjoy the following features:</p><ul><li>'/all' - Get 10 gluten recipes from RapidAPI</li><li>'/favorites' - Get the list of your chosen favorite recipes</li><li>'/favorites/:id(example - 189909, 608074)' - Add a new recipe to your favorites</li><li>'/favorites/:id(189909, 608074)' - Remove a recipe from your list by :id</li><li>'/favorites/:id/comments' - Add a comment to a specific recipe</li><li>'/favorites/:favoriteId(example - 189909, 608074)/comments/:commentId' - Modify a specific comment</li></ul>"
  );
});

app.listen(PORT, () => {
  console.log(`Server is running on PORT ${PORT}`);
});
