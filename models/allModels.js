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
    datePublished: {
        type: Date,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
    }
});

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
                object_id: {
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


