// ApolloError
const { ApolloError } = require('apollo-server');

// jwt
const jwt = require('jsonwebtoken');

// status code
const status_code = require('../status_code');

async function authMiddleware(resolve, parent, args, context, info) {
    const token = context.req.headers.authorization || '';

    if (!token) {
        throw new ApolloError('You are not Authorize.', status_code[401]);
    }

    jwt.verify(token, 'privateKey', (err, decoded) => {
        if (err) {
            throw new ApolloError(err, status_code[401]);
        }
        context.req.user_id = decoded.user_id;
    });

    return resolve(parent, args, context, info);
}

module.exports = {
    Query: {
        getAllUsers: authMiddleware,
        getOneUser: authMiddleware,
        getAllIngredient: authMiddleware,
        getOneIngredient: authMiddleware,
        getAllRecipe: authMiddleware,
        getOneRecipe: authMiddleware,
        getOneTransaction: authMiddleware,

    },
    Mutation: {
        updateUser: authMiddleware,
        deleteUser: authMiddleware,
        createTransaction: authMiddleware,
        deleteTransaction: authMiddleware,
        createIngredient: authMiddleware,
        updateIngredient: authMiddleware,
        deleteIngredient: authMiddleware,
        createRecipe: authMiddleware,
        updateRecipe: authMiddleware,
        deleteRecipe: authMiddleware,
    }
}