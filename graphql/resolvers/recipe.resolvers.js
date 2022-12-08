// recipe model
const RecipeModel = require('../../models/recipes.model');

// ingredient model
const IngredientModel = require('../../models/ingredient.model');

// Apollo Error
const { ApolloError } = require('apollo-server');
const { default: mongoose } = require('mongoose');
const cartModel = require('../../models/cart.model');

// function check duplicate
async function checkIngredient(input) {
    try {
        if (!input) { throw new ApolloError('Input Empty') };
        let arrInputIngredientIds = input.map((el) => el.ingredient_id.toString());

        // check if ingredient not found
        let ingredients = await IngredientModel.find({});
        ingredients = ingredients.map((el) => el.id);
        for (let ingredient of arrInputIngredientIds) {
            if (ingredients.indexOf(ingredient) === -1) throw new ApolloError(`Ingredient with ID: ${ingredient} not found`);
        }
        // check if ingredient duplicate
        if (new Set(arrInputIngredientIds).size !== arrInputIngredientIds.length) { throw new ApolloError('Ingredient duplicate'); }
        return this
    } catch (err) {
        throw new ApolloError(err);
    }
}

module.exports.recipeQuery = {
    getAllRecipe: async (_, { recipe_name, page, limit, status, special_offer, highlight, }) => {
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
                if (recipe_name.length > 2) {
                    matchQuery.$and.push({ recipe_name: new RegExp(recipe_name, "i") })
                }
            }
            if (special_offer) {
                matchQuery.$and.push({ special_offer })
                aggregateQuery.push({ $sort: { discount: -1 } });
            }
            if (highlight) {
                matchQuery.$and.push({ highlight })
            }
            if (matchQuery.$and.length) {
                aggregateQuery.push({
                    $match: matchQuery
                })
            }


            let recipes = await RecipeModel.aggregate(aggregateQuery);
            let totalDocs = recipes.length;

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
            // console.log(`Get All Recipe Time: ${Date.now() - tick} ms`);
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
    getAllRecipes: async (_, { recipe_name, page, limit, status, special_offer, highlight }) => {
        try {
            const tick = Date.now();
            const aggregateQuery = [];
            aggregateQuery.push({ $sort: { createdAt: -1 } });
            const matchQuery = { $and: [] };

            if (!status) {
                aggregateQuery.push({ $match: { status: { $ne: 'deleted' } } });
            }
            else {
                aggregateQuery.push({ $match: { status: status } });
            }
            if (recipe_name) {
                if (recipe_name.length > 2) {
                    matchQuery.$and.push({ recipe_name: new RegExp(recipe_name, "i") })
                }
            }
            if (special_offer) {
                matchQuery.$and.push({ special_offer })
            }
            if (highlight) {
                matchQuery.$and.push({ highlight })
            }
            if (matchQuery.$and.length) {
                aggregateQuery.push({
                    $match: matchQuery
                })
            }

            let recipes = await RecipeModel.aggregate(aggregateQuery);
            let totalDocs = recipes.length;


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

                // console.log('Pagination', page)
            }

            if (aggregateQuery.length) {
                recipes = await RecipeModel.aggregate(aggregateQuery);
                // console.log(JSON.stringify(aggregateQuery))
                if (!recipes.length) {
                    throw new ApolloError(`Recipe name: ${recipe_name} not found`)
                }
                recipes = recipes.map((resep) => {
                    resep.id = mongoose.Types.ObjectId(resep._id);
                    return resep
                })
            }
            // console.log(`Get All Recipe Time: ${Date.now() - tick} ms`);
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

// check is name has been used
async function checkRecipeName(recipe_name) {
    const recipe = await RecipeModel.findOne({ recipe_name: new RegExp(`^${recipe_name}$`, 'i') });
    if (recipe && (recipe.status === 'publish' || recipe.status === 'unpublish')) throw new ApolloError(`Recipe name : ${recipe_name} has been used.`);
    if (recipe && recipe.status === 'deleted') await RecipeModel.findByIdAndDelete(recipe.id);
}

// check updated recipe name has been used

module.exports.recipeMutation = {
    createRecipe: async (_, { recipe_name, input, price, imgUrl, discount }) => {
        try {
            // trim recipe name
            recipe_name = recipe_name.trim();
            if (!new RegExp('^[A-Z ]+$', "i").test(recipe_name)) throw new ApolloError(`Recipe name must be Alphabet, not ${recipe_name}`);

            // set discount to 0 if discount is null or undefined
            if (!discount) discount = 0

            if (!input.length) { throw new ApolloError('Input Empty'); }
            await checkRecipeName(recipe_name);
            await checkIngredient(input);

            // console.log(`Create Recipe
            // Recipe Name: ${recipe_name}, 
            // ingredients: ${input} 
            // price: ${price}
            // imgUrl: ${imgUrl}
            // discount: ${discount}`);

            const newRecipe = new RecipeModel({ recipe_name, ingredients: input, price, imgUrl, status: 'unpublish', discount: discount });
            await newRecipe.save()
            return newRecipe;
        } catch (err) {
            throw new ApolloError(err);
        }
    },
    updateRecipe: async (_, { id, recipe_name, input, status, imgUrl, price, special_offer, discount, highlight }) => {
        try {
            // Trim recipe_name
            if (recipe_name) {
                recipe_name.trim();
                if (!new RegExp('^[A-Z ]+$', "i").test(recipe_name)) throw new ApolloError(`Recipe name must be Alphabet, not ${recipe_name}`);
            }

            // Set discount to 0 if discount is null or undefined
            if (!discount) discount = 0
            if (!input) {
                const recipe = await RecipeModel.findById(id);
                if (!recipe) throw new ApolloError(`Recipe with id: ${id} not found`, '400')
                input = recipe.ingredients;
                // console.log("Hello Input Kosong")
            }
            // await checkRecipeName(recipe_name);
            let recipeName = await RecipeModel.findById(id);
            // console.log(recipeName.recipe_name, recipe_name)
            // console.log(new RegExp(`^${recipeName.recipe_name}$`, 'i').test(recipe_name))
            console.log(recipeName)
            if (recipeName) {
                if (new RegExp(`^${recipeName.recipe_name}$`, 'i').test(recipe_name)) {
                    if (recipeName.status === 'deleted') { await RecipeModel.findByIdAndUpdate(recipeName.id, { $set: { status: 'unpublish' } }) }
                }
                else {
                    recipeName = await RecipeModel.findOne({ recipe_name: new RegExp(`^${recipe_name}$`, 'i') });
                    if (recipeName) {
                        // console.log('hello there')
                        throw new Error(`Recipe name: ${recipeName.recipe_name} has been used / taken.`)
                    }
                }
            }
            await checkIngredient(input);
            // console.log(`Update Recipe, ID: ${id}, recipe_name: ${recipe_name}, input: ${input}, status: ${status}, price: ${price}, imgUrl: ${imgUrl}, discount: ${discount}`);
            const updatedRecipe = await RecipeModel.findByIdAndUpdate(id, {
                recipe_name,
                ingredients: input,
                status: status,
                imgUrl: imgUrl,
                price: price,
                special_offer,
                discount: discount,
                highlight
            }, { new: true, runValidators: true });
            if (!updatedRecipe) { throw new ApolloError(`Recipe with id: ${id} not found`) }
            if (updatedRecipe.status === 'unpublish') {
                const carts = await cartModel.find({ status: 'pending' });
                // console.log('update recipe pending', JSON.stringify(carts));
                for (let cart of carts) {
                    // console.log(cart)
                    await cart.updateOne({ $pull: { "cart": { "recipe_id": mongoose.Types.ObjectId(id) } } })
                }
            }
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
            // console.log(`Delete Recipe ID: ${id}, Name: ${deletedRecipe.recipe_name}`);
            return deletedRecipe;
        } catch (error) {
            throw new ApolloError(error);
        }
    }
}