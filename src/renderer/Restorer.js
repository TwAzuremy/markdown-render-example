import { rules } from "./rules";

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
    let zwpAmount = 0;

    const text = Array.from(container.querySelectorAll("&>.md-i"))
        .map(inline => {
            const { type } = inline.dataset || {};
            const isSingleBR = isSingleBRWithNoAttributes(inline);

            const raw = {
                br: () => restorer.br?.().text,
                image: () => restorer.image?.(inline).text
            }[type]?.() || (isSingleBR ? "\n> \u200b" : inline?.textContent || "");

            // Count the number of zero-width spaces.
            const zwpMatches = raw.match(rules.restorer.removableZeroWiseSpace) || [];
            zwpAmount += zwpMatches.length;

            // Remove zero-width spaces that meet the criteria.
            return raw.replace(rules.restorer.removableZeroWiseSpace, "");
        })
        .join("");

    return {
        text,
        zwpAmount
    };
}

/**
 * Checks if the given element contains exactly one child, and that child is a <br> tag with no attributes.
 *
 * @param {HTMLElement} element - The parent element to check.
 * @returns {Boolean} - Returns true if the parent element contains exactly one <br> tag with no attributes, otherwise returns false.
 * 
 * @example
 * const isHasSingleBR = isSingleBRWithNoAttributes(element);
 */
function isSingleBRWithNoAttributes(element) {
    // Get all child elements of the current element
    const childElements = element.children;

    // Check if there is exactly one child element
    if (childElements.length === 1) {
        const child = childElements[0];

        // Check if the child is a <br> tag with no attributes
        if (child.tagName === 'BR' && child.attributes.length === 0) {
            return true;
        }
    }

    return false;
}

/**
 * Extract the Markdown information from the HTML container and turn it into a Markdown string.
 * 
 * @param {HTMLElement} container HTML container with Markdown.
 * @returns {String} Markdown as a string.
 * 
 * @example
 * const markdown = await parseHTMLElement(MarkdownContainer);
 */
export function parseHTMLElement(container) {
    let markdown = "";
    let zwpAmount = 0;

    // Gets all the block-level children of the container.
    const blockElements = Array.from(container.childNodes).filter(node => {
        // Match an element with a class name of .md-b
        const isBlockElement = node.nodeType === Node.ELEMENT_NODE && node.matches(".md-b");
        // Match non-null text nodes ( direct children )
        const isDirectText = node.nodeType === Node.TEXT_NODE && node.textContent.trim() !== "";
        return isBlockElement || isDirectText;
    });

    blockElements.forEach(block => {
        if (block.nodeType === Node.TEXT_NODE) {
            markdown += block.textContent;
            return;
        }

        // Get the markdown type.
        const type = block.dataset?.type;
        const tokens = restorer[type](block);

        markdown += tokens.text + "\n\n";
        zwpAmount += tokens?.zwpAmount || 0;
    });

    return {
        text: markdown.replace(/\n{2,}$/, "\n\n"),
        zwpAmount
    };
}

export const restorer = {
    // Block-level catcher methods
    space() {
        return {
            text: "\n\n"
        };
    },
    code(element) {
        return {
            text: element.textContent
        };
    },
    blockquote(element) {
        const sign = element.dataset.sign + " ";
        let zwpAmount = 0;

        const text = Array.from(element.children).map(child => {
            const type = child.dataset.type;
            if (type === "space") return "> ";

            if (type === "paragraph") {
                const tokens = parseInlineElement(child);
                zwpAmount = tokens?.zwpAmount || 0;

                return sign + tokens.text;
            }

            if (type === "blockquote") {
                return restorer.blockquote(child)
                    .split("\n")
                    .map(line => sign + line)
                    .join("\n");
            }

            return "";
        })
            .join("\n")
            // Replace the paragraph ( \nn\ ) with the block reference "\n> \n>".
            .replace(/\n\n/g, "\n> \n> ")
            // Place the \n... Replace with \n> ...
            .replace(/(?<!\\)\n(?!>)/g, "\n> ")
            // Replace the "\n>" at the end of the line with "\n> \u200b".
            .replace(/\n> +$/, "\n> \u200b")
            .trimEnd();

        return {
            text,
            zwpAmount
        };
    },
    heading(element) {
        const sign = element.dataset.sign;

        return {
            text: sign + " " + element.textContent
        };
    },
    paragraph(element) {
        if (!element.textContent) {
            return {
                text: "\u200b"
            };
        }

        return parseInlineElement(element);
    },
    // Inline-level catcher methods
    br() {
        return {
            text: "\\\n"
        };
    },
    image(element) {
        return {
            text: element.querySelector("&>.md-image-content").textContent
        };
    }
};