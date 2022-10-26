// Express
const express = require('express');
const app = express();
const port = 3000;

// mongoose
const mongoose = require('mongoose')
const { ObjectId } = mongoose.Types;
const dbName = 'bookStore';

// Book, Author
const { Book, Author, Bookshelf } = require('./models/allModels');
// const Book = require('./models/book');
// const Author = require('./models/author');

// mongoose connections
mongoose.connect(`mongodb://localhost:27017/${dbName}`)
    .then(() => {
        console.log('MongoDB connection Open');
    })
    .catch((err) => {
        console.log(err);
    });

// funtion getRandomMinMax
function getRandomMinMax(min, max) {
    if (min > max) {
        [min, max] = [max, min];
    }
    return Math.floor(Math.random() * (max - min)) + min;
}

// BOOK ROUTE
// GET '/books/' route
app.get('/books', async (req, res) => {
    let allBooks = await Book.find({}).populate('author', 'firstName lastName');
    res.json(allBooks);
});

// GET '/books/detail/:id' route
app.get('/books/detail/:id', async (req, res, next) => {
    try {
        const { id } = req.params;
        const book = await Book.findById(id).populate('author', 'firstName lastName dob');
        if (book) {
            res.json(book);
        } else {
            next(new Error(`Book with id ${id} not found.`))
        }
    } catch (err) {
        next(err)
    }
});

// POST 'books/new' route
app.post('/books/new', express.urlencoded({ extended: true }), async (req, res, next) => {
    try {
        let { book } = req.body
        const randomPublished = new Date(`${getRandomMinMax(2000, 2012)}-${getRandomMinMax(1, 12)}-${getRandomMinMax(1, 30)}`);
        book.datePublished = randomPublished;
        // check author
        if (book.author) {
            let authors_id = await Author.find({});
            authors_id = authors_id.map((el) => { return el.id })
            if (authors_id.includes(book.author)) {
                book = new Book(book);
                const author = await Author.findById(book.author);
                author.books.push(book);
                await Promise.all([author.save(), book.save()]);
                res.json({
                    status: 'ok',
                    message: book
                });
            } else {
                next(new Error('Author Id not found.'))
            }
        } else {
            book = new Book(book);
            await book.save()
            res.json({
                status: 'ok',
                message: book
            })
        }
    } catch (err) {
        next(err)
    }
});

// PUT '/buku/detail/:id' route
app.put('/books/detail/:id', express.urlencoded({ extended: true }), async (req, res, next) => {
    try {
        const { id } = req.params;
        const { book } = req.body;
        book.updatedAt = new Date();
        const updatedBook = await Book.findByIdAndUpdate(id, book, { new: true, runValidators: true });

        res.json({
            status: 'ok',
            message: updatedBook
        });
    } catch (err) {
        next(err)
    }
});

// DELETE '/buku/detail/:id' route
app.delete('/books/detail/:id', async (req, res, next) => {
    try {
        const { id } = req.params;

        // Pull Book from author.books
        const book = await Book.findById(id);
        const author = await Author.findById(book.author);
        await author.update({
            $pull: {
                books: book.id
            }
        })

        // Delete Book
        await Book.findByIdAndDelete(id);
        res.json({
            status: 'ok',
            message: `Book with id ${id} has been deleted`
        })
    } catch (err) {
        next(err)
    }
})



// END BOOK ROUTE

// AUTHOR ROUTE
// GET '/authors' route
app.get('/authors', async (req, res) => {
    const allAuthors = await Author.find({}).populate('books', 'title');
    res.json(allAuthors);
});

// GET '/authors/detail/:id' route
app.get('/authors/detail/:id', async (req, res, next) => {
    try {
        const { id } = req.params;
        const author = await Author.findById(id).populate('books');
        res.json(
            author
        )
    } catch (err) {
        next(err)
    }
})

// POST '/authors/new' route
app.post('/authors/new', express.urlencoded({ extended: true }), async (req, res) => {
    try {
        const { author } = req.body;
        const randomDOB = `${getRandomMinMax(1975, 1985)}-${getRandomMinMax(1, 12)}-${getRandomMinMax(1, 30)}`;
        author.dob = new Date(randomDOB);
        const newAuthor = new Author(author);
        await newAuthor.save();
        res.json({
            status: 'ok',
            message: newAuthor
        })
    } catch (err) {
        next(err)
    }
});

// DELETE '/authors/detail/:id' route
app.delete('/authors/detail/:id', async (req, res, next) => {
    try {
        const { id } = req.params;

        // On Delete, Delete All Books with
        const author = await Author.findById(id);
        if (author.books.length) {
            await Book.deleteMany({
                _id: {
                    $in: author.books
                }
            })
        }

        await Author.findByIdAndDelete(id);
        res.json({
            status: 'ok',
            message: `Author with id: ${id} has been deleted.`,
        })
    } catch (err) {
        next(err)
    }
})
// END AUTHOR ROUTE

