~~~ markdown-script
include '../markdownBookRecipe.bare'
recipeMenu()
~~~

# Sees Fudge

~~~ markdown-script
recipeHeader(objectNew( \
    'author', 'Laura Ferguson' \
))
~~~

Combine the following in a large saucepan and cook together for 6 minutes:

~~~ markdown-script
recipeIngredients(arrayNew( \
    '2 C sugar', \
    '3/4 C evaporated milk' \
))
~~~

Add and stir to melt:

~~~ markdown-script
recipeIngredients(arrayNew( \
    '2 C miniature marshmallows', \
    '1  C chocolate chips', \
    '1/4 C butter', \
    '1 tsp vanilla' \
))
~~~

Turn out into a greased 9 X 9 pan or into individual paper candy cups (like cupcake liners, only
smaller)

Add chopped pecans if desired:

~~~ markdown-script
recipeIngredients(arrayNew( \
    '1 C chopped pecans (optional)' \
))
~~~
