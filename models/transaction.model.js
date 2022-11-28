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
                maxlength: 30,
                trim: true,
            }
        }
    ],
    order_status: {
        type: String,
        enum: ['success', 'failed'],
        default: 'success'
    },
    order_date: {
        type: String,
        default: moment(new Date()).locale('id-ID').format('LL')
    },
    note_transaction: {type: String, minLength: 0, default: ''},
    status: {
        type: String,
        enum: ['active', 'deleted'],
        default: 'active'
    }
}, {timestamps: true});

module.exports = mongoose.model('Transaction', transactionSchema);