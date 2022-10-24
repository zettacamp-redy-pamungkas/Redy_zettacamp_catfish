// mongoose
const mongoose = require('mongoose');
const { Schema } = mongoose;

const Author = require('./author');

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

bookSchema.post('findOneAndDelete', async(book) => {
    const author = await Author.findById(book.author);
    await author.update({
        $pull: {
            books: book.id
        }
    })
})

// mongoose model
module.exports = mongoose.model('Book', bookSchema);
