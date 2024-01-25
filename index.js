require("dotenv").config();
const express = require("express");
const app = express();
const PORT = process.env.PORT || 3000;
const router = require("./routes/recipesRoutes");

const mongoose = require("mongoose");
mongoose
  .connect(process.env.DB_CONNECT, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("MongoDB connected..."))
  .catch((err) => console.log(err));

app.use(express.json());
app.use(router);

app.get("/", (req, res) => {
  res.send(
    "Welcome to Gluten Free Recipes API! Here you can search for random 10 gluten free recipes. Add recipes to your favourites. Update and delete your favourite recipes list"
  );
});

app.listen(PORT, () => {
  console.log("Server is running on PORT 3000");
});
