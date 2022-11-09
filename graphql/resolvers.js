// user resolver
const {userQuery, userMutation} = require('./resolvers/user.resolvers');
const {ingredientMutation} = require('../graphql/resolvers/ingredient.resolvers');

module.exports = {
    Query: {
        ...userQuery,
    },
    Mutation: {
        ...userMutation,
        ...ingredientMutation,
    }
}