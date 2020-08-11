// Licensed under the MIT License
// https://github.com/craigahobbs/cookbook/blob/master/LICENSE

import * as chisel from './chisel/chisel.js';
import {markdownElements, parseMarkdown} from './chisel/markdown.js';
import {cookbookTypes} from './cookbookTypes.js';


/**
 * The cookbook application hash parameters type model
 */
const cookbookPageTypes = {
    'CookbookPageParams': {
        'struct': {
            'name': 'CookbookPageParams',
            'members': [
                {
                    'name': 'title',
                    'type': {'builtin': 'string'},
                    'attr': {'lenGT': 0, 'lenLT': 100},
                    'optional': true
                },
                {
                    'name': 'scale',
                    'type': {'builtin': 'float'},
                    'attr': {'gte': 0.125, 'lte': 8},
                    'optional': true
                }
            ]
        }
    }
};


/**
 * The cookbook application class.
 *
 * @property {Object} cookbookUrl - The cookbook URL
 * @property {Object} cookbook - The cookbook model
 * @property {Object} recipes - The cookbook's recipe models
 * @property {Object} params - The validated hash parameters object
 */
export class CookbookPage {
    /**
     * Create a cookbook application instance.
     */
    constructor(cookbookUrl) {
        this.cookbookUrl = cookbookUrl;
        this.cookbook = null;
        this.recipes = null;
        this.params = null;
    }


    /**
     * Run the application
     *
     * @property {Object} cookbookUrl - The cookbook URL
     * @returns {Object} Object meant to be passed to "runCleanup" for application shutdown
     */
    static run(cookbookUrl) {
        // Create the applicaton object and render
        const cookbookPage = new CookbookPage(cookbookUrl);
        cookbookPage.render();

        // Add the hash parameters listener
        const addEventListenerArgs = ['hashchange', () => cookbookPage.render(), false];
        window.addEventListener(...addEventListenerArgs);

        // Return the cleanup object
        return {
            'windowRemoveEventListener': addEventListenerArgs
        };
    }


    /*
     * Cleanup global state created by "run"
     *
     * @param {Object} runResult - The return value of "run"
     */
    static runCleanup(runResult) {
        window.removeEventListener(...runResult.windowRemoveEventListener);
    }


    /**
     * Parse the window location's hash parameters. This method sets two class members: this.params and
     * this.config. this.params is the decoded hash parameters object for use with creating links to the
     * application. this.config is object containing all known hash parameters parsed and validated.
     */
    updateParams() {
        this.params = null;
        this.config = null;
        this.params = chisel.validateType(cookbookPageTypes, 'CookbookPageParams', chisel.decodeParams());
        this.config = {
            'scale': 1,
            ...this.params
        };
    }


    /**
     * The main entry point for the cookbook application. This method renders the cookbook
     * page within the document.body element.
     */
    render() {
        // Decode and validate hash parameters
        try {
            const oldParams = this.params;
            this.updateParams();

            // Skip the render if the page params haven't changed
            if (oldParams !== null && JSON.stringify(oldParams) === JSON.stringify(this.params)) {
                return;
            }
        } catch ({message}) {
            chisel.render(document.body, CookbookPage.errorElements(message));
            return;
        }

        // Recipes already loaded? If so, render...
        if (this.recipes !== null) {
            chisel.render(document.body, this.pageElements());
        } else {
            // Fetch the cookbook model
            window.fetch(this.cookbookUrl).
                then((cookbook) => cookbook.json()).
                then((cookbook) => {
                    // Validate the cookbook model
                    this.cookbook = chisel.validateType(cookbookTypes, 'Cookbook', cookbook);

                    // Fetch the recipe models
                    if ('recipeURLs' in this.cookbook) {
                        Promise.all(this.cookbook.recipeURLs.map((recipeUrl) => window.fetch(recipeUrl))).
                            then((responses) => Promise.all(responses.map((recipe) => recipe.text()))).
                            then((recipes) => {
                                // Validate the recipes model
                                const recipeModels = recipes.map((recipe) => parseRecipeMarkdown(recipe));
                                this.recipes = chisel.validateType(cookbookTypes, 'Recipes', recipeModels);

                                // Render
                                chisel.render(document.body, this.pageElements());
                            }).
                            catch(({message}) => {
                                chisel.render(document.body, CookbookPage.errorElements(message));
                            });
                    }
                }).catch(({message}) => {
                    chisel.render(document.body, CookbookPage.errorElements(message));
                });
        }
    }


