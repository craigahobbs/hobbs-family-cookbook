import {CookbookPage, ingredientText} from '../src/cookbook.js';
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
        ['1 3/4', 'cup', 'hot water']
    );
});
