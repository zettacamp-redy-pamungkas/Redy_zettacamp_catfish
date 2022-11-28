// recipe model
const RecipeModel = require('../../models/recipes.model');

// Apollo Error
const { ApolloError } = require('apollo-server');

async function getTotalPrice({ recipe_id, amount }, args, context) {
    try {
        const recipe = await RecipeModel.findById(recipe_id);
        const price = recipe.special_offer ? Math.floor(recipe.price * (1 - (recipe.discount / 100))) : recipe.price;
        return price * amount;
    } catch (err) {
        throw new ApolloError(err);
    }
}

module.exports.menu_totalPrice = {
    total_price: getTotalPrice
}