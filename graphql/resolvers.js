// user resolver
const { userQuery, userMutation } = require('./resolvers/user.resolvers');
const { ingredientQuery, ingredientMutation } = require('../graphql/resolvers/ingredient.resolvers');

module.exports = {
    Query: {
        ...userQuery,
        ...ingredientQuery,
    },
    Mutation: {
        ...userMutation,
        ...ingredientMutation,
    }
}