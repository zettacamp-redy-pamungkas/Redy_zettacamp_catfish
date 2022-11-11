async function getRecipe(parent, args, {recipeLoader}) {
    return await recipeLoader.load(parent.recipe_id)
}

module.exports.recipe_id = {
    recipe_id: getRecipe
}