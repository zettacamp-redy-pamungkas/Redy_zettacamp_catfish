const mongoose = require('mongoose');

// Schema Product
const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        minLength: 4,
        maxLength: 25
    },
    description: {
        type: String,
        required: true,
        minLength: 5,
        maxLength: 250
    },
    img: {
        data: Buffer,
        contentType: String
    },
    category: {
        type: String,
        enum: ['fruit', 'vegetable', 'dairy'],
        lowercase: true
        },
    price: {
        type: Number,
        min: 0,
        default: 0
    },
    from: {
        type: String,
        minLength: 4,
        maxLength: 25,
        default: 'Bogor'
    },
    owner: {
        type: String,
        minLength: 4,
        maxLength: 25,
        default: 'Zetta'
    },
    onSale: {
        type: Boolean,
        default: false
    }
});

// Make Model
const Product = mongoose.model('Products', productSchema);

// Export
module.exports = Product;