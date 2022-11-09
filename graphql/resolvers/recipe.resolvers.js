// recipe model
const RecipeModel = require('../../models/recipes.model');

// ingredient model
const IngredientModel = require('../../models/ingredient.model');

// Apollo Error
const { ApolloError } = require('apollo-server');
const { default: mongoose } = require('mongoose');

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

            console.log(aggregateQuery, aggregateQuery.length)

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
                console.log(recipes, recipes.length);
                if (!recipes.length) { 
                    console.log('Hello')
                    throw new ApolloError(`Recipe name: ${recipe_name} not found`) }
                recipes = recipes.map((resep) => {
                    resep.id = mongoose.Types.ObjectId(resep._id);
                    return resep
                })
            }

            console.log(recipes);

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
    }
}

module.exports.recipeMutation = {
    createRecipe: async (_, { recipe_name, input }) => {
        try {
            const newRecipe = new RecipeModel({ recipe_name, ingredients: input });
            console.log(newRecipe);
            await newRecipe.save()
            return newRecipe;
        } catch (err) {
            throw new ApolloError(err);
        }
    }
}