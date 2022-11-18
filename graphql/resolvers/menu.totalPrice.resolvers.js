// recipe model
const RecipeModel = require('../../models/recipes.model');

// Apollo Error
const { ApolloError } = require('apollo-server');

async function getTotalPrice({recipe_id, amount}, args, context) {
    try {
        const recipe = await RecipeModel.findById(recipe_id);
        const price = recipe.price;
        return price * amount;
    } catch (err) {
        throw new ApolloError(err);
    }
}

module.exports.menu_totalPrice = {
    total_price: getTotalPrice
}