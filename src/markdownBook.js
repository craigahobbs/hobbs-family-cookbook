// Licensed under the MIT License
// https://github.com/craigahobbs/hobbs-family-cookbook/blob/master/LICENSE

import * as chisel from './chisel/chisel.js';
import {markdownElements, parseMarkdown} from './chisel/markdown.js';
import {markdownBookTypes} from './markdownBookTypes.js';


/**
 * The markdown book application class.
 *
 * @property {Object} bookURL - The markdown book URL
 * @property {Array} windowHashChangeArgs - The arguments for the window.addEventListener for "hashchange"
 * @property {Object} book - The loaded markdown book model
 * @property {Object} params - The validated hash parameters object
 * @property {Object} config - The validated hash parameters with defaults
 */
export class MarkdownBook {
    /**
     * Create a markdown book application instance.
     */
    constructor(bookURL) {
        this.bookURL = bookURL;
        this.windowHashChangeArgs = null;
        this.book = null;
        this.params = null;
        this.config = null;
    }


    /**
     * Run the application
     *
     * @property {string} bookURL - The book URL
     */
    static run(bookURL) {
        const book = new MarkdownBook(bookURL);
        book.init();
        book.render();
    }


    /**
     * Initialize the global application state
     */
    init() {
        this.windowHashChangeArgs = ['hashchange', () => this.render(), false];
        window.addEventListener(...this.windowHashChangeArgs);
    }


    /**
     * Uninitialize the global application state
     */
    uninit() {
        if (this.windowHashChangeArgs !== null) {
            window.removeEventListener(...this.windowHashChangeArgs);
        }
    }


    /**
     * Helper function to parse and validate the hash parameters
     *
     *
     * @param {?string} params - The (hash) params string
     */
    updateParams(params = null) {
        // Clear params and config
        this.params = null;
        this.config = null;

        // Validate the hash parameters (may throw)
        this.params = chisel.validateType(markdownBookTypes, 'MarkdownBookParams', chisel.decodeParams(params));

        // Set the default hash parameters
        this.config = {
            'categories': [],
            'fontSize': 12,
            'id': null,
            'index': false,
            'scale': 1,
            'search': null,
            'url': null,
            ...this.params
        };
    }


    /**
     * The main entry point for the application. This method renders within the document.body element.
     */
    render() {
        // Validate hash parameters
        try {
            this.updateParams();
        } catch ({message}) {
            chisel.render(document.body, MarkdownBook.errorElements(message));
            return;
        }

        // Set the root font size
        document.documentElement.style.fontSize = `${this.config.fontSize}pt`;

        // Book already loaded?
        if (this.book !== null) {
            this.renderPageElements();
        } else {
            // Clear the page
            chisel.render(document.body);

            // Load the book
            this.load();
        }
    }


    /**
     * Render the page elements and set the document title
     */
    renderPageElements() {
        // Set the page title
        let {title} = this.book;
        if (this.config.id !== null) {
            const file = this.book.files[this.config.id];
            const recipe = 'recipe' in file ? file.recipe : null;
            title = (recipe !== null ? recipe.title : file.title);
        }
        document.title = title;

        // Render the page
        chisel.render(document.body, this.pageElements());
    }


