import * as chisel from '../src/chisel.js';
import {markdownElements, parseMarkdown} from '../src/markdown.js';
import {markdownTypes} from '../src/markdownTypes.js';
import test from 'ava';

/* eslint-disable id-length */


test('parseMarkdown', (t) => {
    const markdown = parseMarkdown(`
# Title

This is a sentence.
This is another sentence.

This is another paragraph.`);
    chisel.validateType(markdownTypes, 'Markdown', markdown);
    t.deepEqual(
        markdown,
        {
            'parts': [
                {
                    'paragraph': {
                        'spans': [
                            {'text': 'Title'}
                        ],
                        'style': 'h1'
                    }
                },
                {
                    'paragraph': {
                        'spans': [
                            {'text': 'This is a sentence. This is another sentence.'}
                        ]
                    }
                },
                {
                    'paragraph': {
                        'spans': [
                            {'text': 'This is another paragraph.'}
                        ]
                    }
                }
            ]
        }
    );
});


test('markdownElements', (t) => {
    const elements = markdownElements({
        'parts': [
            {
                'paragraph': {
                    'style': 'h1',
                    'spans': [{'text': 'Title'}]
                }
            },
            {
                'paragraph': {
                    'spans': [
                        {'text': 'This is a sentence. This is '},
                        {
                            'style': {
                                'style': 'bold',
                                'spans': [
                                    {'text': 'bold and '},
                                    {'style': {'style': 'italic', 'spans': [{'text': 'bold-italic'}]}},
                                    {'text': '. This is '},
                                    {'style': {'style': 'strike', 'spans': [{'text': 'strikethrough'}]}},
                                    {'text': '.'}
                                ]
                            }
                        }
                    ]
                }
            },
            {
                'paragraph': {
                    'spans': [
                        {'text': 'This is a link to the '},
                        {'link': {
                            'href': 'https://craigahobbs.github.io/chisel/doc/',
                            'title': 'The Chisel Type Model',
                            'spans': [
                                {'style': {'style': 'bold', 'spans': [{'text': 'Chisel'}]}},
                                {'text': ' Type Model'}
                            ]
                        }}
                    ]
                }
            },
            {
                'paragraph': {
                    'spans': [
                        {'text': 'This is an image: '},
                        {'image': {
                            'src': 'https://craigahobbs.github.io/chisel/doc/doc.svg',
                            'alt': 'Chisel Documentation Icon',
                            'title': 'Chisel'
                        }}
                    ]
                }
            },
            {
                'list': {
                    'items': [
                        {
                            'parts': [
                                {
                                    'paragraph': {
                                        'spans': [
                                            {'text': 'This is a paragraph.'}
                                        ]
                                    }
                                },
                                {
                                    'paragraph': {
                                        'spans': [
                                            {'text': 'This is a another paragraph.'}
                                        ]
                                    }
                                }
                            ]
                        },
                        {
                            'parts': [
                                {
                                    'paragraph': {
                                        'spans': [
                                            {'text': 'This is the second list item.'}
                                        ]
                                    }
                                }
                            ]
                        }
                    ]
                }
            },
            {
                'list': {
                    'start': 10,
                    'items': [
                        {
                            'parts': [
                                {
                                    'paragraph': {
                                        'spans': [
                                            {'text': 'This is a paragraph.'}
                                        ]
                                    }
                                }
                            ]
                        }
                    ]
                }
            },
            {
                'codeBlock': {
                    'lines': [
                        'Line 1',
                        'Line 2'
                    ]
                }
            }
        ]
    });
    chisel.validateElements(elements);
    t.deepEqual(
        elements,
        [
            {'html': 'h1', 'elem': [{'text': 'Title'}]},
            {
                'html': 'p',
                'elem': [
                    {'text': 'This is a sentence. This is '},
                    {'html': 'strong', 'elem': [
                        {'text': 'bold and '},
                        {'html': 'em', 'elem': [{'text': 'bold-italic'}]},
                        {'text': '. This is '},
                        {'html': 'del', 'elem': [{'text': 'strikethrough'}]},
                        {'text': '.'}
                    ]}
                ]
            },
            {
                'html': 'p',
                'elem': [
                    {'text': 'This is a link to the '},
                    {
                        'html': 'a',
                        'attr': {'href': 'https://craigahobbs.github.io/chisel/doc/'},
                        'elem': [{'html': 'strong', 'elem': [{'text': 'Chisel'}]}, {'text': ' Type Model'}]
                    }
                ]
            },
            {
                'html': 'p',
                'elem': [
                    {'text': 'This is an image: '},
                    {
                        'html': 'img',
                        'attr': {
                            'src': 'https://craigahobbs.github.io/chisel/doc/doc.svg',
                            'title': 'Chisel',
                            'alt': 'Chisel Documentation Icon'
                        }
                    }
                ]
            },
            {
                'html': 'ul',
                'attr': null,
                'elem': [
                    {
                        'html': 'li',
                        'elem': [
                            {'html': 'p', 'elem': [{'text': 'This is a paragraph.'}]},
                            {'html': 'p', 'elem': [{'text': 'This is a another paragraph.'}]}
                        ]
                    },
                    {
                        'html': 'li',
                        'elem': [
                            {'html': 'p', 'elem': [{'text': 'This is the second list item.'}]}
                        ]
                    }
                ]
            },
            {
                'html': 'ol',
                'attr': {'start': '10'},
                'elem': [
                    {
                        'html': 'li',
                        'elem': [
                            {'html': 'p', 'elem': [{'text': 'This is a paragraph.'}]}
                        ]
                    }
                ]
            },
            {
                'html': 'pre',
                'elem': {
                    'html': 'code',
                    'elem': [
                        {'text': 'Line 1'},
                        {'text': 'Line 2'}
                    ]
                }
            }
        ]
    );
});
