~~~ markdown-script
include '../markdownBookRecipe.bare'
recipeMenu()
~~~

# Lemon Bars

~~~ markdown-script
recipeHeader(objectNew( \
    'author', 'Karen Sandberg' \
))
~~~

Cream together:

~~~ markdown-script
recipeIngredients(arrayNew( \
    '3/4 C Butter', \
    '1/3 C powdered sugar' \
))
~~~

Stir in:

~~~ markdown-script
recipeIngredients(arrayNew( \
    '1 1/2 C flour' \
))
~~~

Pat mixture into a greased 9 X 13" baking pan. Bake at 350 degrees for 15 minutes.

Combine:

~~~ markdown-script
recipeIngredients(arrayNew( \
    '3 whole eggs', \
    '4 Tbsp flour', \
    '1 1/2 C sugar', \
    '1/2 C lemon juice' \
))
~~~

Pour mixture over the hot crust and return to the oven for 15 more minutes. Cool and dust with
powdered sugar. Cut in squares and serve.
