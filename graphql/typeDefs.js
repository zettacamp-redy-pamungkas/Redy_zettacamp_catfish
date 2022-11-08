const { gql } = require('apollo-server');

module.exports = gql`
    type User {
        id: ID!
        email: String!
        password: String
        first_name: String!
        last_name: String!
        status: String
    }

    type Login {
        token: String
    }

    type Query {
        getAllUsers(email: String, last_name: String, first_name: String) : [User]
        getOneUser(id: ID, email: String) : User
    }

    type Mutation {
        updateUser(id: ID, first_name: String, last_name: String, email: String, password: String): User
        createOneUser(email: String, last_name: String, first_name: String, password: String, confirmPassword: String): User
        login(email: String, password: String): Login
    }
`