    /**
     * Helper function to generate the error page's element model
     *
     * @param {string} [error=null] - The error code. If null, an unexpected error is reported.
     * @return {Object}
     */
    static errorElements(error = null) {
        return {
            'html': 'p',
            'elem': {'text': error !== null ? `Error: ${error}` : 'An unexpected error occurred.'}
        };
    }


    /**
     * Generate the cookbook page elments for use with the chisel.render function.
     *
     * @returns {Array}
     */
    pageElements() {
        // Recipe page?
        if ('title' in this.config) {
            return this.recipeElements();
        }

        // Index page
        return this.indexElements();
    }


    /**
     * Helper function to generate the index page's element model
     *
     * @returns {Array}
     */
    indexElements() {
        // Sort and categorize recipes
        const categories = {};
        for (const [, recipe] of this.recipes.map((recipeMap) => [recipeMap.title, recipeMap]).sort()) {
            for (const category of recipe.categories) {
                if (!(category in categories)) {
                    categories[category] = [];
                }
                categories[category].push(recipe);
            }
        }

        return [
            // Title
            {'html': 'h1', 'elem': {'text': this.cookbook.title}},

            // Sorted recipe links
            {
                'html': 'ul',
                'attr': {'class': 'cookbook-index-list'},
                'elem': Object.entries(categories).sort().map(([category, recipes]) => [
                    {
                        'html': 'li',
                        'elem': [
                            {'html': 'h2', 'elem': {'text': category}},
                            {'html': 'ul', 'elem': recipes.map((recipe) => ({
                                'html': 'li',
                                'elem': {
                                    'html': 'a',
                                    'attr': {'href': chisel.href({...this.params, 'title': recipe.title})},
                                    'elem': {'text': recipe.title}
                                }
                            }))}
                        ]
                    }
                ])
            }
        ];
    }


    /**
     * Helper function to generate the recipe page's element model
     *
     * @returns {Array}
     */
    recipeElements() {
        // Find the recipe
        const recipe = this.recipes.find((recipeFind) => recipeFind.title === this.config.title);
        if (recipe === undefined) {
            return CookbookPage.errorElements(`Unknown recipe '${this.config.title}`);
        }
        const scaleAttr = cookbookPageTypes.CookbookPageParams.struct.members.find((member) => member.name === 'scale').attr;

        return [
            // Navigation bar
            {
                'html': 'p',
                'elem': {
                    'html': 'a',
                    'attr': {'href': chisel.href({...this.params, 'title': null, 'scale': null})},
                    'elem': {'text': 'Back to the index'}
                }
            },

            // Title
            {'html': 'h1', 'elem': {'text': recipe.title}},
            'author' in recipe ? {'html': 'p', 'elem': {'text': `Author: ${recipe.author}`}} : null,

            // Scale
            {'html': 'p', 'elem': [
                {'text': `Scale: ${this.config.scale}`},
                {
                    'html': 'a',
                    'attr': {'href': chisel.href({...this.params, 'scale': Math.max(scaleAttr.gte, this.config.scale / 2)})},
                    'elem': {'text': ' Halve'}
                },
                {
                    'html': 'a',
                    'attr': {'href': chisel.href({...this.params, 'scale': Math.min(scaleAttr.lte, this.config.scale * 2)})},
                    'elem': {'text': ' Double'}
                }
            ]},

            // Serving size and count
            !('servings' in recipe) ? null : {'html': 'p', 'elem': [
                {'text': `Servings: ${recipe.servings.count * this.config.scale}`},
                {'html': 'br'},
                {'text': 'Serving size: '},
                {'text': ingredientText(recipe.servings.size).join(' ')}
            ]},

            // Content
            recipe.content.map((content) => {
                // Ingredients list?
                if ('ingredients' in content) {
                    return {
                        'html': 'p',
                        'elem': [
                            'title' in content.ingredients ? {'html': 'h2', 'elem': {'text': content.ingredients.title}} : null,
                            {
                                'html': 'ul',
                                'attr': {'class': 'cookbook-ingredient-list'},
                                'elem': content.ingredients.map(
                                    (ingredient) => ({
                                        'html': 'li',
                                        'elem': {'text': ingredientText(ingredient, this.config.scale).join(' ')}
                                    })
                                )
                            }
                        ]
                    };
                }

                // Markdown
                return markdownElements(content.markdown);
            })
        ];
    }
}


