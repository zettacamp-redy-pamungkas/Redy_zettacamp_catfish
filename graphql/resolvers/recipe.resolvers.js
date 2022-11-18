// recipe model
const RecipeModel = require('../../models/recipes.model');

// ingredient model
const IngredientModel = require('../../models/ingredient.model');

// Apollo Error
const { ApolloError } = require('apollo-server');
const { default: mongoose } = require('mongoose');

// function check duplicate
async function checkIngredient(input) {
    try {
        console.log(input);
        if (!input.length) { throw new ApolloError('Input Empty') };
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
    } catch (err) {
        throw new ApolloError(err);
    }
}

module.exports.recipeQuery = {
    getAllRecipe: async (_, { recipe_name, page, limit, status }) => {
        try {
            const tick = Date.now();
            const aggregateQuery = [];
            aggregateQuery.push({ $sort: { createdAt: -1 } });
            const matchQuery = { $and: [] };
            if (status) {
                if (status === 'deleted') {
                    aggregateQuery.push({ $match: { status: { $ne: status } } });
                } else {
                    aggregateQuery.push({ $match: { status: status } });
                }
            }
            if (recipe_name) {
                matchQuery.$and.push({ recipe_name: new RegExp(recipe_name, "i") })
            }
            if (matchQuery.$and.length) {
                aggregateQuery.push({
                    $match: matchQuery
                })
            }


            let recipes = await RecipeModel.find({ status: 'active' }).sort({ createdAt: -1 });
            const totalDocs = recipes.length;

            // pagination
            if (page >= 0) {
                page = parseInt(page) - 1;
                if (Number.isNaN(page) || page < 0) {
                    page = 0;
                }

                limit = parseInt(limit || totalDocs);
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
            console.log(`Get All Recipe Time: ${Date.now() - tick} ms`);
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
    createRecipe: async (_, { recipe_name, input, price, imgUrl }) => {
        try {
            // checkIngredient(input);
            console.log(`Create Recipe
            Recipe Name: ${recipe_name}, 
            ingredients: ${input} 
            price: ${price}
            imgUrl: ${imgUrl}`);
            const newRecipe = new RecipeModel({ recipe_name, ingredients: input, price, imgUrl, status: 'active' });
            await newRecipe.save()
            return newRecipe;
        } catch (err) {
            throw new ApolloError(err);
        }
    },
    updateRecipe: async (_, { id, recipe_name, input, status, imgUrl, price }) => {
        try {
            await checkIngredient(input);
            console.log(`Update Recipe, ID: ${id}, recipe_name: ${recipe_name}, input: ${input}, status: ${status}, price: ${price}, imgUrl: ${imgUrl}`);
            const updatedRecipe = await RecipeModel.findByIdAndUpdate(id, {
                recipe_name,
                ingredients: input,
                status: status,
                imgUrl: imgUrl,
                price: price
            }, { new: true, runValidators: true });
            if (!updatedRecipe) { throw new ApolloError(`Recipe with id: ${id} not found`) }
            console.log(updatedRecipe)
            //CISI PERNAH DISINI
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
            console.log(`Delete Recipe ID: ${id}, Name: ${deletedRecipe.recipe_name}`);
            return deletedRecipe;
        } catch (error) {
            throw new ApolloError(error);
        }
    }
}