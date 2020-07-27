import * as chisel from '../src/chisel.js';
import {markdownElements, parseMarkdown} from '../src/markdown.js';
import test from 'ava';

/* eslint-disable id-length */


test('parseMarkdown', (t) => {
    t.deepEqual(
        parseMarkdown(`
# Title

This is a sentence.
This is another sentence.

This is another paragraph.
`),
        {
            'parts': [
                {
                    'paragraph': {
                        'spans': [
                            {'text': 'Title'}
                        ],
                        'style': 'H1'
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
                    'style': 'H1',
                    'spans': [{'text': 'Title'}]
                }
            },
            {
                'paragraph': {
                    'spans': [
                        {'text': 'This is a sentence. This is '},
                        {
                            'style': {
                                'style': 'Bold',
                                'spans': [
                                    {'text': 'bold and '},
                                    {'style': {'style': 'Italic', 'spans': [{'text': 'bold-italic'}]}},
                                    {'text': '. This is '},
                                    {'style': {'style': 'Strike', 'spans': [{'text': 'strikethrough'}]}},
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
                                {'style': {'style': 'Bold', 'spans': [{'text': 'Chisel'}]}},
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
            }
        ]
    );
});
