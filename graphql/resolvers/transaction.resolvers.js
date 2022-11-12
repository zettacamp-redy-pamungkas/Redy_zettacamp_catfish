// transcation model
const TransactionModel = require('../../models/transaction.model');

// user model
const UserModel = require('../../models/user.model');

// Recipe Model
const RecipeModel = require('../../models/recipes.model');

// Ingredient Model
const IngredientModel = require('../../models/ingredient.model');

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

        const ingredientMap = []
        for (let el of transaction.menu) {
            const amount = el.amount;
            for (let ingredient of el.recipe_id.ingredients) {
                ingredientMap.push({
                    ingredient_id: ingredient.ingredient_id._id,
                    stock: ingredient.ingredient_id.stock - (ingredient.stock_used * amount),
                })
                // ingredientMap[ingredient.ingredient_id._id] = ingredient.ingredient_id.stock - (ingredient.stock_used * amount)
                if (ingredient.ingredient_id.stock < (ingredient.stock_used * amount)) return new TransactionModel({ user_id, menu, order_status: 'failed' });
            }
        }

        ReduceIngredient(ingredientMap);
        return new TransactionModel({ user_id, menu });
    } catch (err) {
        throw new ApolloError(err)
    }
}

async function getAllTransaction(parent, { last_name, recipe_name, order_date }) {
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
        let transactions = await TransactionModel.find({});

        if (aggregateQuery.length) {
            transactions = await TransactionModel.aggregate(aggregateQuery);
            transactions = transactions.map((transaction) => {
                transaction.id = mongoose.Types.ObjectId(transaction._id);
                return transaction;
            })
        }

        if (!transactions.length) throw new ApolloError('Transaction not found');

        return transactions;
    } catch (error) {
        throw new ApolloError(error);
    }
}

async function createTransaction(parent, { menu }, context) {
    try {
        const { user_id } = context.req
        // check user if exist
        const user = await UserModel.findById(user_id);
        if (!user) throw new ApolloError(`User with ID: ${user_id} not found`);

        const newTransaction = await validateStockIngredient(user_id, menu)

        await newTransaction.save();

        return newTransaction;
    } catch (err) {
        throw new ApolloError(err)
    }
}

module.exports.transactionQuery = {
    getAllTransaction
}

module.exports.transactionMutation = {
    createTransaction
}