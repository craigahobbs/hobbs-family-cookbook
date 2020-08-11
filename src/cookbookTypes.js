/* eslint-disable quotes */
export const cookbookTypes =
{
    "CharacterStyle": {
        "enum": {
            "doc": [
                "Character style enum"
            ],
            "name": "CharacterStyle",
            "values": [
                {
                    "name": "bold"
                },
                {
                    "name": "italic"
                }
            ]
        }
    },
    "CodeBlock": {
        "struct": {
            "doc": [
                "Code block markdown part struct"
            ],
            "members": [
                {
                    "attr": {
                        "lenGT": 0,
                        "lenLT": 100
                    },
                    "doc": [
                        "The code block's language"
                    ],
                    "name": "language",
                    "optional": true,
                    "type": {
                        "builtin": "string"
                    }
                },
                {
                    "attr": {
                        "lenLT": 1000
                    },
                    "doc": [
                        "The code block's text lines"
                    ],
                    "name": "lines",
                    "type": {
                        "array": {
                            "type": {
                                "builtin": "string"
                            }
                        }
                    }
                }
            ],
            "name": "CodeBlock"
        }
    },
    "Content": {
        "struct": {
            "doc": [
                "Recipe content union"
            ],
            "members": [
                {
                    "doc": [
                        " A list of markdown lines"
                    ],
                    "name": "markdown",
                    "type": {
                        "user": "Markdown"
                    }
                },
                {
                    "attr": {
                        "lenGT": 0,
                        "lenLT": 100
                    },
                    "doc": [
                        "An ingredient list"
                    ],
                    "name": "ingredients",
                    "type": {
                        "array": {
                            "type": {
                                "user": "Ingredient"
                            }
                        }
                    }
                }
            ],
            "name": "Content",
            "union": true
        }
    },
    "Cookbook": {
        "struct": {
            "doc": [
                "Cookbook struct"
            ],
            "members": [
                {
                    "attr": {
                        "lenGT": 0,
                        "lenLT": 100
                    },
                    "doc": [
                        "The cookbook title text"
                    ],
                    "name": "title",
                    "type": {
                        "builtin": "string"
                    }
                },
                {
                    "attr": {
                        "lenGT": 0,
                        "lenLT": 1000
                    },
                    "doc": [
                        "The cookbook's recipe model URLs"
                    ],
                    "name": "recipeURLs",
                    "type": {
                        "array": {
                            "attr": {
                                "lenGT": 0,
                                "lenLT": 1000
                            },
                            "type": {
                                "builtin": "string"
                            }
                        }
                    }
                }
            ],
            "name": "Cookbook"
        }
    },
    "ImageSpan": {
        "struct": {
            "doc": [
                "Image span struct"
            ],
            "members": [
                {
                    "attr": {
                        "lenGT": 0,
                        "lenLT": 1000
                    },
                    "doc": [
                        "The image URL"
                    ],
                    "name": "src",
                    "type": {
                        "builtin": "string"
                    }
                },
                {
                    "attr": {
                        "lenGT": 0,
                        "lenLT": 1000
                    },
                    "doc": [
                        "The image's alternate text"
                    ],
                    "name": "alt",
                    "type": {
                        "builtin": "string"
                    }
                },
                {
                    "attr": {
                        "lenGT": 0,
                        "lenLT": 1000
                    },
                    "doc": [
                        "The image's title"
                    ],
                    "name": "title",
                    "optional": true,
                    "type": {
                        "builtin": "string"
                    }
                }
            ],
            "name": "ImageSpan"
        }
    },
    "Ingredient": {
        "struct": {
            "doc": [
                "Recipe ingredient struct"
            ],
            "members": [
                {
                    "attr": {
                        "lenGT": 0,
                        "lenLT": 100
                    },
                    "doc": [
                        "The ingredient name"
                    ],
                    "name": "name",
                    "type": {
                        "builtin": "string"
                    }
                },
                {
                    "doc": [
                        "The ingredient unit"
                    ],
                    "name": "unit",
                    "type": {
                        "user": "Unit"
                    }
                },
                {
                    "attr": {
                        "gt": 0.0
                    },
                    "doc": [
                        "The ingredient amount"
                    ],
                    "name": "amount",
                    "type": {
                        "builtin": "float"
                    }
                }
            ],
            "name": "Ingredient"
        }
    },
    "LinkSpan": {
        "struct": {
            "doc": [
                "Link span struct"
            ],
            "members": [
                {
                    "attr": {
                        "lenGT": 0,
                        "lenLT": 1000
                    },
                    "doc": [
                        "The link's URL"
                    ],
                    "name": "href",
                    "type": {
                        "builtin": "string"
                    }
                },
                {
                    "attr": {
                        "lenGT": 0,
                        "lenLT": 1000
                    },
                    "doc": [
                        "The image's title"
                    ],
                    "name": "title",
                    "optional": true,
                    "type": {
                        "builtin": "string"
                    }
                },
                {
                    "attr": {
                        "lenGT": 0,
                        "lenLT": 1000
                    },
                    "doc": [
                        "The contained spans"
                    ],
                    "name": "spans",
                    "type": {
                        "array": {
                            "type": {
                                "user": "Span"
                            }
                        }
                    }
                }
            ],
            "name": "LinkSpan"
        }
    },
    "List": {
        "struct": {
            "doc": [
                "List markdown part struct"
            ],
            "members": [
                {
                    "attr": {
                        "gte": 0.0
                    },
                    "doc": [
                        "The list is numbered and this is starting number"
                    ],
                    "name": "start",
                    "optional": true,
                    "type": {
                        "builtin": "int"
                    }
                },
                {
                    "attr": {
                        "lenGT": 0,
                        "lenLT": 1000
                    },
                    "doc": [
                        "The list's items"
                    ],
                    "name": "items",
                    "type": {
                        "array": {
                            "type": {
                                "user": "ListItem"
                            }
                        }
                    }
                }
            ],
            "name": "List"
        }
    },
    "ListItem": {
        "struct": {
            "doc": [
                "List item struct"
            ],
            "members": [
                {
                    "attr": {
                        "lenGT": 0,
                        "lenLT": 1000
                    },
                    "doc": [
                        "The markdown document's parts"
                    ],
                    "name": "parts",
                    "type": {
                        "array": {
                            "type": {
                                "user": "MarkdownPart"
                            }
                        }
                    }
                }
            ],
            "name": "ListItem"
        }
    },
    "Markdown": {
        "struct": {
            "doc": [
                "Markdown document struct"
            ],
            "members": [
                {
                    "attr": {
                        "lenLT": 1000
                    },
                    "doc": [
                        "The markdown document's parts"
                    ],
                    "name": "parts",
                    "type": {
                        "array": {
                            "type": {
                                "user": "MarkdownPart"
                            }
                        }
                    }
                }
            ],
            "name": "Markdown"
        }
    },
    "MarkdownPart": {
        "struct": {
            "doc": [
                "Markdown document part struct"
            ],
            "members": [
                {
                    "doc": [
                        "A paragraph"
                    ],
                    "name": "paragraph",
                    "type": {
                        "user": "Paragraph"
                    }
                },
                {
                    "attr": {
                        "nullable": true
                    },
                    "doc": [
                        "A horizontal rule (value is ignored)"
                    ],
                    "name": "hr",
                    "type": {
                        "builtin": "object"
                    }
                },
                {
                    "doc": [
                        "A list"
                    ],
                    "name": "list",
                    "type": {
                        "user": "List"
                    }
                },
                {
                    "doc": [
                        "A code block"
                    ],
                    "name": "codeBlock",
                    "type": {
                        "user": "CodeBlock"
                    }
                }
            ],
            "name": "MarkdownPart",
            "union": true
        }
    },
    "Paragraph": {
        "struct": {
            "doc": [
                "Paragraph markdown part struct"
            ],
            "members": [
                {
                    "doc": [
                        "The paragraph style"
                    ],
                    "name": "style",
                    "optional": true,
                    "type": {
                        "user": "ParagraphStyle"
                    }
                },
                {
                    "attr": {
                        "lenGT": 0,
                        "lenLT": 1000
                    },
                    "doc": [
                        "The paragraph span array"
                    ],
                    "name": "spans",
                    "type": {
                        "array": {
                            "type": {
                                "user": "Span"
                            }
                        }
                    }
                }
            ],
            "name": "Paragraph"
        }
    },
    "ParagraphStyle": {
        "enum": {
            "doc": [
                "Paragraph style enum"
            ],
            "name": "ParagraphStyle",
            "values": [
                {
                    "name": "h1"
                },
                {
                    "name": "h2"
                },
                {
                    "name": "h3"
                },
                {
                    "name": "h4"
                },
                {
                    "name": "h5"
                },
                {
                    "name": "h6"
                }
            ]
        }
    },
    "Recipe": {
        "struct": {
            "doc": [
                "Recipe struct"
            ],
            "members": [
                {
                    "attr": {
                        "lenGT": 0,
                        "lenLT": 100
                    },
                    "doc": [
                        "The recipe title text"
                    ],
                    "name": "title",
                    "type": {
                        "builtin": "string"
                    }
                },
                {
                    "attr": {
                        "lenGT": 0
                    },
                    "doc": [
                        "The recipe's categories"
                    ],
                    "name": "categories",
                    "type": {
                        "array": {
                            "attr": {
                                "lenGT": 0,
                                "lenLT": 100
                            },
                            "type": {
                                "builtin": "string"
                            }
                        }
                    }
                },
                {
                    "attr": {
                        "lenGT": 0,
                        "lenLT": 100
                    },
                    "doc": [
                        "The recipe's author"
                    ],
                    "name": "author",
                    "optional": true,
                    "type": {
                        "builtin": "string"
                    }
                },
                {
                    "doc": [
                        "The serving size and count"
                    ],
                    "name": "servings",
                    "optional": true,
                    "type": {
                        "user": "Servings"
                    }
                },
                {
                    "attr": {
                        "lenGT": 0,
                        "lenLT": 100
                    },
                    "doc": [
                        "The recipe content"
                    ],
                    "name": "content",
                    "type": {
                        "array": {
                            "type": {
                                "user": "Content"
                            }
                        }
                    }
                }
            ],
            "name": "Recipe"
        }
    },
    "Recipes": {
        "typedef": {
            "attr": {
                "lenGT": 0,
                "lenLT": 1000
            },
            "doc": [
                "Recipe list typedef"
            ],
            "name": "Recipes",
            "type": {
                "array": {
                    "type": {
                        "user": "Recipe"
                    }
                }
            }
        }
    },
    "Servings": {
        "struct": {
            "doc": [
                "Recipe serving size and count struct"
            ],
            "members": [
                {
                    "attr": {
                        "gt": 0.0
                    },
                    "doc": [
                        "The number of servings"
                    ],
                    "name": "count",
                    "type": {
                        "builtin": "int"
                    }
                },
                {
                    "doc": [
                        "The serving size"
                    ],
                    "name": "size",
                    "type": {
                        "user": "Ingredient"
                    }
                }
            ],
            "name": "Servings"
        }
    },
    "Span": {
        "struct": {
            "doc": [
                "Paragraph span struct"
            ],
            "members": [
                {
                    "attr": {
                        "lenGT": 0,
                        "lenLT": 1000
                    },
                    "doc": [
                        "Text span"
                    ],
                    "name": "text",
                    "type": {
                        "builtin": "string"
                    }
                },
                {
                    "attr": {
                        "nullable": true
                    },
                    "doc": [
                        "Line break (value is ignored)"
                    ],
                    "name": "br",
                    "type": {
                        "builtin": "object"
                    }
                },
                {
                    "doc": [
                        "Style span"
                    ],
                    "name": "style",
                    "type": {
                        "user": "StyleSpan"
                    }
                },
                {
                    "doc": [
                        "Link span"
                    ],
                    "name": "link",
                    "type": {
                        "user": "LinkSpan"
                    }
                },
                {
                    "doc": [
                        "Image span"
                    ],
                    "name": "image",
                    "type": {
                        "user": "ImageSpan"
                    }
                }
            ],
            "name": "Span",
            "union": true
        }
    },
    "StyleSpan": {
        "struct": {
            "doc": [
                "Style span struct"
            ],
            "members": [
                {
                    "doc": [
                        "The span's character style"
                    ],
                    "name": "style",
                    "type": {
                        "user": "CharacterStyle"
                    }
                },
                {
                    "attr": {
                        "lenGT": 0,
                        "lenLT": 1000
                    },
                    "doc": [
                        "The contained spans"
                    ],
                    "name": "spans",
                    "type": {
                        "array": {
                            "type": {
                                "user": "Span"
                            }
                        }
                    }
                }
            ],
            "name": "StyleSpan"
        }
    },
    "Unit": {
        "enum": {
            "doc": [
                "Recipe ingredient unit enum"
            ],
            "name": "Unit",
            "values": [
                {
                    "name": "count"
                },
                {
                    "name": "cup"
                },
                {
                    "name": "lb"
                },
                {
                    "name": "oz"
                },
                {
                    "name": "pinch"
                },
                {
                    "name": "tbsp"
                },
                {
                    "name": "tsp"
                }
            ]
        }
    }
};
