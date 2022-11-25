// recipe model
const RecipeModel = require('../../models/recipes.model');

// Apollo Error
const { ApolloError } = require('apollo-server');

async function getTotalPrice({ menu }) {
    try {
        let menu_totalPrice = 0;
        for (let el of menu) {
            const recipe = await RecipeModel.findById(el.recipe_id).lean();
            { recipe.price = Math.floor(recipe.price * (1 - 0.7)); console.log(`recipe: ${recipe.recipe_name} diskon cuy, price: ${recipe.price}`) }
            menu_totalPrice += (recipe.price * el.amount);
        }
        return menu_totalPrice;
    } catch (error) {
        throw new ApolloError(err);
    }
}

module.exports.transaction_totalPrice = {
    total_price: getTotalPrice
}