// Ingredient model
const IngredientModel = require('../../models/ingredient.model');

// Recipe Model
const RecipeModel = require('../../models/recipes.model');

// Apollo Error
const { ApolloError } = require('apollo-server');
const { default: mongoose } = require('mongoose');

// Check if ingredient is used by recipe
async function findIngredientInRecipe({ id }) {
    let recipes = await RecipeModel.find({ ingredients: { $elemMatch: { ingredient_id: mongoose.Types.ObjectId(id) } } });
    if (!recipes.length) return false;
    return true;
}

module.exports.ingredientIsUsed = {
    isUsed: findIngredientInRecipe
}