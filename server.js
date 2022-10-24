// Express
const express = require('express');
const app = express();
const port = 3000;

// mongoose
const mongoose = require('mongoose')
const dbName = 'bookStore';

// Book, Author
const Book = require('./models/book');
const Author = require('./models/author');

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
        const updatedBook = await Book.findByIdAndUpdate(id, book, { new: true });
    
        res.json({
            status: 'ok',
            message: updatedBook
        });
    } catch (err) {
        next(err)
    }
});

// DELETE '/buku/detail/:id' route
app.delete('/books/detail/:id', async(req, res, next) => {
    try {
        const { id } = req.params;
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
app.post('/authors/new', express.urlencoded({extended: true}), async (req, res) => {
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
        const author = await Author.findById(id);

        // On Delete Cascade
        if(author.books.length) {
            const res = await Book.deleteMany({
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