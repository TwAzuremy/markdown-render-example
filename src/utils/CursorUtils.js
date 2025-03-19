/**
 * Saves the position of the cursor (selection range) within a given container element.
 * 
 * This function retrieves the current cursor position (selection range) within the specified
 * HTML container element. It uses the `window.getSelection()` API to get the selected range 
 * and then calculates the corresponding character offsets for the start and end positions 
 * within the container element.
 * 
 * @param {Node} container - The HTML container element (e.g., a `div`, `contenteditable`, etc.) 
 *      within which the cursor is placed.
 * 
 * @returns {{start: number, end: number} | null} An object with the start and end positions 
 *      of the cursor as character offsets relative to the container's text content, 
 *      or `null` if no selection is made.
 * 
 * @example
 * const selection = saveCursorSelection(container);
 * 
 * @throws {Error} If the provided container is not a valid DOM node.
 */
export function saveCursorSelection(container) {
    const sel = window.getSelection();
    if (!sel.rangeCount) return null;

    const range = sel.getRangeAt(0);
    const start = getTextOffset(container, range.startContainer, range.startOffset);
    const end = getTextOffset(container, range.endContainer, range.endOffset);

    return { start, end };
}

/**
 * Calculates the text offset within a given editable node.
 * 
 * This function computes the offset (position) of the text content up to the specified point
 * inside the editable node. It creates a `Range` object, selects the contents of the editable node,
 * and then sets the range's endpoint at the specified `rangeNode` and `offset` within that node.
 * The length of the resulting range is returned, which represents the position of the text at that point.
 * 
 * @param {Node} editableNode - The editable DOM node (e.g., a contenteditable element) that contains the text.
 * @param {Node} rangeNode - The reference node within the editableNode where the offset should be calculated.
 * @param {Number} offset - The character offset within the rangeNode to calculate the text length up to.
 * 
 * @returns {Number} The length of the text from the beginning of the editableNode up to the specified offset.
 * 
 * @example
 * const start = getTextOffset(container, range.startContainer, range.startOffset);
 * const end = getTextOffset(container, range.endContainer, range.endOffset);
 */
function getTextOffset(editableNode, rangeNode, offset) {
    const range = document.createRange();

    range.selectNodeContents(editableNode);
    range.setEnd(rangeNode, offset);

    return range.toString().length;
}

/**
 * Restores the cursor position (selection range) within a given container element.
 * 
 * This function sets the cursor back to a specific position within the specified container
 * element based on the provided start and end character offsets. It uses the `window.getSelection()`
 * API to manipulate the current selection and restores the cursor position to match the given range.
 * 
 * @param {Node} container - The HTML container element (e.g., `div`, `contenteditable`, etc.) 
 *      in which the cursor position should be restored.
 * 
 * @param {{start: number, end: number}} selection - An object containing the `start` and `end` 
 *      positions of the cursor as character offsets relative to the container's text content.
 * 
 * @returns {void} This function does not return anything.
 * 
 * @example
 * restoreCursorSelection(container, { start: 5, end: 10 });
 * 
 * @throws {Error} If the provided container is not a valid DOM node or if the selection object is invalid.
 */
export function restoreCursorSelection(container, { start, end }) {
    const sel = window.getSelection();
    sel.removeAllRanges();

    const range = getTextRange(container, start, end);

    if (range) {
        sel.addRange(range);
    }
}

/**
 * Creates a Range object based on the specified text offsets within an editable node.
 * 
 * This function calculates the start and end positions of a range based on the provided 
 * character offsets (`startOffset` and `endOffset`) within the text content of an editable node. 
 * It uses a `TreeWalker` to traverse the text nodes of the `editableNode`, finds the nodes 
 * that correspond to the given offsets, and creates a `Range` object with those boundaries.
 * 
 * @param {Node} editableNode - The editable DOM node (e.g., a contenteditable element) containing the text.
 * @param {number} startOffset - The starting character offset within the text content of the editable node.
 * @param {number} endOffset - The ending character offset within the text content of the editable node.
 * 
 * @returns {Range} A `Range` object that represents the text range between `startOffset` and `endOffset`.
 * 
 * @throws {Error} Will throw an error if the provided offsets are out of bounds of the editableNode.
 * 
 * @example
 * const range = getTextRange(container, start, end);
 */
function getTextRange(editableNode, startOffset, endOffset) {
    let startNode, startOffsetRes, endNode, endOffsetRes;
    let charCount = 0;

    const walker = document.createTreeWalker(editableNode, NodeFilter.SHOW_TEXT, null, false);

    while (walker.nextNode()) {
        const node = walker.currentNode;
        const nodeLength = node.textContent.length;

        // Find the start position
        if (!startNode && charCount + nodeLength >= startOffset) {
            startNode = node;
            startOffsetRes = startOffset - charCount;
        }

        // Find the end position
        if (!endNode && charCount + nodeLength >= endOffset) {
            endNode = node;
            endOffsetRes = endOffset - charCount;
        }

        if (startNode && endNode) break;
        charCount += nodeLength;
    }

    // Handle edge cases when start or end node is not found
    if (!startNode) {
        startNode = editableNode;
        startOffsetRes = 0;
    }

    if (!endNode) {
        endNode = editableNode;
        endOffsetRes = 0;
    }

    const range = document.createRange();

    range.setStart(startNode, startOffsetRes);
    range.setEnd(endNode, endOffsetRes);

    return range;
}

/**
 * Get the DOM element under the cursor position.
 * 
 * This function gets the DOM element where the cursor is located through the current selection object. 
 * When the cursor is inside a text node, it returns its parent element node; 
 * Otherwise, return directly to the node where it is located.
 * 
 * @param {Node} container A container element used to limit the scope of the lookup
 * @returns {Node|null} Returns the DOM element under the cursor, 
 *      and null if there is no selection or the container is invalid.
 * 
 * @example
 * const element = getElementUnderCursor(container);
 */
export const getElementUnderCursor = (container) => {
    if (!container) return null;

    const sel = window.getSelection();
    if (!sel.rangeCount) return null;

    const range = sel.getRangeAt(0);

    // Get the element under the cursor.
    let node = range.startContainer;
    if (node.nodeType === Node.TEXT_NODE) {
        node = node.parentNode;
    }

    return node;
};