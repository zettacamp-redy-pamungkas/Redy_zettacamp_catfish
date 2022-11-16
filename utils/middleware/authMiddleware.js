// ApolloError
const { ApolloError } = require('apollo-server');

// jwt
const jwt = require('jsonwebtoken');

// status code
const status_code = require('../status_code');

async function authMiddleware(resolve, parent, args, context, info) {
    let token = context.req.headers.authorization || '';
    token = token.replace('Bearer ', "");

    console.log("auth middleware token:", token);

    if (!token) {
        throw new ApolloError('You are not Authorize.', status_code[401]);
    }

    jwt.verify(token, 'privateKey', (err, decoded) => {
        if (err) {
            throw new ApolloError(err, status_code[401]);
        }
        console.log("auth middleware", decoded)
        context.req.user_id = decoded.user_id;
        context.req.user_role = decoded.user_role;
    });

    return resolve(parent, args, context, info);
}

module.exports = {
    Query: {
        getAllUsers: authMiddleware,
        getOneUser: authMiddleware,
        getAllIngredient: authMiddleware,
        getOneIngredient: authMiddleware,
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