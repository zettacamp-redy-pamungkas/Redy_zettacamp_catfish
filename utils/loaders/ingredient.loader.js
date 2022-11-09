// Ingredeint Model
const IngredientModel = require('../../models/ingredient.model');

// DataLoader
const DataLoader = require('dataloader');

async function loadIngredient(ids) {
    const ingredients = await IngredientModel.find({
        _id: { $in: ids}
    });

    const ingredientMap = {};

    ingredients.forEach((ingredient) => {
        ingredientMap[ingredient.id] = ingredient
    })

    return ids.map((id) => ingredientMap[id])
}

const ingredientLoader = new DataLoader(loadIngredient);

module.exports = ingredientLoader