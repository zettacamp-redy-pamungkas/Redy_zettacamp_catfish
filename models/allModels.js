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

module.exports.Book = mongoose.model('Book', bookSchema);
module.exports.Author = mongoose.model('Author', authorSchema);

bookSchema.post('findOneAndDelete', async(book) => {
    const author = await Author.findById(book.author);
    await author.update({
        $pull: {
            books: book.id
        }
    })
})

// Books on delete cascade
authorSchema.post('findOneAndDelete', async(author) => {
    if (author.books.length) {
        await Book.deleteMany({
            _id : {
                $in: author.books
            }
        })
    }
})


