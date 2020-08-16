import {CookbookPage, ingredientText, parseRecipeMarkdown} from '../src/cookbook.js';
import test from 'ava';

/* eslint-disable id-length */


test('CookbookPage, constructor', (t) => {
    const cookbook = new CookbookPage('cookbook.json');
    t.is(cookbook.cookbookUrl, 'cookbook.json');
    t.is(cookbook.params, null);
});


test('ingredientText, tbsp', (t) => {
    t.deepEqual(
        ingredientText({'amount': 1, 'unit': 'tbsp', 'name': 'olive oil'}),
        ['1', 'tbsp', 'olive oil']
    );
});


test('ingredientText, tsp to tbsp', (t) => {
    t.deepEqual(
        ingredientText({'amount': 3, 'unit': 'tsp', 'name': 'olive oil'}),
        ['1', 'tbsp', 'olive oil']
    );
});


test('ingredientText, fraction tsp', (t) => {
    t.deepEqual(
        ingredientText({'amount': 0.5, 'unit': 'tsp', 'name': 'olive oil'}),
        ['1/2', 'tsp', 'olive oil']
    );
});


test('ingredientText, whole and fraction cup', (t) => {
    t.deepEqual(
        ingredientText({'amount': 1.75, 'unit': 'cup', 'name': 'hot water'}),
        ['1 3/4', 'C', 'hot water']
    );
});


test('ingredientText, 2/3 cup doubled', (t) => {
    t.deepEqual(
        ingredientText({'amount': 2 / 3, 'unit': 'cup', 'name': 'water'}, 2),
        ['1 1/3', 'C', 'water']
    );
});


test('parseRecipeMarkdown', (t) => {
    const markdownText = `
~~~ recipe-info
Title: The Title
Categories: Stuff
Author: The Author
~~~

Mix together:

~~~ recipe-ingredients
1/4 C this

2 tbsp that
~~~
`;
    const recipe = parseRecipeMarkdown(markdownText);
    t.is(typeof recipe.markdown, 'object');
    delete recipe.markdown;
    t.deepEqual(
        recipe,
        {
            'author': 'The Author',
            'categories': ['Stuff'],
            'ingredients': [
                {'amount': 0.25, 'name': 'this', 'unit': 'cup'},
                {'amount': 2, 'name': 'that', 'unit': 'tbsp'}
            ],
            'markdownText': markdownText,
            'title': 'The Title'
        }
    );
});


test('parseRecipeMarkdown, degenerate', (t) => {
    const markdownText = `
Mix together:

1/4 C this
2 tbsp that
`;
    const recipe = parseRecipeMarkdown(markdownText);
    t.is(typeof recipe.markdown, 'object');
    delete recipe.markdown;
    t.deepEqual(
        recipe,
        {
            'ingredients': [],
            'markdownText': markdownText,
            'title': 'Untitled Recipe'
        }
    );
});


test('parseRecipeMarkdown, empty', (t) => {
    const markdownText = '';
    const recipe = parseRecipeMarkdown(markdownText);
    t.is(typeof recipe.markdown, 'object');
    delete recipe.markdown;
    t.deepEqual(
        recipe,
        {
            'ingredients': [],
            'markdownText': markdownText,
            'title': 'Untitled Recipe'
        }
    );
});


test('parseRecipeMarkdown, float ingredient amount', (t) => {
    const markdownText = `
~~~ recipe-ingredients
1.5 C water
~~~
`;
    const recipe = parseRecipeMarkdown(markdownText);
    t.is(typeof recipe.markdown, 'object');
    delete recipe.markdown;
    t.deepEqual(
        recipe,
        {
            'ingredients': [
                {'amount': 1.5, 'name': 'water', 'unit': 'cup'}
            ],
            'markdownText': markdownText,
            'title': 'Untitled Recipe'
        }
    );
});


test('parseRecipeMarkdown, servings', (t) => {
    const markdownText = `
~~~ recipe-info
Servings: 10
~~~
`;
    const recipe = parseRecipeMarkdown(markdownText);
    t.is(typeof recipe.markdown, 'object');
    delete recipe.markdown;
    t.deepEqual(
        recipe,
        {
            'ingredients': [],
            'markdownText': markdownText,
            'servings': 10,
            'title': 'Untitled Recipe'
        }
    );
});
