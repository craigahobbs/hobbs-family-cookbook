/* eslint-disable quotes */
export const cookbookTypes =
{
    "Cookbook": {
        "struct": {
            "doc": [
                "Cookbook struct"
            ],
            "members": [
                {
                    "doc": [
                        "The cookbook title text"
                    ],
                    "name": "title",
                    "type": {
                        "user": "CookbookString"
                    }
                },
                {
                    "doc": [
                        "The cookbook's title recipe ID"
                    ],
                    "name": "titleId",
                    "optional": true,
                    "type": {
                        "user": "CookbookString"
                    }
                },
                {
                    "attr": {
                        "lenGT": 0,
                        "lenLT": 1000
                    },
                    "doc": [
                        "The cookbook's content categories"
                    ],
                    "name": "contentCategories",
                    "optional": true,
                    "type": {
                        "array": {
                            "type": {
                                "user": "CookbookString"
                            }
                        }
                    }
                },
                {
                    "attr": {
                        "lenGT": 0,
                        "lenLT": 1000
                    },
                    "doc": [
                        "The cookbook's recipe markdown URLs"
                    ],
                    "name": "recipeURLs",
                    "type": {
                        "array": {
                            "type": {
                                "user": "CookbookString"
                            }
                        }
                    }
                }
            ],
            "name": "Cookbook"
        }
    },
    "CookbookLoaded": {
        "struct": {
            "doc": [
                "A loaded cookbook struct"
            ],
            "members": [
                {
                    "doc": [
                        "The cookbook model"
                    ],
                    "name": "cookbook",
                    "type": {
                        "user": "Cookbook"
                    }
                },
                {
                    "attr": {
                        "lenGT": 0,
                        "lenLT": 1000
                    },
                    "doc": [
                        "The map of recipe ID to loaded recipe model"
                    ],
                    "name": "recipes",
                    "type": {
                        "dict": {
                            "keyType": {
                                "user": "CookbookString"
                            },
                            "type": {
                                "user": "RecipeLoaded"
                            }
                        }
                    }
                }
            ],
            "name": "CookbookLoaded"
        }
    },
    "CookbookString": {
        "typedef": {
            "attr": {
                "lenGT": 0,
                "lenLT": 1000
            },
            "doc": [
                "Cookbook string typedef"
            ],
            "name": "CookbookString",
            "type": {
                "builtin": "string"
            }
        }
    },
    "Ingredient": {
        "struct": {
            "doc": [
                "Recipe ingredient struct"
            ],
            "members": [
                {
                    "doc": [
                        "The ingredient name"
                    ],
                    "name": "name",
                    "type": {
                        "user": "CookbookString"
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
    "Recipe": {
        "struct": {
            "doc": [
                "Recipe model struct"
            ],
            "members": [
                {
                    "doc": [
                        "The recipe title text"
                    ],
                    "name": "title",
                    "type": {
                        "user": "CookbookString"
                    }
                },
                {
                    "doc": [
                        "The recipe's category"
                    ],
                    "name": "category",
                    "type": {
                        "user": "CookbookString"
                    }
                },
                {
                    "doc": [
                        "The recipe's author"
                    ],
                    "name": "author",
                    "optional": true,
                    "type": {
                        "user": "CookbookString"
                    }
                },
                {
                    "attr": {
                        "gt": 0.0
                    },
                    "doc": [
                        "The number of servings"
                    ],
                    "name": "servings",
                    "optional": true,
                    "type": {
                        "builtin": "int"
                    }
                },
                {
                    "attr": {
                        "lenLT": 1000
                    },
                    "doc": [
                        "The recipe's ingredients"
                    ],
                    "name": "ingredients",
                    "type": {
                        "array": {
                            "type": {
                                "user": "Ingredient"
                            }
                        }
                    }
                },
                {
                    "attr": {
                        "lenLT": 10000
                    },
                    "doc": [
                        "The recipe's markdown text"
                    ],
                    "name": "markdownText",
                    "type": {
                        "builtin": "string"
                    }
                },
                {
                    "doc": [
                        "The recipe's markdown model"
                    ],
                    "name": "markdown",
                    "type": {
                        "builtin": "object"
                    }
                }
            ],
            "name": "Recipe"
        }
    },
    "RecipeLoaded": {
        "struct": {
            "doc": [
                "A loaded recipe struct"
            ],
            "members": [
                {
                    "doc": [
                        "The recipe ID"
                    ],
                    "name": "id",
                    "type": {
                        "user": "CookbookString"
                    }
                },
                {
                    "doc": [
                        "The recipe URL"
                    ],
                    "name": "url",
                    "type": {
                        "user": "CookbookString"
                    }
                },
                {
                    "doc": [
                        "The recipe model"
                    ],
                    "name": "recipe",
                    "type": {
                        "user": "Recipe"
                    }
                }
            ],
            "name": "RecipeLoaded"
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
