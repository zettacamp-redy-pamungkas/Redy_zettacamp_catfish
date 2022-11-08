// ApolloError
const { ApolloError } = require('apollo-server');

// jwt
const jwt = require('jsonwebtoken');

async function authMiddleware(resolve, parent, args, context, info) {
    const token = context.req.headers.authorization || '';

    if (!token) {
        throw new ApolloError('You are not Authorize.');
    }

    jwt.verify(token, 'privateKey', (err, decoded) => {
        if (err) {
            throw new ApolloError(err);
        }
        context.req.user_id = decoded.user_id;
    });

    return resolve(parent, args, context, info);
}

module.exports = {
    Query: {
        getAllUsers: authMiddleware
    }
}