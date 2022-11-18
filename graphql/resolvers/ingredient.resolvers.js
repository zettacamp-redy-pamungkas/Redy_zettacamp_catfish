// Ingredient model
const IngredientModel = require('../../models/ingredient.model');

// Recipe Model
const RecipeModel = require('../../models/recipes.model');

// Apollo Error
const { ApolloError } = require('apollo-server');
const { default: mongoose } = require('mongoose');

// Check if ingredient is used by recipe
async function findIngredientInRecipe(id) {
    let recipes = await RecipeModel.find({ ingredients: { $elemMatch: { ingredient_id: mongoose.Types.ObjectId(id) } } });
    recipes = recipes.map((recipe) => recipe.recipe_name);
    if (!recipes.length) return true;
    throw new ApolloError(`This ingredient cannot been deleted because has been used in Recipe: ${recipes.toString()}`);
}

module.exports.ingredientQuery = {
    getAllIngredient: async (_, { name, stock, page, limit }) => {
        try {
            const tick = Date.now();
            const aggregateIngredients = [];
            aggregateIngredients.push({ $sort: { createdAt: -1 } }, { $match: { status: 'active' } });
            const matchQuery = { $and: [] };

            if (name) {
                matchQuery.$and.push({ name: new RegExp(name, "i") });
            }

            if (stock >= 0) {
                matchQuery.$and.push({ stock });
            }

            if (matchQuery.$and.length) {
                aggregateIngredients.push({
                    $match: matchQuery
                })
            }

            // pagination
            if (page >= 0) {
                page = parseInt(page) - 1;
                if (Number.isNaN(page) || page < 0) {
                    page = 0;
                }

                limit = parseInt(limit || 10);
                if (Number.isNaN(limit) || limit < 0) {
                    limit = 10
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

            let ingredients = await IngredientModel.find({ status: 'active' }).sort({ createdAt: -1 });
            const totalDocs = ingredients.length;

            if (aggregateIngredients.length) {
                ingredients = await IngredientModel.aggregate(aggregateIngredients);
                // console.log(aggregateIngredients);
                if (!ingredients.length) { throw new ApolloError('not found') }
                ingredients = ingredients.map((ingredient) => {
                    ingredient.id = mongoose.Types.ObjectId(ingredient._id);
                    return ingredient
                })
                if (stock) {
                    ingredients = ingredients.filter((el) => el.stock > 0)
                }
            }

            console.log(`Get All Ingredient Time: ${Date.now() - tick} ms`)
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
    updateIngredient: async (_, { id, name, stock, status }) => {
        try {
            if (status === 'deleted') {
                await findIngredientInRecipe(id);
            }
            const ingredient = await IngredientModel.findByIdAndUpdate(id, { name: name, stock: stock, status: status }, { new: true, runValidators: true });
            if (!ingredient) throw new ApolloError(`Ingredient with ID: ${id} not found`);
            console.log(`Update Ingredient ID: ${id}, name: ${ingredient.name}, stock: ${ingredient.stock}, status: ${ingredient.status}`);
            return await IngredientModel.findById(id);
        } catch (err) {
            throw new ApolloError(err);
        }
    },
    deleteIngredient: async (_, { id }) => {
        try {
            console.log("Delete Ingredient: ", id)
            await findIngredientInRecipe(id);
            const ingredient = await IngredientModel.findByIdAndUpdate(id, { status: 'deleted' }, { new: true, runValidators: true });
            if (!ingredient) throw new ApolloError(`Ingredient with ID: ${id} not found`);
            return ingredient;
        } catch (err) {
            console.log("Delete Ingredient: ", id)
            throw new ApolloError(err);
        }
    }
}