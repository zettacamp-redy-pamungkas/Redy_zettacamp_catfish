// ApolloError
const { ApolloError } = require('apollo-server');

// ingredient model
const IngredientModel = require('../../models/ingredient.model');

async function getAvailable({ ingredients }, args, context, info) {
    const minStock = []
    for (let ingredient of ingredients) {
        const recipe_ingredient = await IngredientModel.findById(ingredient.ingredient_id);
        if (!recipe_ingredient) throw new ApolloError(`Ingredient with ID: ${ingredient.ingredient_id} not found`, "404");
        minStock.push(Math.floor(recipe_ingredient.stock / ingredient.stock_used));
    }
    return Math.min(...minStock);
}

module.exports.recipe_available = {
    available: getAvailable
}