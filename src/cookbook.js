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
     * Parse the window location's hash parameters. This method sets two class members:
     * this.params and this.config.  this.params is the decoded hash parameters object for
     * use with creating links to the application.  this.config is object containing all known hash
     * parameters parsed and validated.
     */
    updateParams() {
        this.params = null;
        this.params = chisel.validateType(cookbookPageTypes, 'CookbookPageParams', chisel.decodeParams());
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
        if ('title' in this.params) {
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
        const recipe = cookbook.recipes.find((recipeFind) => recipeFind.title === this.params.title);
        if (recipe === undefined) {
            return CookbookPage.errorElements(`Unknown recipe '${this.params.title}`);
        }

        return [
            // Navigation bar
            {
                'html': 'p',
                'elem': {
                    'html': 'a',
                    'attr': {'href': chisel.href({...this.params, 'title': null})},
                    'elem': {'text': 'Back to the index'}
                }
            },

            // Title
            {'html': 'h1', 'elem': {'text': recipe.title}},

            // Serving size and count
            'servings' in recipe
                ? {'html': 'p', 'elem': [
                    {'text': `Servings: ${recipe.servings.count}`},
                    {'html': 'br'},
                    {'text': 'Serving size: '},
                    CookbookPage.ingredientElements(recipe.servings.size)
                ]}
                : null,

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
                                    (ingredient) => ({'html': 'li', 'elem': CookbookPage.ingredientElements(ingredient)})
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

    /**
     * Helper function to generate an inredient's elements
     *
     * @param {Object} ingredient - The ingredient model
     * @returns {Object}
     */
    static ingredientElements(ingredient) {
        if (ingredient.unit === 'count') {
            return {'text': `${ingredient.amount} ${ingredient.name}`};
        }
        return {'text': `${ingredient.amount} ${ingredient.unit} ${ingredient.name}`};
    }
}
