// User Model
const UserModel = require('../../models/user.model')

// data loader
const DataLoader = require('dataloader');

async function getUserByIds(ids) {
    const users = await UserModel.find({
        _id: { $in: ids }
    });

    const userMap = {}

    users.forEach((user) => userMap[user.id] = user);

    return ids.map((id) => userMap[id]);
}

module.exports = new DataLoader(getUserByIds);