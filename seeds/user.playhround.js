// Transaction model
const UserModel = require('../models/user.model');

// mongoose
const mongoose = require('mongoose');
const dbName = 'restoran';

// mongoose connect
mongoose.connect(`mongodb://localhost:27017/${dbName}`)
    .then(() => { console.log('MongoDB connections open') })
    .catch((err) => { console.log(err) })

// insertOneUser
async function insertOneUser() {
    const newUser = new UserModel({
        first_name: "admin",
        last_name: "admin",
        email: "admin",
        role: "admin",
    })
}