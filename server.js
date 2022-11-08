// ApolloServer
const { ApolloServer, ApolloError } = require('apollo-server');

// mongoose
const mongoose = require('mongoose');
const dbName = 'restoran';

// typeDefs, resolvers
const typeDefs = require('./graphql/typeDefs');
const resolvers = require('./graphql/resolvers');

// makeExecutableSchema
const { makeExecutableSchema } = require('@graphql-tools/schema')

// schema
const schema = makeExecutableSchema({ typeDefs, resolvers });

// mongoose connect
mongoose.connect(`mongodb://localhost:27017/${dbName}`)
    .then(() => { console.log('MongoDB connections open') })
    .catch((err) => { console.log(err) })

// server
const server = new ApolloServer({
    schema,
    context: ({ req }) => {
        return {
            req: req
        }
    }
});

// server start
server.listen()
    .then(() => { console.log('Server is up.') })
    .catch((err) => { console.log(err) });