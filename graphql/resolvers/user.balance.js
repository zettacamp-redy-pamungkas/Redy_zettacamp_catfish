// ApolloError
const { ApolloError } = require('apollo-server');

// Cart Model
const UserModel = require('../../models/user.model');

// transaction model
const TransactionModel = require('../../models/transaction.model');
const transactionModel = require('../../models/transaction.model');

// 
async function userBalance({ balance, role: { user_type } }) {
    if (user_type === "admin") {
        const transactions = await transactionModel.find({ order_status: 'success' });
        // console.log(transaction)
        let adminBalance = 0;
        for (let transaction of transactions) {
            adminBalance += transaction.total_price;
        }
        return adminBalance;
    } else {
        return balance
    }
}

module.exports.userBalance = {
    balance: userBalance
}