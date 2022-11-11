// Recipe Model
const RecipeModel = require('../../models/recipes.model');

// data loader
const DataLoader = require('dataloader');

// Apollo Error
const { ApolloError } = require('apollo-server');

async function getRecipeByIds(ids) {
    try {
        const recipes = await RecipeModel.find({
            _id: { $in: ids }
        });

        const recipesMap = {}

        recipes.forEach((recipe) => recipesMap[recipe.id] = recipe);

        return ids.map((id) => recipesMap[id])
    }
    catch (err) {
        throw new ApolloError(err);
    }
}

const recipeLoader = new DataLoader(getRecipeByIds);
module.exports = recipeLoader;