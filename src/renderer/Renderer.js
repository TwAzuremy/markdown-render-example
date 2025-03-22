import { spacesSeparatedToHump } from "../utils/StringUtils";

/**
 * Renders an inline HTML element wrapped with markdown signs and additional content.
 * This function wraps the provided HTML content with inline markdown elements and applies
 * prefix and suffix markdown signs, along with a specified element type.
 *
 * @function
 * @param {string} type - The type of the inline element (used for data-type attribute).
 * @param {string} HTMLContent - The HTML content to be enclosed within the markdown element.
 * @param {string} prefixSign - The prefix markdown sign to be added before the content.
 * @param {string} suffixSign - The suffix markdown sign to be added after the content.
 * 
 * @returns {string} The HTML string of the wrapped element with the applied markdown signs.
 * 
 * @example
 * const html = renderEnclosedInlineElement("strong", "<span>Hello World</span>", "**", "**");
 */
function renderEnclosedInlineElement(type, HTMLContent, prefixSign, suffixSign) {
    // Wrap the HTML content with an inline markdown element, adding prefix and suffix signs.
    return `<span class="md-i" data-type="${type}"><span class="md-sign md-prefix-sign">${prefixSign}</span>${HTMLContent}<span class="md-sign md-suffix-sign">${suffixSign}</span></span>`;
}

export const renderer = {
    // Block-level renderer methods
    space({ type, raw }) {
        if (raw === "\n") return null;

        return `<p class="md-e md-b" data-type="${type}"></p>`;
    },
    code({ type, lang, text }) {
        return `<pre class="md-e md-b" data-type="${type}"><span class="md-sign md-prefix-sign">\`\`\`${lang}\n</span><code class="code__block languate-${lang}">${text}</code><span class="md-sign md-suffix-sign">\n\`\`\`</span></pre>`;
    },
    blockquote({ type, tokens }) {
        return `<blockquote class="md-e md-b" data-type="${type}" data-sign=">">${this.parser.parse(tokens)}</blockquote>`;
    },
    heading({ type, tokens, depth }) {
        const text = this.parser.parseInline(tokens);
        const escapedText = tokens.reduce((acc, item) => acc + item.text, "");

        return `<h${depth} class="md-e md-b" data-type="${type}" data-anchor="${spacesSeparatedToHump(escapedText)}" data-sign="${"#".repeat(depth) + " "}"><span class="md-content">${text}</span></h${depth}>`;
    },
    paragraph({ tokens }) {
        return `<p class="md-e md-b" data-type="paragraph">${this.parser.parseInline(tokens)}</p>`;
    },
    // Inline-level renderer methods
    strong({ type, tokens, raw, text }) {
        // Detach markdown symbols.
        const signs = raw.split(text);

        return renderEnclosedInlineElement(
            type,
            `<strong class="md-content">${this.parser.parseInline(tokens)}</strong>`,
            signs[0], signs[1]
        );
    },
    em({ type, tokens, raw, text }) {
        const signs = raw.split(text);

        return renderEnclosedInlineElement(
            type,
            `<em class="md-content">${this.parser.parseInline(tokens)}</em>`,
            signs[0], signs[1]
        );
    },
    codespan({ type, raw, text }) {
        const signs = raw.split(text);

        return renderEnclosedInlineElement(
            type,
            `<code class="md-content">${text}</code>`,
            signs[0], signs[1]
        );
    },
    br() {
        return `<br class="md-i" data-type="br">`;
    },
    del({ type, tokens, raw, text }) {
        const signs = raw.split(text);

        return renderEnclosedInlineElement(
            type,
            `<del class="md-content">${this.parser.parseInline(tokens)}</del>`,
            signs[0], signs[1]
        );
    },
    link({ type, tokens, raw, text, href, title }) {
        const signs = raw.split(text);

        return renderEnclosedInlineElement(
            type,
            `<a class="md-content" href="${href}" title="${title || text}">${this.parser.parseInline(tokens)}</a>`,
            signs[0], signs[1]
        );
    },
    image({ type, raw, text, href, title }) {
        return `<span class="md-i" data-type="${type}"><span class="md-image-content">${raw}</span><img src="${href}" title="${title || text}"></span>`;
    },
    text({ text }) {
        text = text.replace(/^\$\u200b\$/, "\u200b");
        return `<span class="md-i" data-type="inlineText">${text}</span>`;
    }
};