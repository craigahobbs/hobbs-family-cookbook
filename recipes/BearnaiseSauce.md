~~~ markdown-script
include '../markdownBookRecipe.bare'
recipeMenu()
~~~

# Bearnaise Sauce

~~~ markdown-script
recipeHeader()
~~~

In a saucepan, add the following ingredients:

~~~ markdown-script
recipeIngredients(arrayNew( \
    '1 tbsp minced shallot', \
    '1/2 tsp dried tarragon', \
    '1/4 tsp salt', \
    '1/4 C white wine vinegar', \
    '1/4 C dry white vermouth' \
))
~~~

Add freshly ground pepper to taste. Bring to a boil and reduce heat to a simmer. Reduce mixture
until sauce pan contains roughly the following amount of liquid:

~~~ markdown-script
recipeIngredients(arrayNew( \
    '2 tbsp liquid' \
))
~~~

Cool liquid slightly and stir in:

~~~ markdown-script
recipeIngredients(arrayNew( \
    '2 egg yolks' \
))
~~~

Bring the heat up to medium and melt in:

~~~ markdown-script
recipeIngredients(arrayNew( \
    '3/4 C butter' \
))
~~~

Whisk until sauce thickens.
