// mongoose
const mongoose = require('mongoose');
const { Schema } = mongoose;

// cart schema
const cartSchema = new Schema({
    user_id: { type: Schema.Types.ObjectId, ref: "User", required: true },
    cart: [
        {
            recipe_id: { type: Schema.Types.ObjectId, ref: "Recipe" },
            amount: { type: Number, min: 0 },
            note: { type: String, trim: true}
        }
    ],
    status: { type: String, enum: ['pending', 'success', 'deleted'], default: 'pending' }
}, { timestamps: true });

// cart model
module.exports = mongoose.model('Cart', cartSchema);