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
    const parts = [[0, markdownParts, null, 0]];
    let paragraph = null;
    let lines = [];

    // Helper function to close the current part
    const closeParagraph = () => {
        // Code block?
        if (paragraph !== null) {
            paragraph.codeBlock.lines = lines;
            paragraph = null;
            lines = [];
        } else if (lines.length) {
            // Paragraph
            const [, topParts] = parts[parts.length - 1];
            topParts.push({'paragraph': {'spans': paragraphSpans(lines.join(' '))}});
            lines = [];
        }
    };

    // Helper function to get the correct [indent, parts, list, listIndent] tuple for the given indent
    const updateParts = (indent, isList = false) => {
        // Find the part with the lesser or equal indent
        for (let ixPart = parts.length - 1; ixPart > 0; ixPart--) {
            const [curIndent,, curList, curListIndent] = parts[ixPart];
            const activeIndent = isList || curList === null ? curIndent : curListIndent;
            if (indent >= activeIndent) {
                break;
            }
            parts.pop();
        }

        // Compute the active indent
        return parts[parts.length - 1];
    };

    // Process markdown text line by line
    for (const markdownString of (typeof markdown === 'string' ? [markdown] : markdown)) {
        for (const line of markdownString.split('\n')) {
            const matchLine = (/^(\s*)(.*)$/).exec(line);
            const lineIndent = matchLine !== null && matchLine[1] !== '' ? matchLine[1].length : 0;
            const emptyLine = matchLine !== null && matchLine[2] === '';
            const matchHeading = emptyLine ? null : (/^\s*(#{1,6})\s+(.*?)\s*$/).exec(line);
            const matchList = emptyLine ? null : (/^(\s*(-|\*|\+|[0-9]\.|[1-9][0-9]+\.)\s+)(.*?)\s*$/).exec(line);
            const [, topParts, topList, topListIndent] = parts[parts.length - 1];
            const codeBlockIndent = topListIndent + 4;

            // Empty line?
            if (emptyLine) {
                closeParagraph();

            // Code block?
            } else if (!lines.length && lineIndent >= codeBlockIndent) {
                if (paragraph === null) {
                    paragraph = {'codeBlock': {}};
                    topParts.push(paragraph);
                }
                lines.push(line);

            // Heading?
            } else if (matchHeading !== null && lineIndent < codeBlockIndent) {
                const [, headingString, text] = matchHeading;

                // Close any open paragraph
                closeParagraph();

                // Add the heading paragraph markdown part model
                const [, curParts] = updateParts(lineIndent);
                curParts.push({
                    'paragraph': {
                        'spans': paragraphSpans(text),
                        'style': `h${headingString.length}`
                    }
                });

            // List?
            } else if (matchList !== null && lineIndent < codeBlockIndent) {
                const [, textIndentString,, text] = matchList;

                // Close any open paragraph
                closeParagraph();

                // New list within a list?
                if (topList !== null && lineIndent >= topListIndent) {
                    // Add the new list part
                    const listParts = [];
                    const list = {'list': {'items': [{'parts': listParts}]}};
                    topParts.push(list);
                    parts.push([lineIndent, listParts, list, textIndentString.length]);
                } else {
                    // New list?
                    const [curIndent, curParts, curList, curListIndent] = updateParts(lineIndent, true);
                    if (curList === null) {
                        // Add the new list part
                        const listParts = [];
                        const list = {'list': {'items': [{'parts': listParts}]}};
                        curParts.push(list);
                        parts.push([curIndent, listParts, list, textIndentString.length]);
                    } else {
                        // Push the new list item
                        const listItem = {'parts': []};
                        curList.list.items.push(listItem);
                        parts.pop();
                        parts.push([curIndent, listItem.parts, curList, curListIndent]);
                    }
                }

                // Add the text line
                lines.push(text);

            // Text line
            } else {
                if (lines.length) {
                    lines.push(line);
                } else {
                    const [,,, curListIndent] = updateParts(lineIndent);
                    lines.push(line.slice(curListIndent));
                }
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
