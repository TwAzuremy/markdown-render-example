import { marked } from "marked";
import { renderer } from "./Renderer";
import { tokenizer } from "./Tokenizer";

marked.use({
    async: true,
    pedantic: false,
    gfm: true,
    renderer,
    tokenizer
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