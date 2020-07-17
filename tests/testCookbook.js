import {CookbookPage} from '../src/cookbook.js';
import test from 'ava';

/* eslint-disable id-length */


test('Cookbook', (t) => {
    const cookbook = new CookbookPage('cookbook.json');
    t.is(cookbook.cookbookUrl, 'cookbook.json');
    t.is(cookbook.params, null);
});
