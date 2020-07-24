/* eslint-disable quotes */
export const cookbookTypes =
{
    "Content": {
        "struct": {
            "doc": " Recipe content union",
            "members": [
                {
                    "attr": {
                        "lenGT": 0,
                        "lenLT": 1000
                    },
                    "doc": "  A list of markdown lines",
                    "name": "markdown",
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
                        "lenLT": 100
                    },
                    "doc": " An ingredient list",
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
            "doc": " Cookbook struct",
            "members": [
                {
                    "attr": {
                        "lenGT": 0,
                        "lenLT": 100
                    },
                    "doc": " The cookbook title text",
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
                    "doc": " The cookbook's recipes",
                    "name": "recipes",
                    "type": {
                        "array": {
                            "type": {
                                "user": "Recipe"
                            }
                        }
                    }
                }
            ],
            "name": "Cookbook"
        }
    },
    "Ingredient": {
        "struct": {
            "doc": " Recipe ingredient struct",
            "members": [
                {
                    "attr": {
                        "lenGT": 0,
                        "lenLT": 100
                    },
                    "doc": " The ingredient name",
                    "name": "name",
                    "type": {
                        "builtin": "string"
                    }
                },
                {
                    "doc": " The ingredient unit",
                    "name": "unit",
                    "type": {
                        "user": "Unit"
                    }
                },
                {
                    "attr": {
                        "gt": 0.0
                    },
                    "doc": " The ingredient amount",
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
            "doc": " Recipe struct",
            "members": [
                {
                    "attr": {
                        "lenGT": 0,
                        "lenLT": 100
                    },
                    "doc": " The recipe title text",
                    "name": "title",
                    "type": {
                        "builtin": "string"
                    }
                },
                {
                    "attr": {
                        "lenGT": 0
                    },
                    "doc": " The recipe's categories",
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
                    "doc": " The serving size and count",
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
                    "doc": " The recipe content",
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
    "Servings": {
        "struct": {
            "doc": " Recipe serving size and count struct",
            "members": [
                {
                    "attr": {
                        "gt": 0.0
                    },
                    "doc": " The number of servings",
                    "name": "count",
                    "type": {
                        "builtin": "int"
                    }
                },
                {
                    "doc": " The serving size",
                    "name": "size",
                    "type": {
                        "user": "Ingredient"
                    }
                }
            ],
            "name": "Servings"
        }
    },
    "Unit": {
        "enum": {
            "doc": " Recipe ingredient unit enum",
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
