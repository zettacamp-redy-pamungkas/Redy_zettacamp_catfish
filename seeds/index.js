// Ingredient model
const IngredientModel = require('../models/ingredient.model');

// Recipe Model
const RecipeModel = require('../models/recipes.model');

// Transaction model
const TransactionModel = require('../models/transaction.model');

// Cart Model
const CartModel = require('../models/cart.model');

// ingredient seed
const ingredientSeeds = require('./ingredientSeed');

// recipe seed
const recipeSeeds = require('./recipeSeed');

// mongoose
const mongoose = require('mongoose');

// mongoose connect
mongoose.connect('mongodb://localhost:27017/restoran')
    .then(() => console.log('MongoDB connection open'))
    .catch((err) => new Error(err));

// getRandom min max
function getRandomMinMax(min, max) {
    if (min > max) [min, max] = [max, min];

    return Math.floor(Math.random() * (max - min)) + min + 1;
}

// Delete all data
async function deleteAllData() {
    await IngredientModel.deleteMany({});
    await RecipeModel.deleteMany({});
    await TransactionModel.deleteMany({});
    await CartModel.deleteMany({});

    console.log('All data has been deleted');
}

// insert ingredient
async function insertIngredients(arrIngredient) {
    for (let ingredient of arrIngredient) {
        const randomStock = getRandomMinMax(15, 35);
        const newIngredient = new IngredientModel({ name: ingredient, stock: randomStock });
        await newIngredient.save();
    }

    console.log(`${arrIngredient.length} ingredient has been inserted`);
}

// insert dummies recipe
async function insertRecipe(arrRecipe) {
    // get all ingredient
    let ingredients = await IngredientModel.find({}).lean();
    let ingredientsName = ingredients.map((el) => el.name);

    for (let recipe of arrRecipe) {
        const recipe_ingredients = [];
        for (let ingredient of recipe.ingredients) {
            // console.log(ingredient);
            const index = ingredientsName.indexOf(ingredient.ingredient_name);
            recipe_ingredients.push({ ingredient_id: ingredients[index]._id, stock_used: ingredient.stock_used });
        }
        const newRecipe = new RecipeModel({ recipe_name: recipe.recipe_name, price: recipe.price, ingredients: recipe_ingredients, imgUrl: recipe.imgUrl, status: 'publish' });
        await newRecipe.save();
    }
    
    console.log(`${arrRecipe.length} recipes has been inserted.`);
}

// seeds
async function seeds() {
    await deleteAllData();
    await insertIngredients(ingredientSeeds);
    await insertRecipe(recipeSeeds);

    console.log('All seeds has been inserted');
}

// insertRecipe(recipeSeeds);
seeds();