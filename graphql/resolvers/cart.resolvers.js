// Apollo Error
const { ApolloError } = require('apollo-server');
const { default: mongoose } = require('mongoose');
const cartModel = require('../../models/cart.model');

// Cart Model
const CartModel = require('../../models/cart.model');

// Add Cart function
async function addCart(_, { cart }, context) {
    try {
        console.log('Mutation, Add Cart')
        const user_id = mongoose.Types.ObjectId(context.req.user_id)
        let keranjang = await CartModel.findOne({ user_id, status: 'pending' });
        if (!keranjang) {
            const newCart = new CartModel({ user_id, cart: cart });
            await newCart.save();
            return await CartModel.findOne({ user_id, status: 'pending' });
        } else {
            await keranjang.updateOne({ $push: { cart: cart } }, { new: true, runValidators: true });
            return await CartModel.findOne({ user_id, status: 'pending' });;
        }
    } catch (err) {
        throw new ApolloError(err);
    }
}

async function getAllCart(_, args, context) {
    try {
        const carts = await CartModel.find({ user_id: context.req.user_id, status: 'pending' });
        return carts;
    } catch (err) {
        throw new ApolloError(err);
    }
}

async function removeMenu(_, { item_id }, context) {
    try {
        const user_id = context.req.user_id
        const keranjang = await CartModel.findOne({ user_id, status: 'pending' });
        if (!keranjang) throw new ApolloError('Cart not found');
        await keranjang.updateOne({ $pull: { cart: { _id: mongoose.Types.ObjectId(item_id) } } })
        return await cartModel.findOne({ user_id, status: 'pending' });
    } catch (err) {
        throw new ApolloError(err)
    }
}

async function updateCart(_, { item_id, amount, note }, context) {
    try {
        const user_id = context.req.user_id
        const keranjang = await CartModel.findOne({ user_id, status: 'pending' });
        if (!keranjang) { throw new ApolloError(`Cart with id: ${user_id} not found`) };
        await CartModel.updateOne({ "cart._id": mongoose.Types.ObjectId(item_id) }, { $set: { "cart.$.amount": amount, "cart.$.note": note } }, { multi: true })
        return await CartModel.findOne({ user_id, status: 'pending' });
    } catch (err) {
        throw new ApolloError(err);
    }
}

async function deleteCart(_, args, context) {
    try {
        console.log(context.req.user_id);
        const user_id = context.req.user_id;
        const cart = await CartModel.findOne({ user_id, status: 'pending' });
        if (!cart) { throw new ApolloError(`Cart with user id: ${user_id} not found`) };
        await cart.updateOne({ $set: { status: "deleted" } }, { runValidators: true });
        return await CartModel.findOne({ user_id, status: 'deleted' }).sort({updatedAt: -1});
    } catch (error) {
        throw new ApolloError(error);
    }
}

// Mutation
module.exports.cartMutation = {
    addCart,
    removeMenu,
    updateCart,
    deleteCart
}

// Query
module.exports.cartQuery = {
    getAllCart,
}