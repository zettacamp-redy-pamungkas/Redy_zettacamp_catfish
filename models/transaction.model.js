// mongoose
const mongoose = require('mongoose');
const { Schema } = mongoose;

// transaction model
const transactionSchema = new Schema({
    user_id: {
        type: Schema.Types.ObjectId,
        ref: 'User',
    },
    menu: [
        {
            _id: false,
            recipe_id: {
                type: Schema.Types.ObjectId,
                ref: 'Recipe'
            },
            amount: {
                type: Number,
                min: 0
            },
            note: {
                type: String,
                minLength: 3,
                maxlength: 30
            }
        }
    ],
    order_status: {
        type: String,
        enum: ['success', 'failed']
    },
    order_date: {
        type: Date,
        default: new Date
    },
    status: {
        type: String,
        enum: ['active', 'deleted']
    }
});

module.exports = mongoose.model('Transaction', transactionSchema);