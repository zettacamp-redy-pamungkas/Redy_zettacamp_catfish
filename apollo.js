// Apollo
const { ApolloServer, ApolloError } = require('apollo-server');

// typeDefs, resolver
const typeDefs = require('./graphql/typeDefs');
const resolvers = require('./graphql/resolvers');

// mongoose
const mongoose = require('mongoose');

// mongoose connect
mongoose.connect('mongodb://localhost:27017/bookStore')
    .then(() => { console.log('mongoDB connection open') })
    .catch((err) => { console.log(err) })

const server = new ApolloServer({
    typeDefs,
    resolvers
})

server.listen()
    .then(() => { console.log('Apollo Server is running on port: 4000') })
    .catch((err) => { console.log(err) });
