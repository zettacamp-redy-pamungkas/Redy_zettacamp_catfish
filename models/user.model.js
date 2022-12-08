// mongoose
const mongoose = require('mongoose');
const { Schema } = mongoose;

// user schema
const userSchema = new Schema({
    'first_name': {
        type: String,
        required: true,
        trim: true,
        minLength: [3, 'First name must at less 3 chars'],
        maxLength: [25, 'First name max chars is 25 chars']
    },
    'last_name': {
        type: String,
        required: true,
        trim: true,
        minLength: [3, 'Last name must at less 3 chars'],
        maxLength: [25, 'Last name max chars is 25 chars']
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
        minLength: [8, 'Password at less 8 digits.']
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
    balance: { type: Number, min: 0, default: 500000 },
    friend_name: { type: String, minLength: [3, 'Friend name at less 3 chars'], maxLength: [25, 'Friend name max chars is 25 chars'], trim: true },
    pet_name: { type: String, minLength: [3, 'Pet name at less 3 chars'], maxLength: [25, 'Pet name max chars is 25 chars'], trim: true },
    status: {
        type: String,
        enum: ['active', 'deleted'],
        default: 'active'
    }
});

// User model
module.exports = mongoose.model('User', userSchema);