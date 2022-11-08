const { gql } = require('apollo-server');

module.exports = gql`
    type User {
        id: ID!
        email: String!
        password: String
        first_name: String!
        last_name: String!
        status: Status
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
        getAllUsers(email: String, last_name: String, first_name: String) : [User]
        getOneUser(id: ID, email: String) : User
    }

    type Mutation {
        createOneUser(email: String, last_name: String, first_name: String, password: String, confirmPassword: String, status: String): User
        updateUser(id: ID, first_name: String, last_name: String, email: String, password: String, oldPassword: String): User
        deleteUser(id: ID): User
        login(email: String, password: String): Login
    }
`