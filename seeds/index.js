// Ingredient model
const IngredientModel = require('../models/ingredient.model');

// Recipe Model
const RecipeModel = require('../models/recipes.model');

// Transaction model
const TransactionModel = require('../models/transaction.model');

// Cart Model
const CartModel = require('../models/cart.model');

// user model
const UserModel = require('../models/user.model');

// ingredient seed
const ingredientSeeds = require('./ingredientSeed');

// recipe seed
const recipeSeeds = require('./recipeSeed');

// user seed
const userSeeds = require('./user.seeds');

// mongoose
const mongoose = require('mongoose');

// mongoose connect
mongoose.connect(`mongodb+srv://zetta:zettacatfish@cluster0.yyo0wkk.mongodb.net/restoran?retryWrites=true&w=majority`)
    .then(() => { console.log('MongoDB connections open') })
    .catch((err) => { console.log(err) })

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
    await UserModel.deleteMany({});

    console.log('All data has been deleted');
}

async function insertUsers() {
    for (let user of userSeeds) {
        const newUser = new UserModel(user)
        await newUser.save();
    }
}

// insert ingredient
async function insertIngredients(arrIngredient) {
    for (let ingredient of arrIngredient) {
        const randomStock = getRandomMinMax(35, 70);
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
        const newRecipe = new RecipeModel({ recipe_name: recipe.recipe_name, price: recipe.price, ingredients: recipe_ingredients, imgUrl: recipe.imgUrl, status: 'publish', special_offer: recipe.special_offer, highlight: recipe.highlight, discount: recipe.discount });
        await newRecipe.save();
    }

    console.log(`${arrRecipe.length} recipes has been inserted.`);
}

// seeds
async function seeds() {
    await deleteAllData();
    await insertUsers();
    await insertIngredients(ingredientSeeds);
    await insertRecipe(recipeSeeds);
    console.log('All seeds has been inserted');
    mongoose.connection.close();
}

// insertRecipe(recipeSeeds);
seeds();