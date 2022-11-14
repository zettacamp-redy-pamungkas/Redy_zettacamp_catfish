// ApolloError
const { ApolloError } = require('apollo-server');

function authorizationMiddleware(resolvers, parent, args, context, info) {
    console.log(context.req.user_role)
    if (context.req.user_role !== "admin") throw new ApolloError('Forbidden');
    return resolvers(parent, args, context, info)
}

module.exports = {
    Query: {
        getAllUsers: authorizationMiddleware,
        getOneUser: authorizationMiddleware,
        getAllIngredient: authorizationMiddleware,
        getOneIngredient: authorizationMiddleware,
    },
    Mutation: {
        updateUser: authorizationMiddleware,
        deleteUser: authorizationMiddleware,
        createIngredient: authorizationMiddleware,
        updateIngredient: authorizationMiddleware,
        deleteIngredient: authorizationMiddleware,
        createRecipe: authorizationMiddleware,
        updateRecipe: authorizationMiddleware,
        deleteRecipe: authorizationMiddleware,
    }
}