// Ingredient bases
const unitInfo = {
    'count': {
        'baseUnit': 'count',
        'display': '',
        'baseRatio': 1,
        'fractions': [2, 4, 8]
    },
    'cup': {
        'alternates': ['C', 'Cup', 'Cups', 'cups'],
        'display': 'C',
        'baseUnit': 'tsp',
        'baseRatio': 48,
        'fractions': [2, 3, 4]
    },
    'lb': {
        'alternates': ['Lb', 'Lbs', 'Pounds', 'lbs', 'pounds'],
        'baseUnit': 'oz',
        'baseRatio': 16,
        'fractions': [2, 4]
    },
    'oz': {
        'alternates': ['Oz', 'Ounces', 'ounces'],
        'baseUnit': 'oz',
        'baseRatio': 1,
        'fractions': [2, 4]
    },
    'pinch': {
        'baseUnit': 'pinch',
        'baseRatio': 1,
        'fractions': [1]
    },
    'tbsp': {
        'alternates': ['Tbsp', 'Tablespoons', 'tablespoons'],
        'baseUnit': 'tsp',
        'baseRatio': 3,
        'fractions': [1]
    },
    'tsp': {
        'alternates': ['Tsp', 'Teaspoons', 'teaspoons'],
        'baseUnit': 'tsp',
        'baseRatio': 1,
        'fractions': [2, 4, 8]
    }
};


// Ingredient unit fuzz ratio
const unitFuzz = 0.1;


/**
 * Helper function to compute an ingredient model's display text parts
 *
 * @param {Object} ingredient - The ingredient model
 * @param {number} [scale=1] - The ingredient's scale ratio
 * @returns {string[]} The ingredient amount string, unit string, and name
 */
export function ingredientText(ingredient, scale = 1) {
    // Compute the best unit to display the ingredient
    const amountBase = ingredient.amount * scale * unitInfo[ingredient.unit].baseRatio;
    let bestIngredient = {
        'unit': ingredient.unit,
        'amount': ingredient.amount * scale,
        'amountNumerator': 0
    };
    for (const unit of Object.keys(unitInfo)) {
        // Same base unit?
        if (unitInfo[unit].baseUnit === unitInfo[ingredient.unit].baseUnit) {
            // Match a unit fraction
            const amountUnit = amountBase / unitInfo[unit].baseRatio;
            const amountInteger = Math.floor(amountUnit);
            const amountFraction = amountUnit - amountInteger;
            for (const denominator of unitInfo[unit].fractions) {
                for (let numerator = 0; numerator <= denominator; numerator += 1) {
                    // Is the fraction close enough?
                    const diff = Math.abs((numerator / denominator) - amountFraction);
                    if (diff / amountUnit <= unitFuzz) {
                        const amountFuzzed = numerator !== denominator ? amountInteger : amountInteger + 1;
                        const amountIntegerFuzzed = numerator !== denominator ? numerator : 0;
                        const measures = amountFuzzed + amountIntegerFuzzed;
                        const bestMeasures = bestIngredient.amount + bestIngredient.amountNumerator;
                        if (!('diff' in bestIngredient) || diff < bestIngredient.diff ||
                            (diff === bestIngredient.diff && measures < bestMeasures ||
                             (measures === bestMeasures && amountFuzzed < bestIngredient.amount ||
                              (amountFuzzed === bestIngredient.amount && amountIntegerFuzzed < bestIngredient.amountNumerator)))
                        ) {
                            bestIngredient = {
                                'unit': unit,
                                'amount': amountFuzzed,
                                'amountNumerator': amountIntegerFuzzed,
                                'amountDenominator': denominator,
                                'diff': diff
                            };
                        }
                    }
                }
            }
        }
    }

    // Create the ingredient elements
    let amountStr;
    const unitStr = 'display' in unitInfo[bestIngredient.unit] ? unitInfo[bestIngredient.unit].display : bestIngredient.unit;
    if (!('amountNumerator' in bestIngredient) || bestIngredient.amountNumerator === 0) {
        amountStr = `${bestIngredient.amount}`;
    } else if (bestIngredient.amount === 0) {
        amountStr = `${bestIngredient.amountNumerator}/${bestIngredient.amountDenominator}`;
    } else {
        amountStr = `${bestIngredient.amount} ${bestIngredient.amountNumerator}/${bestIngredient.amountDenominator}`;
    }
    return [amountStr, unitStr, ingredient.name];
}


