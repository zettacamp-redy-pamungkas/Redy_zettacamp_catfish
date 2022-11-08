// allModels
const { Book, Author } = require('../models/allModels');
const { ApolloError } = require('apollo-server');
const { default: mongoose } = require('mongoose');

const resolvers = {
    Query: {
        getOneBook: async (root, { id }) => {
            try {
                const book = await Book.findById(id).lean();
                book.id = mongoose.Types.ObjectId(book._id);
                book.datePublished = book.datePublished.toLocaleString('en-UK', {
                    year: 'numeric',
                    month: 'long',
                    day: '2-digit'
                })
                return book;
            } catch (err) {
                throw new ApolloError(err)
            }
        },
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

                let books = await Book.find({});
                const totalDocs = books.length;

                if (matchQuery.$and.length > 0) {
                    aggregateBook.push({
                        $match: matchQuery
                    });
                }

                if (aggregateBook.length > 0) {
                    books = (await Book.aggregate(aggregateBook)).map((el) => {
                        el.id = mongoose.Types.ObjectId(el._id);
                        if (page >= 0) {
                            el.countDocs = books.length
                        }
                        return el
                    })
                }
                books = await Book.populate(books, 'author')
                return {
                    books,
                    page: page >= 0 ? `${page + 1} / ${Math.ceil(totalDocs / limit)}` : null,
                    currentDocs: books.length,
                    totalDocs
                };
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
    },
    Mutation: {
        insertOneBook: async (root, args) => {
            // check book is present
            try {
                const book = await Book.find({
                    title: args.title
                })
                if (book.length) {
                    // check author
                    book.forEach((el) => {
                        if (el.author.toString() === args.author) {
                            throw new ApolloError('Book Has Been present')
                        }
                    })
                    let newBook = new Book(args);
                    // check if author exist
                    const author = await Author.findById(newBook.author);
                    if (author) {
                        await newBook.save();
                        await author.updateOne({
                            $push: {
                                books: newBook.id
                            }
                        })
                    } else {
                        throw new ApolloError('Author Doesnt Exist')
                    }
                    newBook = await Book.populate(newBook, 'author');
                    return newBook;
                } else {
                    let newBook = new Book(args);
                    // check if author exist
                    const author = await Author.findById(newBook.author);
                    if (author) {
                        await newBook.save();
                        await author.updateOne({
                            $push: {
                                books: newBook.id
                            }
                        })
                    } else {
                        throw new ApolloError('Author Doesnt Exist')
                    }
                    newBook = await Book.populate(newBook, 'author');
                    return newBook;
                }
            } catch (err) {
                throw new ApolloError(err)
            }
        },
        updateOneBook: async (root, args) => {
            try {
                // check if author exist
                if (args.author) {
                    const author = await Author.findById(args.author);
                    if (!author) {
                        throw new ApolloError('Author Doesnt Exist');
                    }

                    const oldBook = await Book.findById(args.id);

                    if (oldBook.author.toString() !== args.author) {
                        const oldAuthor = await Author.findById(oldBook.author.toString());
                        const newAuthor = await Author.findById(args.author)

                        await oldAuthor.updateOne({
                            $pull: {
                                books: mongoose.Types.ObjectId(args.id)
                            }
                        })
                        await newAuthor.updateOne({
                            $push: {
                                books: mongoose.Types.ObjectId(args.id)
                            }
                        })
                    }
                }

                const book = await Book.findByIdAndUpdate(args.id, args, { new: true, runValidators: true });
                return book.populate('author');

            }
            catch (err) {
                throw new ApolloError(err)
            }
        },
        deleteOneBook: async (root, { id }) => {
            try {
                const book = await Book.findByIdAndDelete(id);
                if (book) {
                    return {
                        status: 'Book has been deleted',
                        book
                    }
                } else {
                    throw new ApolloError('Book not found')
                }
            } catch (err) {
                throw new ApolloError(err)
            }
        },
        buyBook: async (root, {id, total = 1, discount, tax = 10}) => {
            try {
                const book = await Book.findById(id);
                if (book) {
                    if (book.stock < total) {
                        throw new ApolloError('Book Stock not enough')
                    }
                    book.stock -= total;
                    if (total > 4) {
                        discount = discount || 20;
                    }
                    const price_discount = discount ? book.price - (book.price * (discount / 100)) : book.price;
                    const price_tax = price_discount + ( price_discount * (tax / 100));
                    await book.save();
                    return {
                        book,
                        book_bough: total,
                        discount: discount || 0,
                        book_price: price_discount,
                        tax,
                        final_price: price_tax * total
                    }
                } else {
                    throw new ApolloError('Book not found');
                }
            } catch (err) {
                throw new ApolloError(err)
            }
        }
    }
}

module.exports = resolvers