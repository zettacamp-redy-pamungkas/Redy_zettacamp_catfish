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
        unique: true,
        match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please fill a valid email address']
    },
    password: {
        type: String,
        required: true,
        minLength: 5
    },
    role: {
        _id: false,
        user_type: { type: String, minlength: 3, trim: true, required: true, default: 'user' },
        view_permission: [
            {
                _id: false,
                name: { type: String, minlength: 3, required: true, trim: true },
                access: Boolean
            }
        ]
    },
    // cart: [
    //     {}
    // ],
    status: {
        type: String,
        enum: ['active', 'deleted'],
        default: 'active'
    }
});

// User model
module.exports = mongoose.model('User', userSchema);