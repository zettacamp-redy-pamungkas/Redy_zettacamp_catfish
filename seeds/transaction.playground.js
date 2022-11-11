// Transaction model
const TransactionModel = require('../models/transaction.model');

// mongoose
const mongoose = require('mongoose');
const dbName = 'restoran';

// mongoose connect
mongoose.connect(`mongodb://localhost:27017/${dbName}`)
    .then(() => { console.log('MongoDB connections open') })
    .catch((err) => { console.log(err) })

async function transactionInsert() {
    const newTransaction = new TransactionModel({
        user_id: "6369ea421e277a343ef46a09",
        menu: [
            {
                recipe_id: "636b2843b738acb6d5391ddb",
                amount: 2,
                note: "Tolong pedas",
            }
        ],
    });

    await newTransaction.save()
}

async function transactionPlayground() {
    // await TransactionModel.deleteMany();

    await transactionInsert()

    mongoose.connection.close();
}

transactionPlayground()