// BOOKSHELF ROUTER
// GET '/bookshelfes' route
app.get('/bookshelfes', async (req, res, next) => {
    try {
        const { _id, bookId } = req.query;
        let bookshelfes = await Bookshelf.find({
        }).populate({
            path: 'books',
            populate: {
                path: 'object_id',
                select: 'title'
            },
        });

        // find bookshelf by id
        if (_id) {
            bookshelfes = await Bookshelf.findById(_id).populate({
                path: 'books',
                populate: {
                    path: 'object_id',
                    select: 'title'
                },
            });
        }

        // Find Books with id
        if (bookId) {
            bookshelfes = await Bookshelf.find({
                books: {
                    $elemMatch: {
                        object_id: {
                            $eq: ObjectId(bookId)
                        }
                    }
                    // $all: bookId.split(' ').map((el) => { return ObjectId(el) })
                }
            }).populate({
                path: 'books',
                populate: {
                    path: 'object_id',
                    select: 'title'
                },
            });
        }

        if (bookshelfes.length === 0) {
            res.json({
                status: 404,
                message: 'Bookshelf not found'
            });
        } else {
            res.json({
                status: 200,
                message: bookshelfes
            });
        }

    } catch (err) {
        next(err)
    }
});

// POST '/bookshelfes/create' route
app.post('/bookshelfes/create', express.urlencoded({ extended: true }), async (req, res, next) => {
    try {
        let { shelfes } = req.body;
        const shelvesBookArr = shelfes.books.split(' ');
        const shelvesStockArr = shelfes.stock.split(' ').map((el) => { return parseInt(el) });
        const bookArr = [];
        shelvesBookArr.forEach((book, index) => {
            bookArr.push({
                book_id: ObjectId(book),
                stock: shelvesStockArr[index]
            });
        });
        shelfes.books = bookArr;

        // random date
        const randomDateArr = [];
        for (let j = 0; j < 5; j++) {
            randomDateArr.push({
                date: new Date(`${getRandomMinMax(2015, 2022)}-10-26`),
                time: `${getRandomMinMax(0, 24)}:${getRandomMinMax(0, 59)}`
            })
        }
        shelfes.date = randomDateArr;
        const newShelf = new Bookshelf(shelfes);
        await newShelf.save()
        res.send({
            status: 201,
            message: newShelf
        })
    } catch (err) {
        next(err)
    }
});

// PUT add
app.put('/bookshelfes/addbooks', express.urlencoded({ extended: true }), async (req, res, next) => {
    try {
        const { shelf } = req.body;
        const bookshelf = await Bookshelf.findById(shelf.id);
        const books = shelf.books.split(' ').map((el) => { return ObjectId(el) });

        // check if duplicate
        for (let book of books) {
            console.log(book)
            if (bookshelf.books.includes(book)) {
                next(new Error(`${book} sudah ada.`))
            } else {
                bookshelf.books.push(book);
                await bookshelf.save();
            }
        }
        res.json({
            status: 200,
            message: bookshelf
        })
    } catch (err) {
        next(err)
    }
});

// PUT delete book id
app.put('/bookshelfes/deletebooks', express.urlencoded({ extended: true }), async (req, res, next) => {
    try {
        const { shelf } = req.body;
        const bookshelf = await Bookshelf.findById(shelf.id);
        const books = shelf.books.split(' ').map((el) => { return ObjectId(el) });
        const updatedBookshelf = await bookshelf.update({
            $pullAll: {
                books: books
            }
        }, {
            new: true
        })
        res.json({
            status: 201,
            message: updatedBookshelf
        })
    } catch (err) {
        next(err);
    }
});

// Update shelf date
app.put('/bookshelfes/:id/:key', express.urlencoded({ extended: true }), async (req, res, next) => {
    try {
        const { id, key } = req.params;
        let { date, updatedDate } = req.body;

        if (key === 'shelf') {
            const shelf = await Bookshelf.updateOne({
                "_id": ObjectId(id)
            },
                {
                    $set: {
                        "date.$[index].date": new Date(updatedDate),
                        updatedAt: new Date()
                    }
                },
                {
                    arrayFilters: [{
                        "index.date": {
                            $lt : new Date(date)
                        }
                    }]
                })
                res.json({
                    status: 201,
                    message: shelf
                })
        } else

        if (key === 'books') {
            const shelf = await Bookshelf.updateOne({
                "_id": ObjectId(id)
            },
                {
                    $set: {
                        "books.$[index].added": new Date(updatedDate),
                        updatedAt: new Date()
                    }
                },
                {
                    arrayFilters: [{
                        "index.added": {
                            $gte : new Date(date)
                        }
                    }]
                })
                res.json({
                    status: 201,
                    message: shelf
                })
        } else {
            res.json({
                status: 400,
                message: `${key} is not defined, please use shelf or books`
            })
        }

    } catch (err) {
        next(err)
    }

})

app.delete('/bookshelfes/:id', async (req, res, next) => {
    try {
        const { id } = req.params;
        await Bookshelf.findByIdAndDelete(id);
        res.json({
            status: 200,
            message: `Bookshelf with id: ${id} has been deleted`
        });
    } catch (err) {
        next(err);
    }
})
// END BOOKSHELF ROUTER

// Express Not Found Route
app.use((req, res, next) => {
    res.json({
        status: 404,
        message: `Cannot find ${req.method} ${req.path} route`
    });
});


// Express Error Handler
app.use((err, req, res, next) => {
    const { message } = err;
    res.json({
        status: 400,
        message
    })
})


// Express Listen
app.listen(port, () => {
    console.log(`Express Listen on port: ${port}`)
})