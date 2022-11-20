// ApolloError
const { ApolloError } = require('apollo-server');

function authorizationMiddleware(resolvers, parent, args, context, info) {
    // if (context.req.user_role.user_type) {
    //     if (context.req.user_role.user_type !== "admin")
    // }
    if (context.req.user_role.user_type !== "admin") throw new ApolloError('Forbidden', "403");
    return resolvers(parent, args, context, info)
}

function authorizationMiddlewareUser(resolvers, parent, args, context, info) {
    console.log(context.req.user_role.user_type);
    if (context.req.user_role.user_type === "user") throw new ApolloError('Forbidden', "403");
    return resolvers(parent, args, context, info)
}

module.exports = {
    Query: {
        getAllUsers: authorizationMiddleware,
        getOneUser: authorizationMiddleware,
        getAllIngredient: authorizationMiddleware,
        getOneIngredient: authorizationMiddleware,
        getAllRecipes: authorizationMiddleware,

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