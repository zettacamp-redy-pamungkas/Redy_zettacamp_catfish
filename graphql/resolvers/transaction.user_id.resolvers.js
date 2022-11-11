async function getUserLoader({ user_id }, args, { userLoader }) {
    return await userLoader.load(user_id);
}

module.exports.user_id = {
    user_id: getUserLoader
}