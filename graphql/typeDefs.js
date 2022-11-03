const { gql } = require('apollo-server');

const typeDefs = gql`
    type Book {
        id: ID!
        title: String!
        price: Int
        stock: Int
        author: Author
        countDocs: Int
    }

    type BookDeleted {
        status: String
        book: Book
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
        authors: [Author]
    }

    
    type Mutation {
        insertOneBook(title: String! author: ID!, price: Int!, stock: Int): Book
        updateOneBook(id: ID!, title: String, author: ID, price: Int, stock: Int): Book
        deleteOneBook(id: ID!): BookDeleted
    }
`

module.exports = typeDefs