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
const userModel = require('../../models/user.model');

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
        const stockIngredient = {};
        let total_price = 0;
        let order_status = 'success'
        let note_transaction = ''
        for (let el of transaction.menu) {
            if (el.recipe_id.status === 'deleted') throw new ApolloError(`Recipe: ${el.recipe_id.recipe_name} has been deleted`);
            const amount = el.amount;
            for (let ingredient of el.recipe_id.ingredients) {
                const ingredientRecipe = {
                    ingredient_id: ingredient.ingredient_id._id,
                    stock: ingredient.ingredient_id.stock - (ingredient.stock_used * amount),
                }
                if (ingredientRecipe.ingredient_id in stockIngredient) { }
                else { stockIngredient[ingredientRecipe.ingredient_id] = ingredient.ingredient_id.stock; }
                if (ingredient.ingredient_id.status === "deleted") throw new ApolloError('Ingredient has been deleted');
                if (stockIngredient[ingredientRecipe.ingredient_id] < (ingredient.stock_used * amount)) { order_status = 'failed'; if (!new RegExp(`${el.recipe_id.recipe_name}`, "i").test(note_transaction)) { note_transaction += `- ${el.recipe_id.recipe_name} has sufficient stock. \n` } }
                stockIngredient[ingredientRecipe.ingredient_id] -= (ingredient.stock_used * amount);
                ingredientMap.push({
                    ingredient_id: ingredient.ingredient_id._id,
                    stock: stockIngredient[ingredientRecipe.ingredient_id],
                })
            }
            let price = 0
            if (el.recipe_id.special_offer) { price = Math.floor(el.recipe_id.price * (1 - (el.recipe_id.discount / 100))) } else { price = el.recipe_id.price }
            total_price += price * amount;
        }

        if (order_status === 'success') {
            ReduceIngredient(ingredientMap); 
        }
        return new TransactionModel({ user_id, menu, total_price, order_status, note_transaction });
    } catch (err) {
        throw new ApolloError(err)
    }
}

async function getAllTransaction(parent, { last_name, recipe_name, order_date, order_status, page, limit }, { req: { user_id, user_role: { user_type } } }) {
    try {
        const aggregateQuery = [];
        const matchQuery = { $and: [] };
        if (user_type === 'admin') {
            aggregateQuery.push({ $sort: { createdAt: -1 } });
        } else {
            aggregateQuery.push({ $match: { user_id: mongoose.Types.ObjectId(user_id) } }, { $sort: { createdAt: -1 } });
        }
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
            const tanggal = moment(order_date, "YYYY-MM-DD").format('LL');
            // console.log(`order date: ${order_date}, tanggal: ${tanggal}`)
            matchQuery.$and.push({ "order_date": tanggal })
        }

        if (order_status) {
            matchQuery.$and.push({ "order_status": order_status })
            // console.log(order_status, JSON.stringify(matchQuery));
        }

        if (matchQuery.$and.length) {
            aggregateQuery.push({
                $match: matchQuery
            })
        }


        // pagination
        if (page >= 0) {
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

        let transactions = null;

        if (aggregateQuery.length) {
            transactions = await TransactionModel.aggregate(aggregateQuery);
            transactions = transactions.map((transaction) => {
                transaction.id = mongoose.Types.ObjectId(transaction._id);
                return transaction;
            })
        }

        if (!transactions.length) throw new ApolloError('Transaction not found');

        let totalDocs = transactions.length;
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

// function reduce balance user
async function reduceBalance(user, transaction) {
    // check if user_role === user
    if (user.role.user_type === 'user') {
        if (transaction.order_status === 'success') {
            if (user.balance >= transaction.total_price) {
                const balanceRemain = user.balance - transaction.total_price;
                await UserModel.findByIdAndUpdate(user.id, { balance: balanceRemain });
            } else {
                transaction.order_status = 'failed';
                transaction.note_transaction += 'Balance not enough'
            }
        }
    }

}

async function createTransaction(parent, { menu }, { req: { user_id, user_role } }) {
    try {
        // check user if exist
        const user = await UserModel.findById(user_id);
        if (!user) throw new ApolloError(`User with ID: ${user_id} not found`);
        const keranjang = await CartModel.findOne({ user_id, status: 'pending' }).sort({ updatedAt: -1 });
        if (!keranjang) { throw new ApolloError(`Cart with user_id: ${user_id} is empty`) };

        const { cart: menu } = keranjang
        const newTransaction = await validateStockIngredient(user_id, menu);
        await reduceBalance(user, newTransaction)
        if (newTransaction.order_status === 'success') {
            await keranjang.updateOne({ $set: { status: 'success' } })
        }
        await newTransaction.save();
        if (newTransaction.order_status === 'failed') { throw new ApolloError(newTransaction.note_transaction) }
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