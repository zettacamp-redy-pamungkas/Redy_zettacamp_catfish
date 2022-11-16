// mongoose
const mongoose = require('mongoose');
const { Schema } = mongoose;

// moment
const moment = require('moment');

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
    total_price: { type: Number, min: 0 },
    order_status: {
        type: String,
        enum: ['success', 'failed'],
        default: 'success'
    },
    order_date: {
        type: String,
        default: moment(new Date()).locale('id-ID').format('LL')
    },
    status: {
        type: String,
        enum: ['active', 'deleted'],
        default: 'active'
    }
}, {timestamps: true});

module.exports = mongoose.model('Transaction', transactionSchema);