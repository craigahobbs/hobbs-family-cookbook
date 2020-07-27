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
    let paragraphLines = null;

    // Helper function to close a paragraph
    const closeParagraph = () => {
        if (paragraphLines !== null) {
            markdownParts.push({
                'paragraph': {
                    'spans': paragraphSpans(paragraphLines.join(' '))
                }
            });
        }
        paragraphLines = null;
    };

    // Process markdown text line by line
    for (const markdownString of (typeof markdown === 'string' ? [markdown] : markdown)) {
        for (const line of markdownString.split('\n')) {
            const emptyLine = (/^\s*$/).test(line);
            const matchHeading = emptyLine ? null : (/^\s{0,3}(#{1,6})\s+(.*?)\s*$/).exec(line);

            // Empty line?
            if (emptyLine) {
                closeParagraph();

            // Heading?
            } else if (matchHeading !== null) {
                // Add the heading paragraph markdown part model
                markdownParts.push({
                    'paragraph': {
                        'spans': paragraphSpans(matchHeading[2]),
                        'style': `h${matchHeading[1].length}`
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
    closeParagraph();

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
 * Generate an element model from a markdown model
 *
 * @param {Object} markdown - The markdown model
 * @returns {Object[]}
 */
export function markdownElements(markdown) {
    // Parse the markdown
    const validatedMarkdown = chisel.validateType(markdownTypes, 'Markdown', markdown);

    // Generate an element model from the markdown model parts
    return markdownPartElements(validatedMarkdown.parts);
}


/**
 * Helper function to generate an element model from a markdown part model array
 *
 * @param {Object[]} parts - The markdown parts model array
 * @returns {Object[]} The parts array element model
 */
function markdownPartElements(parts) {
    const partElements = [];
    for (const markdownPart of parts) {
        // Paragraph?
        if ('paragraph' in markdownPart) {
            const {paragraph} = markdownPart;
            partElements.push({
                'html': 'style' in paragraph ? paragraph.style : 'p',
                'elem': paragraphSpanElements(paragraph.spans)
            });

        // List?
        } else if ('list' in markdownPart) {
            const {list} = markdownPart;
            partElements.push({
                'html': 'start' in list ? 'ol' : 'ul',
                'attr': 'start' in list && list.start > 1 ? {'start': `${list.start}`} : null,
                'elem': list.items.map((item) => ({
                    'html': 'li',
                    'elem': markdownPartElements(item.parts)
                }))
            });

        // Code block?
        } else if ('codeBlock' in markdownPart) {
            const {codeBlock} = markdownPart;
            partElements.push({
                'html': 'pre', 'elem': {
                    'html': 'code',
                    'elem': codeBlock.lines.map((line) => ({'text': line}))
                }
            });
        }
    }

    return partElements;
}


/**
 * Helper function to generate an element model from a markdown span model array
 *
 * @param {Object[]} spans - The markdown span model array
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
                'html': style.style === 'strike' ? 'del' : (style.style === 'italic' ? 'em' : 'strong'),
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
