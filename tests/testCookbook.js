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
    t.deepEqual(
        parseRecipeMarkdown(`
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
`),
        {
            'author': 'The Author',
            'categories': ['Stuff'],
            'content': [
                {
                    'markdown': {
                        'parts': [
                            {'paragraph': {'spans': [{'text': 'Mix together:'}]}}
                        ]
                    }
                },
                {
                    'ingredients': [
                        {'amount': 0.25, 'name': 'this', 'unit': 'cup'},
                        {'amount': 2, 'name': 'that', 'unit': 'tbsp'}
                    ]
                }
            ],
            'title': 'The Title'
        }
    );
});


test('parseRecipeMarkdown, degenerate', (t) => {
    t.deepEqual(
        parseRecipeMarkdown(`
Mix together:

1/4 C this
2 tbsp that
`),
        {
            'categories': ['Uncategorized'],
            'content': [
                {
                    'markdown': {
                        'parts': [
                            {'paragraph': {'spans': [{'text': 'Mix together:'}]}},
                            {'paragraph': {'spans': [{'text': '1/4 C this\n2 tbsp that'}]}}
                        ]
                    }
                }
            ],
            'title': 'Untitled Recipe'
        }
    );
});


test('parseRecipeMarkdown, empty', (t) => {
    t.deepEqual(
        parseRecipeMarkdown(''),
        {
            'categories': ['Uncategorized'],
            'content': [],
            'title': 'Untitled Recipe'
        }
    );
});


test('parseRecipeMarkdown, servings', (t) => {
    t.deepEqual(
        parseRecipeMarkdown(`
~~~ recipe-info
Servings: 10
ServingSize: 1 waffle
~~~
`),
        {
            'categories': ['Uncategorized'],
            'content': [],
            'servings': {
                'count': 10,
                'size': {'amount': 1, 'name': 'waffle', 'unit': 'count'}
            },
            'title': 'Untitled Recipe'
        }
    );
});
