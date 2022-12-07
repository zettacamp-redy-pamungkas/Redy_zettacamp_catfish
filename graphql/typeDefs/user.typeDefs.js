module.exports.userQuery =
    `getAllUsers(email: String, last_name: String, first_name: String, page: Int, limit: Int) : Users
    getOneUser(id: ID, email: String, friend_name: String, pet_name: String) : User`

module.exports.userMutation =
    `createOneUser(email: String, last_name: String, first_name: String, password: String, confirmPassword: String, friend_name: String, pet_name: String): User
    updateUser(id: ID, first_name: String, last_name: String, email: String, password: String, oldPassword: String): User
    resetPassword(email: String, friend_name: String, pet_name:String, password: String, confirm_password: String): User
    deleteUser(id: ID): User
    login(email: String, password: String): Login
    `
