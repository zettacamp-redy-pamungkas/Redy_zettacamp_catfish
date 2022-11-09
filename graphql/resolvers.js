// user resolvers
const { userQuery, userMutation } = require('./resolvers/user.resolvers');

// ingredient resolvers
const { ingredientQuery, ingredientMutation } = require('../graphql/resolvers/ingredient.resolvers');

// recipe resolvers
const { recipeQuery, recipeMutation, Recipe } = require('../graphql/resolvers/recipe.resolvers');

// RecipeForIngredient
const {IngredientForRecipe} = require('./resolvers/ingredientForRecipe.resolvers');
module.exports = {
    Query: {
        ...userQuery,
        ...ingredientQuery,
        ...recipeQuery,
    },
    Mutation: {
        ...userMutation,
        ...ingredientMutation,
        ...recipeMutation,
    },
    IngredientForRecipe: {
        ...IngredientForRecipe,
    }
}