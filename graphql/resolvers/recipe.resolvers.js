// recipe model
const RecipeModel = require('../../models/recipes.model');

// ingredient model
const IngredientModel = require('../../models/ingredient.model');

// Apollo Error
const { ApolloError } = require('apollo-server');
const { default: mongoose } = require('mongoose');

// function check duplicate
async function checkIngredient(input) {
    let arrInputIngredientIds = input.map((el) => el.ingredient_id);

    // check if ingredient not found
    let ingredients = await IngredientModel.find({});
    ingredients = ingredients.map((el) => el.id);
    arrInputIngredientIds.forEach((el) => {
        if (ingredients.indexOf(el) === -1) throw new ApolloError(`Ingredient with ID: ${el} not found`);
    });

    // check if ingredient duplicate
    if (new Set(arrInputIngredientIds).size !== arrInputIngredientIds.length) throw new ApolloError('Ingredient duplicate');
    return this
}

module.exports.recipeQuery = {
    getAllRecipe: async (_, { recipe_name, page, limit }) => {
        try {
            const aggregateQuery = [];
            const matchQuery = { $and: [] };
            if (recipe_name) {
                matchQuery.$and.push({ recipe_name: new RegExp(recipe_name, "i") })
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
            let recipes = await RecipeModel.find({});
            const totalDocs = recipes.length;

            if (aggregateQuery.length) {
                recipes = await RecipeModel.aggregate(aggregateQuery);
                if (!recipes.length) {
                    throw new ApolloError(`Recipe name: ${recipe_name} not found`)
                }
                recipes = recipes.map((resep) => {
                    resep.id = mongoose.Types.ObjectId(resep._id);
                    return resep
                })
            }

            return {
                recipes,
                page: page >= 0 ? page + 1 : 1,
                maxPage: Math.ceil(totalDocs / (limit || recipes.length)),
                currentDocs: recipes.length,
                totalDocs
            };
        } catch (err) {
            throw new ApolloError(err);
        }
    },
    getOneRecipe: async (_, { id }) => {
        try {
            const recipe = await RecipeModel.findById(id);
            if (!recipe) throw new ApolloError(`Recipe With ID: ${id} not found.`);
            return recipe;
        } catch (err) {
            throw new ApolloError(err)
        }
    }
}

module.exports.recipeMutation = {
    createRecipe: async (_, { recipe_name, input }) => {
        try {
            checkIngredient(input);

            const newRecipe = new RecipeModel({ recipe_name, ingredients: input });
            await newRecipe.save()
            return newRecipe;
        } catch (err) {
            throw new ApolloError(err);
        }
    },
    updateRecipe: async (_, { id, recipe_name, input }) => {
        try {
            await checkIngredient(input);
            const updatedRecipe = await RecipeModel.findByIdAndUpdate(id, {
                recipe_name,
                ingredients: input
            }, { new: true, runValidators: true });

            return updatedRecipe;
        } catch (error) {
            throw new ApolloError(error)
        }
    },
    deleteRecipe: async (_, { id }) => {
        try {
            const deletedRecipe = await RecipeModel.findByIdAndUpdate(id, {
                status: 'deleted'
            }, { new: true, runValidators: true })
            if (!deletedRecipe) throw new ApolloError(`Recipe with ID: ${id} not found`);
            return deletedRecipe;
        } catch (error) {
            throw new ApolloError(error);
        }
    }
}