async function recipeSpecialOfferPrice({ special_offer, price, discount }) {
    
    return special_offer ? Math.floor(price * (1 - (discount / 100))) : price;
}

module.exports.recipe_specialOfferPrice = {
    special_offer_price: recipeSpecialOfferPrice
}