// Licensed under the MIT License
// https://github.com/craigahobbs/cookbook/blob/master/LICENSE

import * as chisel from './chisel.js';
import {markdownTypes} from './markdownTypes.js';


// Markdown regex
const rIndent = /^(\s*)(.*)$/;
const rHeading = /^\s*(#{1,6})\s+(.*?)\s*$/;
const rList = /^(\s*(-|\*|\+|[0-9]\.|[1-9][0-9]+\.)\s+)(.*?)\s*$/;
const rSpans = new RegExp(
    '(!?\\[)(.*?)\\]\\((.*?)(?:\\s*"(.*?)"\\s*)?\\)|' +
        '(\\*{3})(?!\\s)(.*?[^\\s]\\**)\\*{3}|' +
        '(\\*{2})(?!\\s)(.*?[^\\s]\\**)\\*{2}|' +
        '(\\*)(?!\\s)(.*?[^\\s]\\**)\\*',
    'mg'
);


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
            const matchLine = line.match(rIndent);
            const lineIndent = matchLine !== null && matchLine[1] !== '' ? matchLine[1].length : 0;
            const emptyLine = matchLine !== null && matchLine[2] === '';
            const matchHeading = emptyLine ? null : line.match(rHeading);
            const matchList = emptyLine ? null : line.match(rList);
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
                lines.push(line.slice(codeBlockIndent));

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
                const [, listIndentString, listMark, text] = matchList;
                const start = parseInt(listMark, 10);

                // Close any open paragraph
                closeParagraph();

                // New list within a list?
                if (topList !== null && lineIndent >= topListIndent) {
                    // Add the new list part
                    const listParts = [];
                    const list = {'list': {'items': [{'parts': listParts}]}};
                    if (!isNaN(start)) {
                        list.list.start = start;
                    }
                    topParts.push(list);
                    parts.push([lineIndent, listParts, list, listIndentString.length]);
                } else {
                    // New list?
                    const [curIndent, curParts, curList, curListIndent] = updateParts(lineIndent, true);
                    if (curList === null) {
                        // Add the new list part
                        const listParts = [];
                        const list = {'list': {'items': [{'parts': listParts}]}};
                        if (!isNaN(start)) {
                            list.list.start = start;
                        }
                        curParts.push(list);
                        parts.push([curIndent, listParts, list, listIndentString.length]);
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
                    // Code block line? If so, trip the indent
                    if (paragraph !== null) {
                        lines.push(line.slice(codeBlockIndent));
                    } else {
                        lines.push(line);
                    }
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
    const spans = [];

    // Iterate the span matches
    let ixSearch = 0;
    for (const match of text.matchAll(rSpans)) {
        const [, linkMark = null, linkText = null, linkHref = null, linkTitle = null, boldItalicMark = null, boldItalicText = null,
            boldMark = null, boldText = null, italicMark = null, italicText = null] = match;

        // Add any preceding text
        if (ixSearch < match.index) {
            spans.push({'text': text.slice(ixSearch, match.index)});
        }

        // Link span?
        if (linkMark !== null && linkMark === '[') {
            const span = {'link': {'href': linkHref, 'spans': paragraphSpans(linkText)}};
            if (linkTitle !== null) {
                span.link.title = linkTitle;
            }
            spans.push(span);

        // Image span?
        } else if (linkMark !== null && linkMark === '![') {
            const span = {'image': {'src': linkHref, 'alt': linkText}};
            if (linkTitle !== null) {
                span.image.title = linkTitle;
            }
            spans.push(span);

        // Bold-italic style-span
        } else if (boldItalicMark === '***') {
            spans.push({'style': {'style': 'bold', 'spans': [{'style': {'style': 'italic', 'spans': paragraphSpans(boldItalicText)}}]}});

        // Bold style-span
        } else if (boldMark === '**') {
            spans.push({'style': {'style': 'bold', 'spans': paragraphSpans(boldText)}});

        // Italic style-span
        } else if (italicMark === '*') {
            spans.push({'style': {'style': 'italic', 'spans': paragraphSpans(italicText)}});
        }

        ixSearch = match.index + match[0].length;
    }

    // Add any remaining text
    if (ixSearch < text.length) {
        spans.push({'text': text.slice(ixSearch)});
    }

    return spans;
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
                    'elem': codeBlock.lines.map((line) => ({'text': `${line}\n`}))
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
                'html': style.style === 'italic' ? 'em' : 'strong',
                'elem': paragraphSpanElements(style.spans)
            });

        // Link span?
        } else if ('link' in span) {
            const {link} = span;
            const linkElements = {
                'html': 'a',
                'attr': {'href': link.href},
                'elem': paragraphSpanElements(link.spans)
            };
            if ('title' in link) {
                linkElements.attr.title = link.title;
            }
            spanElements.push(linkElements);

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
