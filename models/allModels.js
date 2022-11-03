const mongoose = require('mongoose');
const { Schema } = mongoose;

// Author Schema
const authorSchema = new Schema({
    firstName: String,
    lastName: String,
    dob: Date,
    books: [{
        type: Schema.Types.ObjectId,
        ref: 'Book'
    }]
});

// function 
function autoPopulateBooks(next) {
    this.populate({
        path: 'books',
        select: '-author'
    });
    next();
}

// function
function autoLookUpBooks(next) {
    this.aggregate([
        {
            $lookup: {
                from: 'books',
                localField: 'books',
                foreignField: '_id',
                as: 'books_populated'
            }
        }
    ]);
    next();
}

// mongoose middleware
authorSchema
    .pre('find', autoPopulateBooks)
    .pre('findOne', autoPopulateBooks)
    // .post('aggregate', async(authors) => {

    // })

// book schema
const bookSchema = new Schema({
    title: {
        type: String,
        required: true,
        minLength: 5,
        maxLength: 50,
        unique: true
    },
    author: {
        type: Schema.Types.ObjectId,
        ref: 'Author',
        required: true,
    },
    price: {
        type: Number,
        required: true,
        min: 0
    },
    stock: {
        type: Number,
        min: 0
    },
    datePublished: {
        type: Date,
        required: true
    },
    reviews: [
        {
            _id: false,
            name: {
                type: String
            },
            rating: {
                type: Number
            }
        }
    ],
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
    }
});

bookSchema
    .post('findOneAndDelete', async (book) => {
        const Author = mongoose.model('Author', authorSchema);
        const author = await Author.findById(book.author);
        author.update(
            {
                $pull: {
                    books: book._id
                }
            }
        )
    })

// Bookshelf Schema
const bookshelfSchema = new Schema([
    {
        name: {
            type: String,
            required: true
        },
        books: [
            {
                _id: false,
                book_id: {
                    type: Schema.Types.ObjectId,
                    ref: 'Book'
                },
                added: {
                    type: Date,
                    default: Date.now
                },
                stock: {
                    type: Number,
                    min: 0,
                    required: true,
                    default: 0
                }
            }
        ],
        date: [{
            _id: false,
            date: {
                type: Date
            },
            time: {
                type: String
            }
        }]
    }
], { strict: false})

module.exports.Book = mongoose.model('Book', bookSchema);
module.exports.Author = mongoose.model('Author', authorSchema);
module.exports.Bookshelf = mongoose.model('Bookshelf', bookshelfSchema);


