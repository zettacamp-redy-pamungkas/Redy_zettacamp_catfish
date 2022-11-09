// Ingredient model
const IngredientModel = require('../../models/ingredient.model');

// Apollo Error
const { ApolloError } = require('apollo-server');

module.exports.ingredientMutation = {
    createIngredient: async (_, {name, stock}) => {
        try {
            const newIngredient = new IngredientModel({name, stock});
            await newIngredient.save()
            return newIngredient
        } catch (err) {
            throw new ApolloError(err);
        }

    }
}