~~~ markdown-script
include '../markdownBookRecipe.bare'
recipeMenu()
~~~

# Mom's Coffee Cake

~~~ markdown-script
recipeHeader()
~~~

![Mom's Coffee Cake](../images/MomsCoffeeCake.jpg "Mom's Coffee Cake")

Using an electric mixer with a paddle attachment, mix together:

~~~ markdown-script
recipeIngredients(arrayNew( \
    '2 C flour', \
    '1 C sugar', \
    '3 tsp baking powder', \
    '1 tsp salt' \
))
~~~

Add and beat hard for 2 minutes:

~~~ markdown-script
recipeIngredients(arrayNew( \
    '1 egg', \
    '1 C milk', \
    '1/3 C soft butter' \
))
~~~

Spread the batter into a buttered 9 X 9" square pan. Top with Crunchy Topping as follows:

Use a rotary beater to mix first 4 ingredients, then stir in the nuts and coconut:

~~~ markdown-script
recipeIngredients(arrayNew( \
    '1/4 C butter', \
    '1/2 C brown sugar', \
    '1/4 C flour', \
    '1 tsp cinnamon', \
    '1/2 C chopped pecans', \
    '1/2 C flaked coconut' \
))
~~~

Bake coffee cake in a 350 degree oven for 40 minutes or until a toothpick inserted in center comes
out clean. Usually this cake takes an extra 10 minutes depending on your oven.
