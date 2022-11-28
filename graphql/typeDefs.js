const { gql } = require('apollo-server');

const { userQuery, userMutation } = require('./typeDefs/user.typeDefs')

module.exports = gql`
    
    type ViewPermission {
        name: String
        access: Boolean
    }

    type UserType {
        user_type: String
        view_permission: [ViewPermission]
    }

    type User {
        id: ID!
        email: String!
        password: String
        first_name: String!
        last_name: String!
        status: Status
        role: UserType
    }

    type Users {
        users: [User]
        page: Int
        maxPage: Int
        currentDocs: Int
        totalDocs: Int
    }

    type UserLogin {
        user_id: ID
        email: String,
        first_name: String
        last_name: String
        role: UserType
    }

    type Login {
        token: String
        user: UserLogin
    }

    type Ingredient {
        id: ID
        name: String
        stock: Int
        isUsed: Boolean
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
        totalLength: Int
        price: Int
        imgUrl: String
        available: Int
        status: Status
        special_offer: Boolean
        special_offer_price: Int
        highlight: Boolean
        discount: Float
    }

    type Recipes {
        recipes: [Recipe]
        page: Int
        maxPage: Int
        currentDocs: Int
        totalDocs: Int
    }

    type Menu {
        id: ID
        recipe_id: Recipe
        amount: Int
        total_price: Int
        note: String
    }

    type UserCart {
        _id: ID,
        user_id: ID,
        cart: [Menu],
        cart_length: Int,
        total_price: Int
        status: Status
    }

    type Transaction {
        id: ID
        user_id: User
        menu: [Menu]
        total_price: Int
        order_status: OrderStatus
        order_date: String
        note_transaction: String
        status: Status
    }

    type Transactions {
        transactions: [Transaction]
        page: Int
        maxPage: Int
        currentDocs: Int
        totalDocs: Int
    }

    input Pagination {
        page: Int
        limit: Int
    }

    input FilterIngredient {
        name: String
        stock: Int
    }

    input FilterRecipe {
        name: String
    }

    input RecipeIngredient {
        ingredient_id: ID
        stock_used: Int
    }

    input MenuInput {
        recipe_id: ID
        amount: Int
        note: String
    }

    input CreateRecipe {
        name: String
        stock: Int
        discount: Float
        status: Status
    }

    input UpdateRecipe {
        id: ID
        recipe_name: String
        input: [RecipeIngredient]
        status: String
        imgUrl: String
        price: Int
        special_offer: Boolean
        discount: Float
        highlight: Boolean
    }

    enum Status {
        active
        deleted
        publish
        unpublish
        pending
    }

    enum OrderStatus {
        success,
        failed
    }

    type Query {
        ${userQuery}
        getAllIngredient(name: String, stock: Int, status: String, page: Int, limit: Int): Ingredients
        getOneIngredient(id: ID): Ingredient
        getAllRecipe(recipe_name: String, status: String, page: Int, limit: Int, special_offer: Boolean, highlight: Boolean,): Recipes
        getAllRecipes(recipe_name: String, status: String, special_offer: Boolean, highlight: Boolean, page: Int, limit: Int): Recipes
        getOneRecipe(id: ID): Recipe
        getAllTransaction(last_name: String,recipe_name: String, order_date: String, order_status: String, page: Int, limit: Int): Transactions
        getAllTransactionAdmin(last_name: String, recipe_name: String, order_date: String, order_status: String, page: Int, limit: Int): Transactions
        getOneTransaction(id: ID): Transaction
        getAllCart: UserCart
    }

    type Mutation {
        ${userMutation}
        createIngredient(name: String, stock: Int, status: Status) : Ingredient
        updateIngredient(id: ID, name: String, stock: Int, status: String): Ingredient
        deleteIngredient(id: ID): Ingredient
        createRecipe(recipe_name: String, input: [RecipeIngredient], imgUrl: String, price: Int, discount: Float): Recipe
        updateRecipe(id: ID, recipe_name: String input: [RecipeIngredient], status: String, imgUrl: String, price: Int, special_offer: Boolean, discount: Float highlight: Boolean): Recipe
        deleteRecipe(id: ID): Recipe
        createTransaction(user_id: String, menu:[MenuInput]): Transaction
        deleteTransaction(id: ID): Transaction
        addCart(user_id: ID, cart: MenuInput): UserCart
        removeMenu(user_id: ID, item_id: ID): UserCart
        updateAmountMenu(item_id: ID, quantity: Int): UserCart
        updateCart(user_id: ID, item_id: ID, amount: Int, note: String): UserCart,
        deleteCart: UserCart
    }
`