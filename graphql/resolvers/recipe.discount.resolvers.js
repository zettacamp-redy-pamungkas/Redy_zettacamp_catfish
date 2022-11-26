async function recipeDiscount({ discount }) {
    return discount * 100
}

module.exports.recipe_discount = {
    discount: recipeDiscount
}