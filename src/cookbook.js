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
 * @property {Object} params - The validated hash parameters object
 */
export class CookbookPage {
    /**
     * Create a cookbook application instance.
     */
    constructor(cookbookUrl) {
        this.cookbookUrl = cookbookUrl;
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
            this.updateParams();
        } catch ({message}) {
            chisel.render(document.body, CookbookPage.errorElements(message));
            return;
        }

        // Fetch the JSON cookbook model and render
        window.fetch(this.cookbookUrl).
            then((response) => response.json()).
            then((response) => {
                chisel.render(document.body, this.pageElements(response));
            }).catch(({message}) => {
                chisel.render(document.body, CookbookPage.errorElements(message));
            });
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
     * @param {Object} cookbook - The cookbook model
     * @returns {Array}
     */
    pageElements(cookbook) {
        // Validate the cookbook model
        try {
            chisel.validateType(cookbookTypes, 'Cookbook', cookbook);
        } catch (error) {
            return CookbookPage.errorElements(error.message);
        }

        // Recipe page?
        if ('title' in this.config) {
            return this.recipeElements(cookbook);
        }

        // Index page
        return this.indexElements(cookbook);
    }


    /**
     * Helper function to generate the index page's element model
     *
     * @param {Object} cookbook - The cookbook model
     * @returns {Array}
     */
    indexElements(cookbook) {
        const sortedRecipes = cookbook.recipes.map((recipe) => [recipe.title, recipe]).sort().map(([, recipe]) => recipe);
        return [
            // Title
            {'html': 'h1', 'elem': {'text': cookbook.title}},

            // Sorted recipe links
            {
                'html': 'ul',
                'attr': {'class': 'cookbook-index-list'},
                'elem': sortedRecipes.map((recipe) => ({
                    'html': 'li',
                    'elem': {
                        'html': 'a',
                        'attr': {'href': chisel.href({...this.params, 'title': recipe.title})},
                        'elem': {'text': recipe.title}
                    }
                }))
            }
        ];
    }


    /**
     * Helper function to generate the recipe page's element model
     *
     * @param {Object} cookbook - The cookbook model
     * @returns {Array}
     */
    recipeElements(cookbook) {
        // Find the recipe
        const recipe = cookbook.recipes.find((recipeFind) => recipeFind.title === this.config.title);
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

            // Scale
            {'html': 'p', 'elem': [
                {'text': 'Scale:'},
                this.config.scale !== 1 ? {'text': ` ${this.config.scale}`} : null,
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
                {'text': ingredientText(recipe.servings.size)}
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
                                    (ingredient) => ({'html': 'li', 'elem': {'text': ingredientText(ingredient, this.config.scale)}})
                                )
                            }
                        ]
                    };
                }

                // Markdown
                return markdownElements(parseMarkdown(content.markdown.join('\n')));
            })
        ];
    }
}


// Ingredient bases
const unitInfo = {
    'count': {
        'baseUnit': 'count',
        'baseRatio': 1,
        'fractions': [2, 4]
    },
    'cup': {
        'baseUnit': 'tsp',
        'baseRatio': 48,
        'fractions': [2, 3, 4]
    },
    'lb': {
        'baseUnit': 'oz',
        'baseRatio': 16,
        'fractions': [2, 4]
    },
    'oz': {
        'baseUnit': 'oz',
        'baseRatio': 1,
        'fractions': [2, 4]
    },
    'pinch': {
        'baseUnit': 'pinch',
        'baseRatio': 1,
        'fractions': [2, 4]
    },
    'tbsp': {
        'baseUnit': 'tsp',
        'baseRatio': 3,
        'fractions': [3]
    },
    'tsp': {
        'baseUnit': 'tsp',
        'baseRatio': 1,
        'fractions': [2, 4, 8]
    }
};


// Ingredient unit fuzz ratio
const unitFuzz = 0.1;


export function ingredientText(ingredient, scale = 1) {
    // Compute the best unit to display the ingredient
    const amountBase = ingredient.amount * scale * unitInfo[ingredient.unit].baseRatio;
    let bestIngredient = {
        'amount': ingredient.amount * scale,
        'unit': ingredient.unit
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
                    if (diff / amountUnit <= unitFuzz && (!('diff' in bestIngredient) || diff < bestIngredient.diff)) {
                        bestIngredient = {
                            'unit': unit,
                            'amount': numerator === denominator ? amountInteger + 1 : amountInteger,
                            'amountNumerator': numerator === denominator ? 0 : numerator,
                            'amountDenominator': denominator,
                            'diff': diff
                        };
                    }
                }
            }
        }
    }

    // Create the ingredient elements
    if (bestIngredient.unit === 'count') {
        return `${bestIngredient.amount} ${ingredient.name}`;
    } else if (!('amountNumerator' in bestIngredient) || bestIngredient.amountNumerator === 0) {
        return `${bestIngredient.amount} ${bestIngredient.unit} ${ingredient.name}`;
    } else if (bestIngredient.amount === 0) {
        return `${bestIngredient.amountNumerator}/${bestIngredient.amountDenominator} ${bestIngredient.unit} ${ingredient.name}`;
    }
    return `${bestIngredient.amount} ${bestIngredient.amountNumerator}/${bestIngredient.amountDenominator} ` +
        `${bestIngredient.unit} ${ingredient.name}`;
}
