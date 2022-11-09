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
        id: ID!
        name: String!
        stock: Int!
        status: Status
    }

    enum Status {
        active
        deleted
    }

    type Query {
        ${userQuery}
    }

    type Mutation {
        ${userMutation}
        createIngredient(name: String, stock: Int, status: Status) : Ingredient
    }
`