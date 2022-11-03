// mongoose
const mongoose = require('mongoose')
const dbName = 'bookStore';

// Book, Author
const { Book, Author, Bookshelf } = require('../models/allModels');

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

// const Random Reviewer
const reviewerSeeds = require('./randomName');
console.log( reviewerSeeds[0])

// function getRandom
function getRandom(arr, isUnique = false) {
    const randomIndex = Math.floor(Math.random() * arr.length);
    const el = arr[randomIndex];

    if (isUnique) {
        arr.splice(randomIndex, 1);
    }

    return el;
}

// funtion getRandomMinMax
function getRandomMinMax(min, max) {
    if (min > max) {
        [min, max] = [max, min];
    }
    return Math.floor(Math.random() * (max - min)) + min + 1;
}

// function DeleteAll
async function deleteAll() {
    await Book.deleteMany({});
    await Author.deleteMany({});
    await Bookshelf.deleteMany({});
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
        const reviews = [];
        const seedreviewer = [...reviewerSeeds];
        for (let i = 0; i < 5; i++) {
            const randomReviewer = getRandom(seedreviewer, true);
            // console.log(randomReviewer);
            reviews.push({
                name: randomReviewer,
                rating: getRandomMinMax(5, 10)
            });
        }
        const newBook = new Book({
            title: book,
            author: author.id,
            price: 10000 + (getRandomMinMax(5, 20) * 1000),
            stock: getRandomMinMax(4, 10),
            reviews,
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

// function insert bookshelf
async function insertDummiesBookshelf(shelfLength = 7) {
    for (let i = 0; i < shelfLength; i++) {
        const shelfName = `shelf ${i+1}`;
        const books = await Book.find({});
        const bookArr = [];
        const maxBookLength = getRandomMinMax(2, 5);
        for (let y = 0; y < maxBookLength; y++) {
            const randomStock = getRandomMinMax(2, 8);
            const bookId = getRandom(books, true);
            bookArr.push({
                book_id: bookId,
                stock: randomStock
            });
        }

        const randomDateArr = [];
        for (let j = 0; j < 5; j++) {
            randomDateArr.push({
                date: new Date(`${getRandomMinMax(2015, 2022)}-10-26`),
                time: `${getRandomMinMax(0, 24)}:${getRandomMinMax(0, 59)}`
            })
        }

        const bookshelf = new Bookshelf({
            name: shelfName,
            books: bookArr,
            date: randomDateArr,
            createdAt: new Date()
        });
        // bookshelf.createdAt = Date.now()
        await bookshelf.save();
    }
    console.log('Bookshelf dummies has been inserted');
}

// function insertDummies
async function insertDummies() {
    await deleteAll();
    await insertDummiesAuthor();
    await insertDummiesBook();
    await insertDummiesBookshelf();
    mongoose.connection.close();
    console.log('Dummies data has been inserted');
}

insertDummies()

// insertDummiesAuthor();
// insertDummiesBook();
// deleteAll();

