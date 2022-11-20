// transcation model
const TransactionModel = require('../../models/transaction.model');

// user model
const UserModel = require('../../models/user.model');

// Recipe Model
const RecipeModel = require('../../models/recipes.model');

// Ingredient Model
const IngredientModel = require('../../models/ingredient.model');

// Cart Model
const CartModel = require('../../models/cart.model');

// Apollo Error
const { ApolloError } = require('apollo-server');
const { default: mongoose } = require('mongoose');

// moment
const moment = require('moment');

// set locale to ID - Indonesia
moment.locale('id-ID');

// reduce stock
async function ReduceIngredient(arrIngredient) {
    for (let ingredient of arrIngredient) {
        // console.log(ingredient)
        await IngredientModel.findByIdAndUpdate(ingredient.ingredient_id, { stock: ingredient.stock });
    }
}


// validate stock ingredient
async function validateStockIngredient(user_id, menu) {
    try {
        const transaction = new TransactionModel({ user_id, menu });
        await TransactionModel.populate(transaction, {
            path: "menu.recipe_id",
            populate: {
                path: "ingredients.ingredient_id"
            }
        });

        const ingredientMap = [];
        let total_price = 0;
        for (let el of transaction.menu) {
            if (el.recipe_id.status === 'deleted') throw new ApolloError(`Recipe: ${el.recipe_id.recipe_name} has been deleted`);
            const amount = el.amount;
            for (let ingredient of el.recipe_id.ingredients) {
                ingredientMap.push({
                    ingredient_id: ingredient.ingredient_id._id,
                    stock: ingredient.ingredient_id.stock - (ingredient.stock_used * amount),
                })
                if (ingredient.ingredient_id.status === "deleted") throw new ApolloError('Ingredient has been deleted');
                if (ingredient.ingredient_id.stock < (ingredient.stock_used * amount)) return new TransactionModel({ user_id, menu, order_status: 'failed' });
            }
            total_price += el.recipe_id.price * amount;
        }

        ReduceIngredient(ingredientMap);
        return new TransactionModel({ user_id, menu, total_price });
    } catch (err) {
        throw new ApolloError(err)
    }
}

// total price menu / recipe
async function getTotalPriceMenu({ recipe_id, amount }, args, context) {
    try {
        const recipe = await RecipeModel.findById(recipe_id);
        const price = recipe.price;
        return price * amount;
    } catch (err) {
        throw new ApolloError(err);
    }
}

async function getAllTransaction(parent, { last_name, recipe_name, order_date, page, limit }) {
    try {
        const aggregateQuery = [];
        const matchQuery = { $and: [] };

        const lookUp = (from, localField, foreignField, as) => {
            return {
                $lookup:
                {
                    from,
                    localField,
                    foreignField,
                    as
                }
            }
        }

        if (last_name) {
            aggregateQuery.push(lookUp("users", "user_id", "_id", "users"));
            matchQuery.$and.push({ "users.last_name": new RegExp(last_name, "i") });
        }

        if (recipe_name) {
            aggregateQuery.push(lookUp("recipes", "menu.recipe_id", "_id", "recipes"))
            matchQuery.$and.push({ "recipes.recipe_name": new RegExp(recipe_name, "i") })
        }

        if (order_date) {
            // console.log(new Date(order_date).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' }));
            const tanggal = moment(order_date, "MMM-DD-YYYY").format('LL');
            matchQuery.$and.push({ "order_date": tanggal })
        }

        if (matchQuery.$and.length) {
            aggregateQuery.push({
                $match: matchQuery
            })
        }

        // pagination
        if (page) {
            page = parseInt(page) - 1;
            if (Number.isNaN(page) || page < 0) {
                page = 0;
            }

            limit = parseInt(limit || 5);
            if (Number.isNaN(limit) || limit < 0) {
                limit = 5
            }

            aggregateQuery.push(
                {
                    $skip: page * limit
                },
                {
                    $limit: limit
                }
            )
        }

        let transactions = await TransactionModel.find({});
        let totalDocs = transactions.length;

        if (aggregateQuery.length) {
            transactions = await TransactionModel.aggregate(aggregateQuery);
            transactions = transactions.map((transaction) => {
                transaction.id = mongoose.Types.ObjectId(transaction._id);
                return transaction;
            })
        }

        if (!transactions.length) throw new ApolloError('Transaction not found');

        return {
            transactions,
            page: page >= 0 ? page + 1 : 1,
            maxPage: Math.ceil(totalDocs / (limit || transactions.length)),
            currentDocs: transactions.length,
            totalDocs
        };
    } catch (error) {
        throw new ApolloError(error);
    }
}

// Get One Transaction by id
async function getOneTransaction(parent, { id }) {
    try {
        const transaction = await TransactionModel.findById(id);
        if (!transaction) throw new ApolloError(`Transaction with ID: ${id} not found`);
        return transaction;
    } catch (err) {
        throw new ApolloError(err);
    }
}

async function createTransaction(parent, { menu }, context) {
    try {
        const { user_id } = context.req
        // check user if exist
        const user = await UserModel.findById(user_id);
        if (!user) throw new ApolloError(`User with ID: ${user_id} not found`);
        const keranjang = await CartModel.findOne({ user_id, status: 'pending' }).sort({ updatedAt: -1 });
        if (!keranjang) { throw new ApolloError(`Cart with user_id: ${user_id} is empty`) };

        const { cart: menu } = keranjang
        const newTransaction = await validateStockIngredient(user_id, menu)
        await newTransaction.save();
        if (newTransaction.status === 'active') { await keranjang.updateOne({ $set: { status: 'success' } }) }
        return newTransaction;
    } catch (err) {
        throw new ApolloError(err)
    }
}

// Delete transaction
async function deleteTransaction(parent, { id }) {
    try {
        const transaction = await TransactionModel.findByIdAndUpdate(id,
            { status: 'deleted' },
            { new: true, runValidators: true }
        );

        if (!transaction) throw new ApolloError(`transaction with id: ${id} not found.`)
        return transaction;
    } catch (error) {
        throw new ApolloError(error);
    }
}

module.exports.transactionQuery = {
    getAllTransaction,
    getOneTransaction,
}

module.exports.transactionMutation = {
    createTransaction,
    deleteTransaction,
}