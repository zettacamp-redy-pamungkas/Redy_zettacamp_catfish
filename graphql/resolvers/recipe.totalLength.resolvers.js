// ApolloError
const { ApolloError } = require('apollo-server');

// const Recipe Model
const RecipeModel = require('../../models/recipes.model');

async function totalLengthIngredients({ ingredients }) {
    return ingredients.length
}

module.exports.recipe_totalLength = {
    totalLength: totalLengthIngredients
}