// Transaction model
const UserModel = require('../models/user.model');

// bcrypt
const bcrypt = require('bcrypt')

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
        first_name: "Redy",
        last_name: "Pamungkas",
        password: bcrypt.hashSync("redy123", 10),
        email: "redy@mail.com",
        role: { user_type: "user", view_permission: [{ name: "menu_management", access: false }, { name: "stock_management", access: false }] }
    })

    await newUser.save();
}

insertOneUser();