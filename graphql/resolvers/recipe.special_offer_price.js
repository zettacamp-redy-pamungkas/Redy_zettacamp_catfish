async function recipeSpecialOfferPrice({ special_offer, price }) {
    
    return special_offer ? Math.floor(price * (1 - 0.7)) : price;
}

module.exports.recipe_specialOfferPrice = {
    special_offer_price: recipeSpecialOfferPrice
}