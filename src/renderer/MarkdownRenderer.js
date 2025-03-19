import { marked } from "marked";
import { spacesSeparatedToHump } from "../utils/StringUtils";

const renderer = {
    // Block-level renderer methods
    space() {
        return `<p class="md-e md-b" data-type="space"> </p>`;
    },
    heading({ tokens, depth }) {
        const text = this.parser.parseInline(tokens);
        const escapedText = tokens.reduce((acc, item) => acc + item.text, "");

        return `<h${depth} class="md-e md-b" data-type="heading" data-anchor="${spacesSeparatedToHump(escapedText)}"><span class="md-sign md-prefix-sign">${"#".repeat(depth) + " "}</span><span class="md-content">${text}</span></h${depth}>`;
    },
    paragraph({ tokens }) {
        return `<p class="md-e md-b" data-type="paragraph">${this.parser.parseInline(tokens)}</p>`;
    },
    // Inline-level renderer methods
    strong({ tokens, raw, text }) {
        // Detach markdown symbols.
        const signs = raw.split(text);

        return `<span class="md-i" data-type="strong"><span class="md-sign md-prefix-sign">${signs[0]}</span><strong class="md-content">${this.parser.parseInline(tokens)}</strong><span class="md-sign md-suffix-sign">${signs[1]}</span></span>`;
    },
    em({ tokens, raw, text }) {
        const signs = raw.split(text);

        return `<span class="md-i" data-type="em"><span class="md-sign md-prefix-sign">${signs[0]}</span><em class="md-content">${this.parser.parseInline(tokens)}</em><span class="md-sign md-suffix-sign">${signs[1]}</span></span>`;
    },
    br() {
        return `<br class="md-i" data-type="br">`;
    },
    text({ text }) {
        return `<span class="md-i" data-type="inlineText">${text}</span>`;
    }
};

const catcher = {
    // Block-level catcher methods
    space() {
        return "\n\n";
    },
    heading(element) {
        return element.textContent;
    },
    paragraph(element) {
        return parseInlineElement(element);
    },
    // Inline-level catcher methods
    br() {
        return "\\\n";
    }
};

marked.use({
    async: true,
    pedantic: false,
    gfm: true,
    renderer
});

/**
 * Convert a Markdown string to an HTML string.
 * 
 * @param {String} mdStr Markdown as a string.
 * @returns {Promise<String>} HTMLElement as a string.
 * 
 * @example
 * const html = await parseMarkdownString("# Heading");
 */
export async function parseMarkdownString(mdStr) {
    return await marked.parse(mdStr);
}

/**
 * Extract the Markdown information from the HTML container and turn it into a Markdown string.
 * 
 * @param {HTMLElement} container HTML container with Markdown.
 * @returns {Promise<String>} Markdown as a string.
 * 
 * @example
 * const markdown = await parseHTMLElement(MarkdownContainer);
 */
export async function parseHTMLElement(container) {
    let markdown = "";

    // Gets all the block-level children of the container.
    const blockElements = container.querySelectorAll("&>.md-b");
    blockElements.forEach(block => {
        // Get the markdown type.
        const type = block.dataset.type;
        markdown += catcher[type](block) + "\n\n";
    });

    return markdown;
}

/**
 * Extract block-level from inline-level
 * 
 * @param {HTMLElement} container block-level HTML container
 * @returns {String} Markdown as a string.
 * 
 * @example
 * const markdown = parseInlineElement(blockLevelContainer);
 */
function parseInlineElement(container) {
    let markdown = "";

    const inlineElements = container.querySelectorAll("&>.md-i");
    inlineElements.forEach(inline => {
        const type = inline.dataset.type;

        if (type === "br") {
            // Since it <br> cannot be fetched with textContent, it needs to be recognized.
            markdown += catcher["br"]();
        } else {
            // Get the string via textContent. (including markdown symbols)
            markdown += inline.textContent;
        }
    });

    return markdown;
}