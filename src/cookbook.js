// Licensed under the MIT License
// https://github.com/craigahobbs/cookbook/blob/master/LICENSE

import * as chisel from './chisel.js';
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
                return markdownElements(content.markdown.join('\n'));
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


/**
 * Parse markdown text or text lines into a markdown model
 *
 * @param {string|string[]} markdown - Markdown text or text lines
 */
function parseMarkdown(markdown) {
    const paragraphs = [];

    // Process markdown text line by line
    let paragraph = null;
    const markdownStrings = typeof markdown === 'string' ? [markdown] : markdown;
    for (const markdownString of markdownStrings) {
        for (const line of markdownString.split('\n')) {
            const emptyLine = (/^\s*$/).test(line);
            const matchHeading = emptyLine ? null : (/^\s{0,3}(#{1,6})\s+(.*?)\s*$/).exec(line);

            // Empty line?
            if (emptyLine) {
                paragraph = null;

            // Heading?
            } else if (matchHeading !== null) {
                paragraphs.push({'heading': {'text': matchHeading[2], 'level': matchHeading[1].length}});

            // Text line
            } else {
                // Create new paragraph, if necessary
                if (paragraph === null) {
                    paragraph = {'text': []};
                    paragraphs.push(paragraph);
                }
                paragraph.text.push({'text': line});
            }
        }
    }

    return paragraphs;
}


/**
 * Generate an element model from a markdown string
 *
 * @param {string} [markdown=null] - Markdown text
 * @returns {?Array}
 */
function markdownElements(markdown = null) {
    const elements = [];

    // Parse the markdown
    const paragraphs = typeof markdown === 'string' ? parseMarkdown(markdown) : markdown;
    chisel.validateType(markdownTypes, 'Paragraphs', paragraphs);

    // Transform the markdown model into an element model
    for (const paragraph of paragraphs) {
        // Heading?
        if ('heading' in paragraph) {
            elements.push({'html': `h${paragraph.heading.level}`, 'elem': {'text': paragraph.heading.text}});

        // Text span
        } else if ('text' in paragraph) {
            const pElem = {'html': 'p', 'elem': []};
            elements.push(pElem);
            for (const span of paragraph.text) {
                pElem.elem.push({'text': span.text});
            }
        }
    }

    // If there are no elements return null
    return elements.length ? elements : null;
}


/* eslint-disable-next-line no-unused-vars */
const markdownSpec = `
union Paragraph
    Heading heading
    TextSpan[len > 0, len < 1000] text
    string[len > 0, len < 1000] code
    Paragraphs[len > 0, len < 1000] list
    Paragraphs[len > 0, len < 1000] numbered
    Image image

typedef Paragraph[len > 0, len < 1000] Paragraphs

struct Heading
    string(len > 0, len < 100) text
    int(>= 1, <= 6) level

struct TextSpan
    string(len > 0, len < 1000) text
    optional InlineStyle style
    optional string(len > 0, len < 1000) href

enum InlineStyle
    Bold
    Italic
    Strike

struct Image
    string(len > 0, len < 1000) href
    int(> 0, < 10000) width
    int(> 0, < 10000) height
`;


/* eslint-disable quotes */
/* eslint-disable-next-line no-unused-vars */
const markdownTypes = {
    "Heading": {
        "struct": {
            "members": [
                {
                    "attr": {
                        "lenGT": 0,
                        "lenLT": 100
                    },
                    "name": "text",
                    "type": {
                        "builtin": "string"
                    }
                },
                {
                    "attr": {
                        "gte": 1.0,
                        "lte": 6.0
                    },
                    "name": "level",
                    "type": {
                        "builtin": "int"
                    }
                }
            ],
            "name": "Heading"
        }
    },
    "Image": {
        "struct": {
            "members": [
                {
                    "attr": {
                        "lenGT": 0,
                        "lenLT": 1000
                    },
                    "name": "href",
                    "type": {
                        "builtin": "string"
                    }
                },
                {
                    "attr": {
                        "gt": 0.0,
                        "lt": 10000.0
                    },
                    "name": "width",
                    "type": {
                        "builtin": "int"
                    }
                },
                {
                    "attr": {
                        "gt": 0.0,
                        "lt": 10000.0
                    },
                    "name": "height",
                    "type": {
                        "builtin": "int"
                    }
                }
            ],
            "name": "Image"
        }
    },
    "InlineStyle": {
        "enum": {
            "name": "InlineStyle",
            "values": [
                {
                    "name": "Bold"
                },
                {
                    "name": "Italic"
                },
                {
                    "name": "Strike"
                }
            ]
        }
    },
    "Paragraph": {
        "struct": {
            "members": [
                {
                    "name": "heading",
                    "type": {
                        "user": "Heading"
                    }
                },
                {
                    "attr": {
                        "lenGT": 0,
                        "lenLT": 1000
                    },
                    "name": "text",
                    "type": {
                        "array": {
                            "type": {
                                "user": "TextSpan"
                            }
                        }
                    }
                },
                {
                    "attr": {
                        "lenGT": 0,
                        "lenLT": 1000
                    },
                    "name": "code",
                    "type": {
                        "array": {
                            "type": {
                                "builtin": "string"
                            }
                        }
                    }
                },
                {
                    "attr": {
                        "lenGT": 0,
                        "lenLT": 1000
                    },
                    "name": "list",
                    "type": {
                        "array": {
                            "type": {
                                "user": "Paragraphs"
                            }
                        }
                    }
                },
                {
                    "attr": {
                        "lenGT": 0,
                        "lenLT": 1000
                    },
                    "name": "numbered",
                    "type": {
                        "array": {
                            "type": {
                                "user": "Paragraphs"
                            }
                        }
                    }
                },
                {
                    "name": "image",
                    "type": {
                        "user": "Image"
                    }
                }
            ],
            "name": "Paragraph",
            "union": true
        }
    },
    "Paragraphs": {
        "typedef": {
            "attr": {
                "lenGT": 0,
                "lenLT": 1000
            },
            "name": "Paragraphs",
            "type": {
                "array": {
                    "type": {
                        "user": "Paragraph"
                    }
                }
            }
        }
    },
    "TextSpan": {
        "struct": {
            "members": [
                {
                    "attr": {
                        "lenGT": 0,
                        "lenLT": 1000
                    },
                    "name": "text",
                    "type": {
                        "builtin": "string"
                    }
                },
                {
                    "name": "style",
                    "optional": true,
                    "type": {
                        "user": "InlineStyle"
                    }
                },
                {
                    "attr": {
                        "lenGT": 0,
                        "lenLT": 1000
                    },
                    "name": "href",
                    "optional": true,
                    "type": {
                        "builtin": "string"
                    }
                }
            ],
            "name": "TextSpan"
        }
    }
};
/* eslint-enable quotes */
