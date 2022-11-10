const { gql } = require('apollo-server');

const { userQuery, userMutation } = require('./typeDefs/user.typeDefs')

module.exports = gql`
    type User {
        id: ID!
        email: String!
        password: String
        first_name: String!
        last_name: String!
        status: Status
    }

    type Users {
        users: [User]
        page: Int
        maxPage: Int
        currentDocs: Int
        totalDocs: Int
    }

    type Login {
        token: String
    }

    type Ingredient {
        id: ID
        name: String
        stock: Int
        status: Status
    }

    type Ingredients {
        ingredients: [Ingredient]
        page: Int
        maxPage: Int
        currentDocs: Int
        totalDocs: Int
    }

    type IngredientForRecipe {
        ingredient_id: Ingredient
        stock_used: Int
    }

    type Recipe {
        id: ID
        recipe_name: String
        ingredients: [IngredientForRecipe]
        status: Status
    }

    type Recipes {
        recipes: [Recipe]
        page: Int
        maxPage: Int
        currentDocs: Int
        totalDocs: Int
    }

    input RecipeIngredient {
        ingredient_id: ID
        stock_used: Int
    }

    enum Status {
        active
        deleted
    }

    type Query {
        ${userQuery}
        getAllIngredient(name: String, stock: Int, page: Int, limit: Int): Ingredients
        getOneIngredient(id: ID): Ingredient
        getAllRecipe(recipe_name: String, page: Int, limit: Int): Recipes
        getOneRecipe(id: ID): Recipe
    }

    type Mutation {
        ${userMutation}
        createIngredient(name: String, stock: Int, status: Status) : Ingredient
        updateIngredient(id: ID, stock: Int, status: String): Ingredient
        deleteIngredient(id: ID): Ingredient
        createRecipe(recipe_name: String, input: [RecipeIngredient]): Recipe
    }
`