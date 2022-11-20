// ApolloError
const { ApolloError } = require('apollo-server');

// Cart Model
const CartModel = require('../../models/cart.model')

function getCartLength({ cart }) {
    return cart.length
}

module.exports.userCart_length = {
    cart_length: getCartLength
}