~~~ markdown-script
include '../markdownBookRecipe.mds'
recipeMenu()
~~~

# Hot Cabbage Salad

~~~ markdown-script
recipeHeader(objectNew( \
    'author', 'Emery Hobbs' \
))
~~~

![Hot Cabbage Salad](../images/HotCabbageSalad.jpg "Hot Cabbage Salad")

Combine in a large saucepan:

~~~ markdown-script
recipeIngredients(arrayNew( \
    '2 C sliced cabbage', \
    '1 C diced onion', \
    '1/4 C water', \
    '2 Tbsp vinegar', \
    '1  Tbsp sugar', \
    '1 tsp salt' \
))
~~~

Cover pan and cook about 20 minutes at low simmer.

Combine with the crisp bacon and serve.

~~~ markdown-script
recipeIngredients(arrayNew( \
    '2 slices crisp cooked diced bacon' \
))
~~~
