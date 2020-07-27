// Licensed under the MIT License
// https://github.com/craigahobbs/cookbook/blob/master/LICENSE

import * as chisel from './chisel.js';
import {markdownTypes} from './markdownTypes.js';


/**
 * Parse markdown text or text lines into a markdown model
 *
 * @param {string|string[]} markdown - Markdown text or text lines
 * @returns {Object[]} The markdown parts array model
 */
export function parseMarkdown(markdown) {
    const markdownParts = [];

    // Process markdown text line by line
    let paragraphLines = null;
    for (const markdownString of (typeof markdown === 'string' ? [markdown] : markdown)) {
        for (const line of markdownString.split('\n')) {
            const emptyLine = (/^\s*$/).test(line);
            const matchHeading = emptyLine ? null : (/^\s{0,3}(#{1,6})\s+(.*?)\s*$/).exec(line);

            // Empty line?
            if (emptyLine) {
                // Add the paragraph markdown part model
                if (paragraphLines !== null) {
                    markdownParts.push({
                        'paragraph': {
                            'spans': paragraphSpans(paragraphLines.join(' '))
                        }
                    });
                    paragraphLines = null;
                }

            // Heading?
            } else if (matchHeading !== null) {
                // Add the heading paragraph markdown part model
                markdownParts.push({
                    'paragraph': {
                        'spans': paragraphSpans(matchHeading[2]),
                        'style': `H${matchHeading[1].length}`
                    }
                });

            // Text line
            } else {
                // Add the paragraph line
                if (paragraphLines === null) {
                    paragraphLines = [];
                }
                paragraphLines.push(line);
            }
        }
    }

    // Add the paragraph markdown part model
    if (paragraphLines !== null) {
        markdownParts.push({
            'paragraph': {
                'spans': paragraphSpans(paragraphLines.join(' '))
            }
        });
        paragraphLines = null;
    }

    return {'parts': markdownParts};
}


/**
 * Helper function to translate markdown paragraph text to a markdown paragraph span model array
 *
 * @param {string} text - The markdown text
 * @returns {Object[]} The markdown paragraph span array model
 */
function paragraphSpans(text) {
    return [
        {
            'text': text
        }
    ];
}


/**
 * Generate an element model from a markdown string
 *
 * @param {string|Object} [markdown=null] - Markdown text or markdown model
 * @returns {?Object[]}
 */
export function markdownElements(markdown = null) {
    const elements = [];

    // Parse the markdown
    const markdownParsed = typeof markdown === 'string' ? parseMarkdown(markdown) : markdown;
    chisel.validateType(markdownTypes, 'Markdown', markdownParsed);

    // Transform the markdown model into an element model
    for (const markdownPart of markdownParsed.parts) {
        // Paragraph?
        if ('paragraph' in markdownPart) {
            const {paragraph} = markdownPart;
            elements.push({
                'html': 'style' in paragraph ? paragraph.style.toLowerCase() : 'p',
                'elem': paragraphSpanElements(paragraph.spans)
            });
        }
    }

    // If there are no elements return null
    return elements.length ? elements : null;
}


/**
 * Helper function to generate an element model from a markdown span model array
 *
 * @param {Object} spans - The markdown span model array
 * @returns {Object[]} The span array element model
 */
function paragraphSpanElements(spans) {
    const spanElements = [];
    for (const span of spans) {
        // Text span?
        if ('text' in span) {
            spanElements.push({'text': span.text});

        // Style span?
        } else if ('style' in span) {
            const {style} = span;
            spanElements.push({
                'html': style.style === 'Strike' ? 'del' : (style.style === 'Italic' ? 'em' : 'strong'),
                'elem': 'spans' in style ? paragraphSpanElements(style.spans) : null
            });

        // Link span?
        } else if ('link' in span) {
            const {link} = span;
            spanElements.push({
                'html': 'a',
                'attr': {'href': link.href},
                'elem': 'spans' in link ? paragraphSpanElements(link.spans) : null
            });

        // Image span?
        } else if ('image' in span) {
            const {image} = span;
            const imageElement = {
                'html': 'img',
                'attr': {'src': image.src, 'alt': image.alt}
            };
            if ('title' in image) {
                imageElement.attr.title = image.title;
            }
            spanElements.push(imageElement);
        }
    }
    return spanElements;
}