    /**
     * Helper function to load the markdown book
     */
    load() {
        // Fetch the markdown book file
        const bookURL = this.config.url !== null ? this.config.url : this.bookURL;
        window.fetch(bookURL).
            then((bookResponse) => bookResponse.json()).
            then((bookResponse) => {
                // Validate the markdown book model
                const book = chisel.validateType(markdownBookTypes, 'MarkdownBook', bookResponse);

                // Fetch the markdown files
                const categoryFiles = [[null, {'url': 'titleURL' in book ? book.titleURL : null}]];
                categoryFiles.push(...book.categories.reduce(
                    (tuples, category) => {
                        tuples.push(...category.files.map((file) => [category, file]));
                        return tuples;
                    },
                    []
                ));
                const baseURL = chisel.getBaseURL(bookURL);
                const markdownFileURLs = categoryFiles.map(([, {url}]) => (chisel.isAbsoluteURL(url) ? url : `${baseURL}${url}`));
                Promise.all(markdownFileURLs.map((url) => window.fetch(url))).
                    then((responses) => Promise.all(responses.map((response) => response.text()))).
                    then((responses) => {
                        // Create the loaded markdown book model
                        const bookLoaded = {
                            'title': book.title,
                            'titleURL': markdownFileURLs[0],
                            'titleText': responses[0],
                            'titleMarkdown': parseMarkdown(responses[0]),
                            'categories': [],
                            'files': {},
                            'headerColor': 'headerColor' in book ? book.headerColor : 'none',
                            'sidebarColor': 'sidebarColor' in book ? book.sidebarColor : 'none',
                            'contentColor': 'contentColor' in book ? book.contentColor : 'none',
                            'titleColor': 'titleColor' in book ? book.titleColor : 'none'
                        };

                        // Parse each markdown file (skip the title page)
                        let lastCategory = null;
                        for (let ixFile = 1; ixFile < responses.length; ixFile++) {
                            const [category, file] = categoryFiles[ixFile];
                            const matchFileId = markdownFileURLs[ixFile].match(/(?<fileId>\w+)(?:\.\w+)*$/);
                            const {fileId} = matchFileId.groups;
                            const markdown = parseMarkdown(responses[ixFile]);
                            const recipeInfo = parseRecipeInfo(markdown);

                            // Create the loaded file
                            const fileLoaded = {
                                'id': fileId,
                                'title': file.title,
                                'category': category.title,
                                'url': markdownFileURLs[ixFile],
                                'text': responses[ixFile],
                                'markdown': markdown
                            };
                            if (recipeInfo !== null) {
                                fileLoaded.recipe = recipeInfo;
                            }

                            // Add to the category
                            if (lastCategory === null || lastCategory.title !== category.title) {
                                bookLoaded.categories.push({
                                    'title': category.title,
                                    'files': []
                                });
                            }
                            bookLoaded.categories[bookLoaded.categories.length - 1].files.push(fileLoaded);
                            lastCategory = category;

                            // Add the file ID reference
                            bookLoaded.files[fileId] = fileLoaded;
                        }

                        // Validate the loaded markdown book model
                        this.book = chisel.validateType(markdownBookTypes, 'MarkdownBookLoaded', bookLoaded);

                        // Render
                        this.renderPageElements();
                    }).
                    catch(({message}) => {
                        chisel.render(document.body, MarkdownBook.errorElements(message));
                    });
            }).catch(({message}) => {
                chisel.render(document.body, MarkdownBook.errorElements(message));
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
            'attr': {'class': 'error'},
            'elem': {'text': error !== null ? `Error: ${error}` : 'An unexpected error occurred.'}
        };
    }


    /**
     * Helper function to generate the "hamburger" SVG element model
     *
     * @return {Object}
     */
    static hamburgerElements() {
        return {'svg': 'svg', 'attr': {'width': '24', 'height': '24'}, 'elem': [
            {'svg': 'rect', 'attr': {'x': '3', 'y': '3', 'width': '18', 'height': '3'}},
            {'svg': 'rect', 'attr': {'x': '3', 'y': '10', 'width': '18', 'height': '3'}},
            {'svg': 'rect', 'attr': {'x': '3', 'y': '17', 'width': '18', 'height': '3'}}
        ]};
    }


    /**
     * Helper function to generate the "minus" SVG element model
     *
     * @return {Object}
     */
    static minusElements() {
        return {'svg': 'svg', 'attr': {'width': '24', 'height': '24'}, 'elem': [
            {'svg': 'rect', 'attr': {'x': '3', 'y': '11', 'width': '19', 'height': '3'}}
        ]};
    }


    /**
     * Helper function to generate the "plus" SVG element model
     *
     * @return {Object}
     */
    static plusElements() {
        return {'svg': 'svg', 'attr': {'width': '24', 'height': '24'}, 'elem': [
            {'svg': 'rect', 'attr': {'x': '3', 'y': '11', 'width': '19', 'height': '3'}},
            {'svg': 'rect', 'attr': {'x': '11', 'y': '3', 'width': '3', 'height': '19'}}
        ]};
    }


    /**
     * Generate the markdown book's page elements for use with the chisel.render function
     *
     * @returns {object[]}
     */
    pageElements() {
        const fontSizeAttr = markdownBookTypes.MarkdownBookParams.struct.members.find((member) => member.name === 'fontSize').attr;
        return {
            'html': 'div',
            'attr': {'class': 'main'},
            'elem': [
                // Header
                {
                    'html': 'div',
                    'attr': {'class': 'header', 'style': `background: ${this.book.headerColor}`},
                    'elem': [
                        {
                            'html': 'div',
                            'elem': [
                                {
                                    'html': 'a',
                                    'attr': {'href': chisel.href({...this.params, 'index': this.config.index ? null : 'true'})},
                                    'elem': MarkdownBook.hamburgerElements()
                                },
                                {
                                    'html': 'a',
                                    'attr': {'href': chisel.href({...this.params, 'id': null, 'index': null, 'scale': null})},
                                    'elem': {'text': this.book.title}
                                }
                            ]
                        },
                        {
                            'html': 'div',
                            'elem': [
                                {
                                    'html': 'a',
                                    'attr': {
                                        'href': chisel.href({
                                            ...this.params,
                                            'fontSize': `${Math.max(fontSizeAttr.gte, this.config.fontSize - 1)}`
                                        })
                                    },
                                    'elem': MarkdownBook.minusElements()
                                },
                                {
                                    'html': 'a',
                                    'attr': {
                                        'href': chisel.href({
                                            ...this.params,
                                            'fontSize': `${Math.min(fontSizeAttr.lte, this.config.fontSize + 1)}`
                                        })
                                    },
                                    'elem': MarkdownBook.plusElements()
                                }
                            ]
                        }
                    ]
                },

                // Sidebar
                {
                    'html': 'div',
                    'attr': {'class': `sidebar${this.config.index ? ' sidebar-index' : ''}`},
                    'elem': [
                        // Index
                        {
                            'html': 'div',
                            'attr': {'style': `background: ${this.book.sidebarColor}`},
                            'elem': this.indexElements()
                        },

                        // Search?
                        (this.config.search !== null
                            ? ({
                                'html': 'div',
                                'attr': {'style': `background: ${this.book.contentColor}`},
                                'elem': this.searchElements()
                            })

                            // Index?
                            : (this.config.index
                                ? null

                                // Markdown file?
                                : (this.config.id !== null
                                    ? {
                                        'html': 'div',
                                        'attr': {'style': `background: ${this.book.contentColor}`},
                                        'elem': this.markdownElements()
                                    }

                                    // Title page?
                                    : ('titleMarkdown' in this.book
                                        ? {
                                            'html': 'div',
                                            'attr': {
                                                'class': 'sidebar-title',
                                                'style': `background: ${this.book.titleColor}`
                                            },
                                            'elem': markdownElements(this.book.titleMarkdown, this.book.titleURL)
                                        }
                                        : null
                                    )
                                )
                            )
                        )
                    ]
                }
            ]
        };
    }


    /**
     * Helper function to generate the index page's element model
     *
     * @returns {Object}
     */
    indexElements() {
        return {
            'html': 'div',
            'elem': this.book.categories.map(
                ({title, files}) => {
                    // Compute the category's href
                    let categories = [...this.config.categories];
                    const ixCategory = categories.indexOf(title);
                    if (ixCategory !== -1) {
                        categories = categories.filter((category) => category !== title);
                    } else {
                        categories.push(title);
                    }
                    const categoryHref = chisel.href({...this.params, 'categories': categories.length ? categories.sort() : null});

                    return {
                        'html': 'div',
                        'elem': [
                            {'html': 'a', 'attr': {'href': categoryHref}, 'elem': {'text': title}},
                            this.book.categories.length !== 1 && this.config.categories.indexOf(title) === -1 ? null : {
                                'html': 'div',
                                'elem': files.map((file) => [file.title, file.id, file]).sort().map(([,, file]) => {
                                    const fileHref = chisel.href({...this.params, 'id': file.id, 'index': null, 'scale': null});
                                    return {'html': 'div', 'elem': {'html': 'a', 'attr': {'href': fileHref}, 'elem': {'text': file.title}}};
                                })
                            }
                        ]
                    };
                }
            )
        };
    }


    /**
     * Helper function to generate the markdown file's element model
     *
     * @returns {object[]}
     */
    markdownElements() {
        // Unknown markdown file ID?
        if (!(this.config.id in this.book.files)) {
            return MarkdownBook.errorElements(`Unknown markdown file '${this.config.id}'`);
        }

        // Get the markdown info
        const file = this.book.files[this.config.id];
        const recipe = 'recipe' in file ? file.recipe : null;
        const title = recipe !== null ? recipe.title : file.title;
        const scaleAttr = markdownBookTypes.MarkdownBookParams.struct.members.find((member) => member.name === 'scale').attr;

        return [
            // Menu bar
            {
                'html': 'p',
                'elem': [
                    {'html': 'a', 'attr': {'href': file.url}, 'elem': {'text': 'Markdown'}},
                    {'text': ' | '},
                    {'html': 'a', 'elem': {'text': 'Email Markdown'}, 'attr': {
                        'href': `mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(file.text)}`
                    }}
                ]
            },

            // Recipe?
            recipe === null ? null : [
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
                !('servings' in recipe) ? null
                    : {'html': 'p', 'elem': {'text': `Servings: ${recipe.servings * this.config.scale}`}}
            ],

            // Markdown
            markdownElements(file.markdown, file.url, {
                'recipe-info': () => null,
                'recipe-ingredients': (codeBlock) => {
                    const ingredients = [];
                    parseRecipeIngredientCodeBlock(ingredients, codeBlock);
                    return {
                        'html': 'p',
                        'attr': {'class': 'recipe-ingredients'},
                        'elem': ingredients.map((ingredient) => ({
                            'html': 'div',
                            'elem': ingredientText(ingredient, this.config.scale).
                                filter((text) => text.length).
                                map((text) => ({'html': 'div', 'elem': {'text': text}}))
                        }))
                    };
                }
            })
        ];
    }


    /**
     * Helper function to generate the search element model
     *
     * @returns {object[]}
     */
    searchElements() {
        return [
            {'html': 'h2', 'elem': {'text': 'Search Results'}},
            this.searchResultsElements(this.config.search)
        ];
    }


    /**
     * Helper function to generate the search results element model
     *
     * @param {string} search - The search string
     * @returns {object[]}
     */
    searchResultsElements(search) {
        const files = searchBook(this.book, search);
        if (files.length === 0) {
            return {'html': 'p', 'elem': {'text': 'No search results'}};
        }
        return files.map((file) => ({'html': 'p', 'elem': {
            'html': 'a',
            'attr': {'href': chisel.href({...this.params, 'search': null, 'categories': [file.category], 'id': file.id})},
            'elem': {'text': file.title}
        }}));
    }
}


/**
 * Helper function to search for a phrase in a loaded markdown book model
 *
 * @param {Object} book - The loaded markdown book model
 * @param {string} search - The search phrase
 * @returns{?Object[]} The array of matching loaded markdown files
 */
function searchBook(book, search) {
    // Get the search words that aren't too small
    const words = search.replace(rSearchWordClean, '').split(rSearchWordSplit).filter((word) => word.length >= minSearchWordLength);
    if (words.length === 0) {
        return [];
    }

    // Count the word matches
    const rWords = new RegExp(`\\b(?:${words.join('|')})`, 'ig');
    return Object.values(book.files).map((file) => [Array.from(file.text.matchAll(rWords)).length, file]).
        filter(([score]) => score > 0).
        sort(([scoreA, fileA], [scoreB, fileB]) => (
            (scoreB - scoreA) ||
                (fileA.title < fileB.title ? -1 : fileA.title > fileB.title) ||
                (fileA.id < fileB.id ? -1 : fileA.id > fileB.id)
        )).
        map(([, file]) => file).
        slice(0, maxSearchResults);
}


// Book search constants
const minSearchWordLength = 3;
const maxSearchResults = 20;
const rSearchWordClean = /[^A-Za-z\s]+/;
const rSearchWordSplit = /\s+/;


// Ingredient unit info map
const unitInfo = {
    'count': {
        'baseUnit': 'count',
        'display': '',
        'baseRatio': 1,
        'fractions': [2, 4, 8]
    },
    'cup': {
        'alternates': ['C', 'Cup', 'Cups', 'c', 'cups'],
        'display': 'C',
        'baseUnit': 'tsp',
        'baseRatio': 48,
        'fractions': [2, 3, 4]
    },
    'lb': {
        'alternates': ['Lb', 'Lbs', 'Pound', 'Pounds', 'lbs', 'pound', 'pounds'],
        'baseUnit': 'oz',
        'baseRatio': 16,
        'fractions': [2, 4]
    },
    'oz': {
        'alternates': ['Oz', 'Ounce', 'Ounces', 'ounce', 'ounces'],
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
        'alternates': ['T', 'Tbsp', 'Tablespoon', 'Tablespoons', 'tablespoon', 'tablespoons'],
        'baseUnit': 'tsp',
        'baseRatio': 3,
        'fractions': [1]
    },
    'tsp': {
        'alternates': ['Tsp', 'Teaspoon', 'Teaspoons', 'teaspoon', 'teaspoons'],
        'baseUnit': 'tsp',
        'baseRatio': 1,
        'fractions': [2, 4, 8]
    }
};

// Alternate ingredient unit map
const alternateUnits = Object.entries(unitInfo).reduce((units, [unit, info]) => {
    if ('alternates' in info) {
        for (const alternate of info.alternates) {
            units[alternate] = unit;
        }
    }
    return units;
}, []);

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
            for (const denominator of unitInfo[unit].fractions) {
                for (let numerator = 0; numerator <= denominator; numerator += 1) {
                    // Is the fraction close enough?
                    const diff = Math.abs((amountInteger + numerator / denominator) - amountUnit);
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
const rRecipeMarkdownInfo = /^\s*(?<key>[Tt]itle|[Aa]uthor|[Ss]ervings)\s*:\s*(?<value>.*?)\s*$/;
const rRecipeMarkdownBlank = /^\s*$/;
const rRecipeMarkdownIngredients = new RegExp(
    '^(?:\\s*(?<whole>[1-9][0-9]*(?:\\.[0-9]*)?))?(?:\\s*(?<numer>[1-9][0-9]*)\\s*/\\s*(?<denom>[1-9][0-9]*))?' +
        `(?:\\s*(?<unit>${Object.keys(unitInfo).join('|')}|${Object.keys(alternateUnits).join('|')}))?` +
        '\\s+(?!/)(?<name>.+?)\\s*$'

);


/**
 * Parse the recipe info of a markdown model
 *
 * @param {Object} markdown - The markdown model
 * @returns {Object} The recipe info model
 */
export function parseRecipeInfo(markdown) {
    const recipeInfo = {'title': 'Untitled Recipe', 'ingredients': []};
    markdownElements(markdown, null, {
        'recipe-info': (codeBlock) => parseRecipeInfoCodeBlock(recipeInfo, codeBlock),
        'recipe-ingredients': (codeBlock) => parseRecipeIngredientCodeBlock(recipeInfo.ingredients, codeBlock)
    });

    // Validate the recipe info model, if any
    if ('author' in recipeInfo || 'servings' in recipeInfo || recipeInfo.ingredients.length !== 0) {
        return chisel.validateType(markdownBookTypes, 'RecipeInfo', recipeInfo);
    }

    return null;
}


/**
 * Helper function to parse a recipe ingredient code block
 *
 * @param {Object} recipeInfo - The recipe info model
 * @param {Object} codeBlock - The "recipe-ingredient" code block
 */
function parseRecipeInfoCodeBlock(recipeInfo, codeBlock) {
    for (const line of codeBlock.lines) {
        const match = line.match(rRecipeMarkdownInfo);
        const key = match !== null ? match.groups.key.toLowerCase() : null;
        const value = match !== null ? match.groups.value : null;
        if (key === 'title') {
            recipeInfo.title = value;
        } else if (key === 'author') {
            recipeInfo.author = value;
        } else if (key === 'servings') {
            const servingsNumber = parseFloat(value);
            if (!isNaN(servingsNumber)) {
                recipeInfo.servings = servingsNumber;
            }
        }
    }

    return null;
}


/**
 * Helper function to parse a recipe ingredient code block
 *
 * @param {Object[]} ingredients - The ingredients array
 * @param {Object} codeBlock - The "recipe-ingredient" code block
 */
function parseRecipeIngredientCodeBlock(ingredients, codeBlock) {
    for (const line of codeBlock.lines) {
        // Ignore blank lines
        if (rRecipeMarkdownBlank.test(line)) {
            continue;
        }

        // Match the ingredient line
        const match = line.match(rRecipeMarkdownIngredients);
        const whole = match !== null && typeof match.groups.whole !== 'undefined' ? parseFloat(match.groups.whole, 10) : 0;
        const numer = match !== null && typeof match.groups.numer !== 'undefined' ? parseInt(match.groups.numer, 10) : 0;
        const denom = match !== null && typeof match.groups.denom !== 'undefined' ? parseInt(match.groups.denom, 10) : 1;
        const unit = match !== null && typeof match.groups.unit !== 'undefined' ? match.groups.unit : null;
        const name = match !== null ? match.groups.name : null;
        if ((whole !== 0 || numer !== 0) && name !== null) {
            ingredients.push({
                'amount': whole + numer / denom,
                'unit': unit !== null ? (unit in alternateUnits ? alternateUnits[unit] : unit) : 'count',
                'name': name
            });
        }
    }

    return null;
}
