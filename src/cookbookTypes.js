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
                        "The cookbook source URL"
                    ],
                    "name": "sourceURL",
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
                        "The cookbook's recipe model URLs"
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
                    "attr": {
                        "lenGT": 0,
                        "lenLT": 1000
                    },
                    "doc": [
                        "The recipe's categories"
                    ],
                    "name": "categories",
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
