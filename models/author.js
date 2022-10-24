// mongoose
const mongoose = require('mongoose');
const { Schema } = mongoose;

const Book = require('./book');

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

// mongoose model
module.exports = mongoose.model('Author', authorSchema);
