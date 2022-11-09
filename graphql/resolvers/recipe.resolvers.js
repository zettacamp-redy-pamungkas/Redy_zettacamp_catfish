// recipe model
const RecipeModel = require('../../models/recipes.model');

// Apollo Error
const { ApolloError } = require('apollo-server');

module.exports.recipeMutation = {
    createRecipe: async (_, { recipe_name, input }) => {
        try {
            const newRecipe = new RecipeModel({ recipe_name, ingredients: input });
            console.log(newRecipe);
            await newRecipe.save()
            return newRecipe;
        } catch (err) {
            throw new ApolloError(err);
        }
    }
}