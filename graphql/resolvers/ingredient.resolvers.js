// Ingredient model
const IngredientModel = require('../../models/ingredient.model');

// Apollo Error
const { ApolloError } = require('apollo-server');
const { default: mongoose } = require('mongoose');

module.exports.ingredientQuery = {
    getAllIngredient: async (_, { name, stock, page, limit }) => {
        try {
            const aggregateIngredients = [];
            const matchQuery = { $and: [] };

            if (name) {
                matchQuery.$and.push({ name: new RegExp(name, "i") });
            }

            if (stock) {
                matchQuery.$and.push({ stock });
                aggregateIngredients.push({
                    $match: { stock: { $gt: 0 } }
                })
            }

            if (matchQuery.$and.length) {
                aggregateIngredients.push({
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

                aggregateIngredients.push(
                    {
                        $skip: page * limit
                    },
                    {
                        $limit: limit
                    }
                )
            }

            let ingredients = await IngredientModel.find({});
            const totalDocs = ingredients.length;

            if (aggregateIngredients.length) {
                ingredients = await IngredientModel.aggregate(aggregateIngredients);
                if (!ingredients.length) { throw new ApolloError('not found') }
                ingredients = ingredients.map((ingredient) => {
                    ingredient.id = mongoose.Types.ObjectId(ingredient._id);
                    return ingredient
                })
            }

            return {
                ingredients,
                page: page >= 0 ? page + 1 : 1,
                maxPage: Math.ceil(totalDocs / (limit || ingredients.length)),
                currentDocs: ingredients.length,
                totalDocs
            }
        } catch (err) {
            throw new ApolloError(err);
        }
    },
    getOneIngredient: async (_, { id }) => {
        try {
            const ingredient = await IngredientModel.findById(id);
            if (!ingredient) throw new ApolloError(`Ingredient with ID: ${id} not found.`);
            return ingredient;
        } catch (err) {
            throw new ApolloError(err);
        }
    }
}

module.exports.ingredientMutation = {
    createIngredient: async (_, { name, stock }) => {
        try {
            const newIngredient = new IngredientModel({ name, stock });
            await newIngredient.save();
            return newIngredient;
        } catch (err) {
            throw new ApolloError(err);
        }

    },
    updateIngredient: async (_, { id, stock, status }) => {
        try {
            const ingredient = await IngredientModel.findByIdAndUpdate(id, { stock: stock, status: status }, { runValidators: true });
            if (!ingredient) throw new ApolloError(`Ingredient with ID: ${id} not found`);
            return await IngredientModel.findById(id);
        } catch (err) {
            throw new ApolloError(err);
        }
    },
    deleteIngredient: async (_, { id }) => {
        try {
            const ingredient = await IngredientModel.findByIdAndUpdate(id, { status: 'deleted' }, { new: true, runValidators: true });
            if (!ingredient) throw new ApolloError(`Ingredient with ID: ${id} not found`);
            return ingredient;
        } catch (err) {
            throw new ApolloError(err);
        }
    }
}