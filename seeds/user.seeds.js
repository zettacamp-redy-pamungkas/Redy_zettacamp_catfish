// bcrypt
const bcrypt = require('bcrypt');

module.exports = [
    {
        first_name: "Abraham",
        last_name: "Loedwijck",
        password: bcrypt.hashSync("abraham123", 10),
        email: "abraham@mail.com",
        friend_name: "test",
        balance: 0,
        pet_name: "user",
        role: { user_type: "admin", view_permission: [{ name: "menu_management", access: true }, { name: "stock_management", access: true }] }
    },
    {
        first_name: "Arum",
        last_name: "Admin",
        password: bcrypt.hashSync("12345678", 10),
        email: "arumadmin@mail.com",
        friend_name: "test",
        balance: 0,
        pet_name: "user",
        role: { user_type: "admin", view_permission: [{ name: "menu_management", access: true }, { name: "stock_management", access: true }] }
    },
    {
        first_name: "Arum",
        last_name: "Kusuma",
        password: bcrypt.hashSync("12345678", 10),
        email: "arum@mail.com",
        friend_name: "test",
        balance: 500000,
        pet_name: "user",
        role: { user_type: "user", view_permission: [{ name: "menu_management", access: false }, { name: "stock_management", access: false }] }
    },
    {
        first_name: "Tegar",
        last_name: "Admin",
        password: bcrypt.hashSync("tegar123", 10),
        email: "tegaradmin@gmail.com",
        balance: 0,
        friend_name: "test",
        pet_name: "user",
        role: { user_type: "admin", view_permission: [{ name: "menu_management", access: true }, { name: "stock_management", access: true }] }
    },
    {
        first_name: "Redy",
        last_name: "Admin",
        password: bcrypt.hashSync("redy123", 10),
        email: "redyadmin@mail.com",
        balance: 0,
        friend_name: "test",
        pet_name: "user",
        role: { user_type: "admin", view_permission: [{ name: "menu_management", access: true }, { name: "stock_management", access: true }] }
    },
    {
        first_name: "Redy",
        last_name: "Pamungkas",
        password: bcrypt.hashSync("redy123", 10),
        email: "redy@mail.com",
        friend_name: "test",
        pet_name: "user",
        role: { user_type: "user", view_permission: [{ name: "menu_management", access: false }, { name: "stock_management", access: false }] }
    },
    {
        first_name: "Tegar",
        last_name: "Pangestu",
        password: bcrypt.hashSync("tegar123", 10),
        email: "tegar@gmail.com",
        friend_name: "test",
        pet_name: "user",
        role: { user_type: "user", view_permission: [{ name: "menu_management", access: false }, { name: "stock_management", access: false }] }
    },
]