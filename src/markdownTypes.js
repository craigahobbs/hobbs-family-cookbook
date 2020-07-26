/* eslint-disable quotes */
export const markdownTypes =
{
    "CharacterStyle": {
        "enum": {
            "doc": " Character style enum",
            "name": "CharacterStyle",
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
    "CodeBlock": {
        "struct": {
            "doc": " A code block markdown part struct",
            "members": [
                {
                    "attr": {
                        "lenGT": 0,
                        "lenLT": 1000
                    },
                    "doc": " The code block's text lines",
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
    "ImageSpan": {
        "struct": {
            "doc": " Image span struct",
            "members": [
                {
                    "attr": {
                        "lenGT": 0,
                        "lenLT": 1000
                    },
                    "doc": " The image URL",
                    "name": "href",
                    "type": {
                        "builtin": "string"
                    }
                }
            ],
            "name": "ImageSpan"
        }
    },
    "LinkSpan": {
        "struct": {
            "doc": " Link span struct",
            "members": [
                {
                    "attr": {
                        "lenGT": 1,
                        "lenLT": 1000
                    },
                    "doc": " The contained spans",
                    "name": "spans",
                    "type": {
                        "array": {
                            "type": {
                                "user": "Span"
                            }
                        }
                    }
                },
                {
                    "attr": {
                        "lenGT": 0,
                        "lenLT": 1000
                    },
                    "doc": " The link's URL",
                    "name": "href",
                    "type": {
                        "builtin": "string"
                    }
                }
            ],
            "name": "LinkSpan"
        }
    },
    "List": {
        "struct": {
            "doc": " A list markdown part struct",
            "members": [
                {
                    "attr": {
                        "lenGT": 0,
                        "lenLT": 1000
                    },
                    "doc": " The markdown document's parts",
                    "name": "parts",
                    "type": {
                        "array": {
                            "type": {
                                "user": "MarkdownPart"
                            }
                        }
                    }
                },
                {
                    "doc": " If True, the list is ordered",
                    "name": "ordered",
                    "optional": true,
                    "type": {
                        "builtin": "bool"
                    }
                }
            ],
            "name": "List"
        }
    },
    "Markdown": {
        "struct": {
            "doc": " Markdown document struct",
            "members": [
                {
                    "attr": {
                        "lenGT": 0,
                        "lenLT": 1000
                    },
                    "doc": " The markdown document's parts",
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
            "doc": " Markdown document part struct",
            "members": [
                {
                    "doc": " A paragraph",
                    "name": "paragraph",
                    "type": {
                        "user": "Paragraph"
                    }
                },
                {
                    "doc": " A list",
                    "name": "list",
                    "type": {
                        "user": "List"
                    }
                },
                {
                    "doc": " A code block",
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
            "doc": " Paragraph markdown part struct",
            "members": [
                {
                    "attr": {
                        "lenGT": 0,
                        "lenLT": 1000
                    },
                    "doc": " The paragraph span array",
                    "name": "spans",
                    "type": {
                        "array": {
                            "type": {
                                "user": "Span"
                            }
                        }
                    }
                },
                {
                    "doc": " The paragraph style",
                    "name": "style",
                    "optional": true,
                    "type": {
                        "user": "ParagraphStyle"
                    }
                }
            ],
            "name": "Paragraph"
        }
    },
    "ParagraphStyle": {
        "enum": {
            "doc": " Paragraph style enum",
            "name": "ParagraphStyle",
            "values": [
                {
                    "name": "H1"
                },
                {
                    "name": "H2"
                },
                {
                    "name": "H3"
                },
                {
                    "name": "H4"
                },
                {
                    "name": "H5"
                },
                {
                    "name": "H6"
                }
            ]
        }
    },
    "Span": {
        "struct": {
            "doc": " Paragraph span struct",
            "members": [
                {
                    "attr": {
                        "lenGT": 0,
                        "lenLT": 1000
                    },
                    "doc": " Text span",
                    "name": "text",
                    "type": {
                        "builtin": "string"
                    }
                },
                {
                    "doc": " Style span",
                    "name": "style",
                    "type": {
                        "user": "StyleSpan"
                    }
                },
                {
                    "doc": " Link span",
                    "name": "link",
                    "type": {
                        "user": "LinkSpan"
                    }
                },
                {
                    "doc": " Image span",
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
            "doc": " Style span struct",
            "members": [
                {
                    "attr": {
                        "lenGT": 1,
                        "lenLT": 1000
                    },
                    "doc": " The contained spans",
                    "name": "spans",
                    "type": {
                        "array": {
                            "type": {
                                "user": "Span"
                            }
                        }
                    }
                },
                {
                    "doc": " The span's character style",
                    "name": "style",
                    "type": {
                        "user": "CharacterStyle"
                    }
                }
            ],
            "name": "StyleSpan"
        }
    }
};
