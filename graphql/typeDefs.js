const { gql } = require('apollo-server');

const typeDefs = gql`
    type Book {
        id: ID!
        title: String!
        price: Int
        stock: Int
        author: Author
        datePublished: String
        countDocs: Int
    }

    type Books {
        books: [Book]
        page: String
        totalDocs: Int
        currentDocs: Int
    }

    type BookDeleted {
        status: String
        book: Book
    }

    type BookBough {
        book: Book
        book_bough: Int
        discount: Int
        book_price: Int
        tax: Int
        final_price: Int
    }

    type Author {
        id: ID!
        firstName: String!
        lastName: String!
        dob: String
        books: [Book]
    }

    type Query {
        getOneBook(id: ID!) : Book
        books(id: ID, title: String, page: Int, limit: Int): Books
        authors: [Author]
    }

    
    type Mutation {
        insertOneBook(title: String! author: ID!, price: Int!, stock: Int): Book
        updateOneBook(id: ID!, title: String, author: ID, price: Int, stock: Int): Book
        deleteOneBook(id: ID!): BookDeleted
        buyBook(id: ID!, total: Int, discount: Int, tax: Int): BookBough
    }
`

module.exports = typeDefs