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
    imgUrl: { type: String, minLength: 3 },
    special_offer: { type: Boolean, default: false },
    discount: { type: Number, min: 0, max: 80, default: 0 },
    highlight: { type: Boolean, default: false },
    status: {
        type: String,
        enum: ['publish', 'deleted', 'unpublish'],
        default: 'unpublish'
    }
}, { timestamps: true });

// recipe models
module.exports = mongoose.model('Recipe', recipeSchema);