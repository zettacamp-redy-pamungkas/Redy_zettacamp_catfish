// user resolvers
const { userQuery, userMutation } = require('./resolvers/user.resolvers');

// ingredient resolvers
const { ingredientQuery, ingredientMutation } = require('../graphql/resolvers/ingredient.resolvers');

// Ingredient isUsed resolvers
const { ingredientIsUsed } = require('../graphql/resolvers/ingredient.isUsed.resolvers');

// recipe resolvers
const { recipeQuery, recipeMutation, Recipe } = require('../graphql/resolvers/recipe.resolvers');

// recipe totalLength
const { recipe_totalLength } = require('../graphql/resolvers/recipe.totalLength.resolvers');

// RecipeForIngredient
const { IngredientForRecipe } = require('./resolvers/ingredientForRecipe.resolvers');

// Recipe available
const { recipe_available } = require('../graphql/resolvers/recipe.available.resolvers');

//  Menu -> recipe_id
const { recipe_id } = require('./resolvers/menu.ingredient_id.resolvers');

// Menu -> recipe_special_offer_price
const { recipe_specialOfferPrice } = require('./resolvers/recipe.special_offer_price');

// Transaction -> user_id
const { user_id } = require('./resolvers/transaction.user_id.resolvers');

// Tranasactions resolver
const { transactionQuery, transactionMutation } = require('./resolvers/transaction.resolvers');

// transaction totalPrice
const { transaction_totalPrice } = require('../graphql/resolvers/transaction.totalPrice.resolvers');

// Cart Resolvers
const { cartMutation, cartQuery } = require('../graphql/resolvers/cart.resolvers');

// Menu Resolvers
const { menu_totalPrice } = require('../graphql/resolvers/menu.totalPrice.resolvers');

// User Cart total price Resolvers
const { userCart_totalPrice } = require('../graphql/resolvers/userCart.totalPrice.resolvers');

// User Cart cart length resolvers
const { userCart_length } = require('../graphql/resolvers/userCart.cartLength.resolvers');



module.exports = {
    Query: {
        ...userQuery,
        ...ingredientQuery,
        ...recipeQuery,
        ...transactionQuery,
        ...cartQuery,
    },
    Mutation: {
        ...userMutation,
        ...ingredientMutation,
        ...recipeMutation,
        ...transactionMutation,
        ...cartMutation,
    },
    IngredientForRecipe: {
        ...IngredientForRecipe,
    },
    Menu: {
        ...recipe_id,
        ...menu_totalPrice,
    },
    Transaction: {
        ...user_id,
        ...transaction_totalPrice,
    },
    Recipe: {
        ...recipe_available,
        ...recipe_totalLength,
        ...recipe_specialOfferPrice,
    },
    Ingredient: {
        ...ingredientIsUsed,
    },
    UserCart: {
        ...userCart_totalPrice,
        ...userCart_length,
    }
}