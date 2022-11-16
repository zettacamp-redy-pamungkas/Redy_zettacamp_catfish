// Recipe Model
const RecipeModel = require('../models/recipes.model');

// mongoose
const mongoose = require('mongoose');

// mongoose connect
mongoose.connect('mongodb://localhost:27017/restoran')
    .then(() => console.log('MongoDB conection open'))
    .catch((err) => console.log(err))

// 
async function findIngredientInRecipe(id) {
    let recipes = await RecipeModel.find({ ingredients: { $elemMatch: { ingredient_id: mongoose.Types.ObjectId(id) } } });
    recipes = recipes.map((recipe) => recipe.recipe_name);
    // console.log(...recipes);
    if (!recipes.length) return true;
    console.log(`this ingredient has been used by: ${recipes}`);
    return false;
}
let isCanBeDeleted = null;
async function seeds() {
    isCanBeDeleted = await findIngredientInRecipe("6373082ccd2438b596fcfd8d");
    console.log(isCanBeDeleted);
}

seeds();