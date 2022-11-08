// mongoose
const mongoose = require('mongoose');
const { Schema } = mongoose;

// user schema
const userSchema = new Schema({
    'first_name': {
        type: String,
        required: true,
        trim: true,
        minLength: 3,
        maxLength: 50
    },
    'last_name': {
        type: String,
        required: true,
        trim: true,
        minLength: 3,
        maxLength: 50
    },
    email: {
        type: String,
        trim: true,
        unique: true
    },
    password: {
        type: String,
        required: true,
        minLength: 5
    },
    status: {
        type: String,
        enum: ['active', 'deleted'],
        default: 'active'
    }
});

// User model
module.exports = mongoose.model('User', userSchema);