// Recipe markdown code block regular expressions
const rRecipeMarkdownInfo = /^\s*(?<key>[Tt]itle|[Cc]ategories|[Aa]uthor)\s*:\s*(?<value>.*?)\s*$/;
const rRecipeMarkdownCategories = /\s*,\s*/;
const alternateUnits = Object.entries(unitInfo).reduce((units, [unit, info]) => {
    if ('alternates' in info) {
        for (const alternate of info.alternates) {
            units[alternate] = unit;
        }
    }
    return units;
}, []);
const rRecipeMarkdownIngredients = new RegExp(
    '^(?:\\s*(?<whole>[1-9][0-9]*))?(?:\\s*(?<numer>[1-9][0-9]*)\\s*/\\s*(?<denom>[1-9][0-9]*))?' +
        `(?:\\s*(?<unit>${Object.keys(unitInfo).join('|')}|${Object.keys(alternateUnits).join('|')}))?` +
        '\\s*(?!/)(?<name>.+?)\\s*$'
);


/**
 * Parse recipe markdown text to a recipe model
 *
 * @param {string|string[]} markdown - Markdown text or text lines
 * @returns {Object} The recipe model
 */
export function parseRecipeMarkdown(markdown) {
    // Parse the markdown
    const markdownModel = parseMarkdown(markdown);

    // Convert the markdown to a recipe model
    const recipe = {'categories': [], 'content': []};
    for (const part of markdownModel.parts) {
        const codeBlockLanguage = 'codeBlock' in part && 'language' in part.codeBlock ? part.codeBlock.language : null;
        if (codeBlockLanguage === 'recipe-info') {
            for (const line of part.codeBlock.lines) {
                const match = line.match(rRecipeMarkdownInfo);
                const key = match !== null && match.groups.key.toLowerCase();
                if (key === 'title') {
                    recipe.title = match.groups.value;
                } else if (key === 'author') {
                    recipe.author = match.groups.value;
                } else {
                    recipe.categories.push(...match.groups.value.split(rRecipeMarkdownCategories));
                }
            }
        } else if (codeBlockLanguage === 'recipe-ingredients') {
            for (const line of part.codeBlock.lines) {
                const match = line.match(rRecipeMarkdownIngredients);
                const whole = match !== null && typeof match.groups.whole !== 'undefined' ? parseInt(match.groups.whole, 10) : 0;
                const numer = match !== null && typeof match.groups.numer !== 'undefined' ? parseInt(match.groups.numer, 10) : 0;
                const denom = match !== null && typeof match.groups.denom !== 'undefined' ? parseInt(match.groups.denom, 10) : 1;
                const unit = match !== null && typeof match.groups.unit !== 'undefined' ? match.groups.unit : null;
                const name = match !== null ? match.groups.name : null;
                if ((whole !== 0 || numer !== 0) && name !== null) {
                    // Add the ingredients part
                    if (recipe.content.length === 0 || !('ingredients' in recipe.content[recipe.content.length - 1])) {
                        recipe.content.push({'ingredients': []});
                    }
                    recipe.content[recipe.content.length - 1].ingredients.push({
                        'amount': whole + numer / denom,
                        'unit': unit !== null ? (unit in alternateUnits ? alternateUnits[unit] : unit) : 'count',
                        'name': name
                    });
                } else {
                    // No ingredient match - add the markdown part
                    if (recipe.content.length === 0 || !('markdown' in recipe.content[recipe.content.length - 1])) {
                        recipe.content.push({'markdown': {'parts': []}});
                    }
                    recipe.content[recipe.content.length - 1].markdown.parts.push({'paragraph': {'spans': [{'text': line}]}});
                }
            }
        } else {
            // Add the markdown part
            if (recipe.content.length === 0 || !('markdown' in recipe.content[recipe.content.length - 1])) {
                recipe.content.push({'markdown': {'parts': []}});
            }
            recipe.content[recipe.content.length - 1].markdown.parts.push(part);
        }
    }

    // Fill-in missing info
    if (!('title' in recipe)) {
        recipe.title = 'Untitled Recipe';
    }
    if (recipe.categories.length === 0) {
        recipe.categories.push('Uncategorized');
    }

    return recipe;
}
