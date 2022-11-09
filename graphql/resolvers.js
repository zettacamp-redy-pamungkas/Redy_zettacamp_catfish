// user resolvers
const { userQuery, userMutation } = require('./resolvers/user.resolvers');

// ingredient resolvers
const { ingredientQuery, ingredientMutation } = require('../graphql/resolvers/ingredient.resolvers');

// recipe resolvers
const { recipeMutation } = require('../graphql/resolvers/recipe.resolvers');
module.exports = {
    Query: {
        ...userQuery,
        ...ingredientQuery,
    },
    Mutation: {
        ...userMutation,
        ...ingredientMutation,
        ...recipeMutation,
    }
}