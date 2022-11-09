// ingredient model
const IngredientModel = require('../../models/ingredient.model');

// 
async function getIngredientLoader(parent, args, context) {
    if (parent.ingredient_id) {
        let check = await context.ingredientLoader.load(parent.ingredient_id);
        return check;
    }
}

module.exports.IngredientForRecipe = {
    ingredient_id: getIngredientLoader
}
