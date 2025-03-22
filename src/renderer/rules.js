/**
 * Define the rules for Markdown parsing
 */
export const rules = {
    other: {
        blockquoteLineIsEmpty: /^ {0,3}>[\t ]*$/,
        blockquoteLineHasZeroWideSpace: /^ {0,3}> ?[\u200b]*$/,
    },
    restorer: {
        removableZeroWiseSpace: /\u200b(?![ \n]*$)/g,
    }
};