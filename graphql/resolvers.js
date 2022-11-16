// user resolvers
const { userQuery, userMutation } = require('./resolvers/user.resolvers');

// ingredient resolvers
const { ingredientQuery, ingredientMutation } = require('../graphql/resolvers/ingredient.resolvers');

// recipe resolvers
const { recipeQuery, recipeMutation, Recipe } = require('../graphql/resolvers/recipe.resolvers');

// RecipeForIngredient
const { IngredientForRecipe } = require('./resolvers/ingredientForRecipe.resolvers');

// Recipe available
const { recipe_available } = require('../graphql/resolvers/recipe.available.resolvers');

//  Menu -> recipe_id
const { recipe_id } = require('./resolvers/menu.ingredient_id.resolvers');

// Transaction -> user_id
const { user_id } = require('./resolvers/transaction.user_id.resolvers')

// Tranasactions resolver
const { transactionQuery, transactionMutation } = require('./resolvers/transaction.resolvers');

module.exports = {
    Query: {
        ...userQuery,
        ...ingredientQuery,
        ...recipeQuery,
        ...transactionQuery,
    },
    Mutation: {
        ...userMutation,
        ...ingredientMutation,
        ...recipeMutation,
        ...transactionMutation,
    },
    IngredientForRecipe: {
        ...IngredientForRecipe,
    },
    Menu: {
        ...recipe_id
    },
    Transaction: {
        ...user_id
    },
    Recipe: {
        ...recipe_available,
        // available: async ({ingredients}) => { const ingredient = await IngredientModel.findById(ingre)}
    },
}