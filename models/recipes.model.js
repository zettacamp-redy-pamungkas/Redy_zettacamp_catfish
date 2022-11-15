// mongoose
const mongoose = require('mongoose');
const { Schema } = mongoose;

// recipe schema
const recipeSchema = new Schema({
    recipe_name: {
        type: String,
        required: true,
        trim: true,
        minLength: 3,
        maxLength: 50
    },
    ingredients: [
        {
            _id: false,
            ingredient_id: {
                type: Schema.Types.ObjectId,
                ref: "Ingredient"
            },
            stock_used: {
                type: Number,
                min: 0
            }
        }
    ],
    price: { type: Number, required: true, min: 0 },
    status: {
        type: String,
        enum: ['active', 'deleted'],
        default: 'active'
    }
});

// recipe models
module.exports = mongoose.model('Recipe', recipeSchema);