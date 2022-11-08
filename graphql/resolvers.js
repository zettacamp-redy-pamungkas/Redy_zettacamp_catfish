// user resolver
const {userQuery, userMutation} = require('./resolvers/user.resolvers')

module.exports = {
    Query: {
        ...userQuery,
    },
    Mutation: {
        ...userMutation,
    }
}