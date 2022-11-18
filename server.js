// ApolloServer
const { ApolloServer, ApolloError } = require('apollo-server');

// mongoose
const mongoose = require('mongoose');
const dbName = 'restoran';

// typeDefs, resolvers
const typeDefs = require('./graphql/typeDefs');
const resolvers = require('./graphql/resolvers');

// makeExecutableSchema
const { makeExecutableSchema } = require('@graphql-tools/schema');

// applySchemaMiddleware
const { applyMiddleware } = require('graphql-middleware');

// morgan
const morgan = require('morgan');

// authMiddleware
const authMiddleware = require('./utils/middleware/authMiddleware');

// authorizationMiddleware
const authorizationMiddleware = require('./utils/middleware/authorizationMiddleware');

// schema
const schema = makeExecutableSchema({ typeDefs, resolvers });

// schema with middleware
const schemaMiddleware = applyMiddleware(schema, authMiddleware, authorizationMiddleware)

// DataLoader
const DataLoader = require('dataloader');

// ingredient loader
const ingredientLoader = require('./utils/loaders/ingredient.loader');

// recipe loader
const recipeLoader = require('./utils/loaders/menu.recipe_id.loader');

// user loader
const userLoader = require('./utils/loaders/transaction.user_id.loader');

// mongoose connect
mongoose.connect(`mongodb://localhost:27017/${dbName}`)
    .then(() => { console.log('MongoDB connections open') })
    .catch((err) => { console.log(err) })

// server
const server = new ApolloServer({
    schema: schemaMiddleware,
    context: ({ req }) => {
        return {
            req,
            ingredientLoader,
            recipeLoader,
            userLoader
        }
    }
});

// server start
server.listen()
    .then(() => { console.log('Server is up.') })
    .catch((err) => { console.log(err) });