// mongoose
const mongoose = require('mongoose');
const { Schema } = mongoose;

// ingredient schema
const ingredientSchema = new Schema({
    name: {
        type: String,
        required: true,
        unique: true,
        minLength: 3,
        maxLengt: 50,
        trim: true
    },
    stock: {
        type: Number,
        min: 0,
        default: 0
    },
    status: {
        type: String,
        enum: ['active', 'deleted'],
        default: 'active'
    }
});

// ingredient model
module.exports = mongoose.model('Ingredient', ingredientSchema);