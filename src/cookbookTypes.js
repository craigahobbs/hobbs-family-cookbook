/* eslint-disable quotes */
export const cookbookTypes =
{
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
                        "lenGT": 0
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
    "Markdown": {
        "typedef": {
            "attr": {
                "lenGT": 0,
                "lenLT": 100
            },
            "doc": " A list of markdown text",
            "name": "Markdown",
            "type": {
                "array": {
                    "attr": {
                        "lenGT": 0
                    },
                    "type": {
                        "builtin": "string"
                    }
                }
            }
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
                    "doc": " The recipe's description markdown",
                    "name": "description",
                    "optional": true,
                    "type": {
                        "user": "Markdown"
                    }
                },
                {
                    "attr": {
                        "lenGT": 0,
                        "lenLT": 100
                    },
                    "doc": " The recipe's igredient list",
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
                    "doc": " The recipe's introduction markdown",
                    "name": "introduction",
                    "optional": true,
                    "type": {
                        "user": "Markdown"
                    }
                },
                {
                    "doc": " The recipe's instructions markdown",
                    "name": "instructions",
                    "type": {
                        "user": "Markdown"
                    }
                },
                {
                    "doc": " The recipe's summary markdown",
                    "name": "summary",
                    "optional": true,
                    "type": {
                        "user": "Markdown"
                    }
                }
            ],
            "name": "Recipe"
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
                    "name": "tbsp"
                },
                {
                    "name": "tsp"
                }
            ]
        }
    }
};
