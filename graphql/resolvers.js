// allModels
const { Book, Author } = require('../models/allModels');
const { ApolloError } = require('apollo-server');
const { default: mongoose } = require('mongoose');

const resolvers = {
    Query: {
        books: async (root, { id, title, page, limit = 5 }) => {
            try {
                const aggregateBook = [];
                const matchQuery = { $and: [] };
                if (id) {
                    const book = await Book.findById(id);
                    return [book]
                }

                if (title) {
                    matchQuery.$and.push({ title })
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

                    aggregateBook.push(
                        {
                            $skip: page * limit
                        },
                        {
                            $limit: limit
                        })
                }

                let books = await Book.find({})

                if (matchQuery.$and.length > 0) {
                    aggregateBook.push({
                        $match: matchQuery
                    });
                }

                if (aggregateBook.length > 0) {
                    books = (await Book.aggregate(aggregateBook)).map((el) => { 
                        el.id = mongoose.Types.ObjectId(el.id); 
                        if (page >= 0) {
                            el.countDocs = books.length
                        }
                        return el })
                }
                return books;
            } catch (err) {
                throw new ApolloError(err)
            }
        },
        authors: async () => {
            try {
                const authors = await Author.find({})
                                    .populate({
                                        path: 'books'
                                    });
                return authors
            } catch (err) {
                throw new ApolloError(err)
            }
        }
    }
}

module.exports = resolvers