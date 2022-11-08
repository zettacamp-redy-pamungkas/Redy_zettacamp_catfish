// mongoose
const mongoose = require('mongoose');
const { Schema } = mongoose;

// ingredient schema
const ingredientSchema = new Schema({
    name: {
        type: String,
        required: true,
        minLength: 3,
        maxLengt: 50,
        trim: true
    },
    stock: {
        type: Number,

    }
});

// ingredient model
module.exports = mongoose.model('Ingredient', ingredientSchema);