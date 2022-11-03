const { gql } = require('apollo-server');

const typeDefs = gql`
    type Book {
        id: ID!
        title: String!
        price: Int!
        author: Author
        countDocs: Int
    }

    type Author {
        id: ID!
        firstName: String!
        lastName: String!
        dob: String
        books: [Book]
    }

    type Query {
        books(id: ID, title: String, page: Int, limit: Int): [Book]
    }
`

module.exports = typeDefs