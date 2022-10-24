// mongoose
const mongoose = require('mongoose')
const dbName = 'bookStore';

// Book, Author
const Book = require('../models/book');
const Author = require('../models/author');

// mongoose connections
mongoose.connect(`mongodb://localhost:27017/${dbName}`)
    .then(() => {
        console.log('MongoDB connection Open');
    })
    .catch((err) => {
        console.log(err);
    });

// Random Author name
const authorsFirstName = ['John', 'Linus', 'Bernald'];
const authorLastName = ['Doe', 'Morgan', 'Traversary'];

// const Random Book
const bookseeds = require('./randomBook');

// function getRandom
function getRandom(arr) {
    const randomIndex = Math.floor(Math.random() * arr.length);

    return arr[randomIndex];
}

// funtion getRandomMinMax
function getRandomMinMax(min, max) {
    if (min > max) {
        [min, max] = [max, min];
    }
    return Math.floor(Math.random() * (max - min)) + min;
}

// function DeleteAll
async function deleteAll() {
    await Book.deleteMany({});
    await Author.deleteMany({});
}

// function insert random author
async function insertDummiesAuthor(dataLength = 3) {
    for (let i = 0; i < dataLength; i++) {
        const randomDOB = `${getRandomMinMax(1975, 1985)}-${getRandomMinMax(1, 12)}-${getRandomMinMax(1, 30)}`;

        const newAuthor = new Author({
            firstName: authorsFirstName[i],
            lastName: authorLastName[i],
            dob: new Date(randomDOB)
        });

        await newAuthor.save();
        // console.log(newAuthor)
    }
    console.log(`${dataLength} Dummies Author has been inserted.`)
}

// function insert Dummies book
async function insertDummiesBook(dataLength = 20) {
    const authors = await Author.find({});
    for (let book of bookseeds) {
        const author = getRandom(authors);
        const publishDate = `${getRandomMinMax(2002, 2015)}-${getRandomMinMax(1, 12)}-${getRandomMinMax(1, 30)}`
        const newBook = new Book({
            title: book,
            author: author.id,
            price: getRandomMinMax(5, 20),
            datePublished: publishDate
        })
        // Add New book to author
        author.books.push(newBook.id);
        
        // console.log(newBook);
        await Promise.all([
            newBook.save(),
            author.save()
        ])
    }
}

// insertDummiesAuthor();
// insertDummiesBook();
// deleteAll();

