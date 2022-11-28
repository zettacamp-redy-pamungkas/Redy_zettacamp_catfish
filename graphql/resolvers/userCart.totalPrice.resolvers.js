// recipe model
const RecipeModel = require('../../models/recipes.model');

// Apollo Error
const { ApolloError } = require('apollo-server');

async function getTotalPrice({ cart }) {
    try {
        let cart_totalPrice = 0;
        for (let el of cart) {
            const recipe = await RecipeModel.findById(el.recipe_id).lean();
            if (recipe.special_offer) { recipe.price = Math.floor(recipe.price * (1 - (recipe.discount / 100))) }
            cart_totalPrice += (recipe.price * el.amount);
        }
        return cart_totalPrice;
    } catch (error) {
        throw new ApolloError(err);
    }
}

module.exports.userCart_totalPrice = {
    total_price: getTotalPrice
}