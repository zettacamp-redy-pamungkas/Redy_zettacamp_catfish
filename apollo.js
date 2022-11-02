const { ApolloServer, gql } = require('apollo-server');

const mongoose = require('mongoose');
// momgoose
mongoose.connect('mongodb://localhost:27017/bookStore')
    .then(() => { console.log('MongoDB connections open.') })
    .catch((err) => { console.log(err) })

// All Models
const { Book, Author, Bookshelf } = require('./models/allModels');

const typeDefs = gql`
    type Book {
        id: ID
        title: String,
        price: Int,
        author: ID!
    }

    type Author {
        id: ID
        firstName: String,
        lastName: String!
        dob: String
    }

    type Query {
        books(id: ID, title: String, author: ID, page: Int, limit: Int): [Book]
        book(id: ID!): Book
        authors: [Author]
    }
`;

const resolvers = {
    Query: {
        books: async (parent, { id, title, author, page, limit = 5 }) => {
            const agregateBooks = []
            const queryMatch = { $and: [] };

            if (id) {
                const book = await Book.findById(id);
                return [book]
            }

            if (title) {
                queryMatch.$and.push({ title });
                console.log(title)
            }

            if (author) {
                queryMatch.$and.push({ author: mongoose.Types.ObjectId(author) });
            }

            if (page) {
                page = parseInt(page) - 1;
                if (Number.isNaN(page) || page < 0) {
                    page = 0;
                }

                limit = parseInt(limit);
                if (Number.isNaN(limit) || limit < 0) {
                    limit = 5
                }

                agregateBooks.push({
                    $skip: page * limit
                },
                    {
                        $limit: limit
                    })
            }

            if (queryMatch.$and.length) {
                agregateBooks.push({
                    $match: queryMatch
                })
            }

            let books = await Book.find({});
            if (agregateBooks.length) {
                books = (await Book.aggregate(agregateBooks)).map((el) => { el.id = mongoose.Types.ObjectId(el.id); return el})
            }
            return books
        },
        book: async (parent, { id }) => {
            const books = await Book.findById(id);
            return books
        },
        authors: async () => {
            const authors = await Author.find({});
            return authors;
        }
    }
}

const apolloServer = new ApolloServer({
    typeDefs,
    resolvers,

})

apolloServer.listen(8000, () => {
    console.log('Apollo Server running on port: 8000')
})