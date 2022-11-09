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

// authMiddleware
const authMiddleware = require('./utils/middleware/authMiddleware');

// schema
const schema = makeExecutableSchema({ typeDefs, resolvers });

// schema with middleware
const schemaMiddleware = applyMiddleware(schema, authMiddleware)

// DataLoader
const DataLoader = require('dataloader');

// ingredient loader
const ingredientLoader = require('./utils/loaders/ingredient.loader');

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
            ingredientLoader
        }
    }
});

// server start
server.listen()
    .then(() => { console.log('Server is up.') })
    .catch((err) => { console.log(err) });