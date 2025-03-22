import "./MarkdownEditor.scss";

import ContentEditable from "react-contenteditable";
import { memo, useEffect, useRef, useState } from "react";

import { parseMarkdownString } from "../renderer/MarkdownRenderer";
import { parseHTMLElement } from "../renderer/Catcher";
import { saveCursorSelection, restoreCursorSelection, getElementUnderCursor, insertAtCursor } from "../utils/CursorUtils";
import { findClosestElement, findFurthestElement } from "../utils/DOMUtils";
import { debounce } from "../utils/BaseUtils";

const MarkdownEditor = memo(({ md = "", ...props }) => {
    /** @type {React.RefObject<Node|null>} */
    const editorElementRef = useRef(null);
    /** @type {React.RefObject<Node|null>} */
    const lastHasSignDisplayElementRef = useRef(null);

    /** @type {[content: String|null, setContent: React.Dispatch<React.SetStateAction<String|null>>]} */
    const [content, setContent] = useState(null);
    const [cursor, setCursor] = useState({ start: 0, end: 0 });

    const handleChange = debounce(async (cursorOffset = 0) => {
        const container = editorElementRef.current;

        // Save the cursor position before rendering.
        const selection = saveCursorSelection(container);

        // Restore the node back to a markdown string.
        const tokens = parseHTMLElement(container);
        const markdown = tokens.text.replace(/(\n{2})+$/gm, "");

        // Re-render markdown
        const html = await parseMarkdownString(markdown);
        setContent(html);

        if (typeof cursorOffset !== "number") {
            cursorOffset = 0;
        }

        setCursor({
            // Possible cursor offset or removed zero-width spaces.
            start: selection.start + cursorOffset - (tokens?.zwpAmount || 0),
            end: selection.end + cursorOffset - (tokens?.zwpAmount || 0)
        });
    }, 100);

    /**
     * Handle the `blur` event and clear the markdown signs display status.
     * This function is called when an element loses focus.
     * 
     * @function
     * @returns {void}
     */
    const handleBlur = () => {
        // Clear the display state of markdown signs by passing `null` to `renderSigns`.
        renderSigns(null);
    };

    /**
     * Handles the `keyup` event and prevents the default action.
     * This is used to prevent the `Keyup` from affecting the active state of an HTML element.
     * 
     * @function
     * @param {KeyboardEvent} event - The keyboard event object.
     * @returns {void}
     */
    const handleKeyUp = (event) => {
        // Cancel the keyboard key release event, as this may affect the active state of the HTML element.
        event.preventDefault();
    };

    /**
     * 
     * @param {KeyboardEvent} event 
     * @returns {void}
     */
    const handleKeyDown = (event) => {
        if (!event.shiftKey && event.key === "Enter") {
            event.preventDefault();

            // Press Enter to create a new paragraph.
            insertAtCursor("\n\n\u200b");
            handleChange(-2);
        }

        if (event.shiftKey && event.key === "Enter") {
            event.preventDefault();
            insertAtCursor("\\\n\u200b");
            // TODO [DOING] Hold down Ctrl + Enter to wrap lines.
            // handleChange();
        }

        requestAnimationFrame(handleCursorMove);
    };

    /**
     * Handles the cursor movement and updates the rendering of markdown signs.
     * It identifies the element under the cursor and determines if it's a markdown inline or block element.
     * Based on that, it calls the appropriate rendering logic.
     * 
     * @function
     * @param {boolean} [compulsion=false] - A flag that controls whether the rendering is mandatory.
     * 
     * @returns {void}
     */
    const handleCursorMove = (compulsion = false) => {
        // Get the element under the cursor.
        const elementUnderCursor = getElementUnderCursor(editorElementRef.current);

        // Start by looking for the farthest `markdown-inline` element.
        let container = findFurthestElement(elementUnderCursor, ".md-i", true);

        if (!container) {
            // If no farthest `markdown-inline` element is found, look for the nearest `markdown-block` element.
            container = findClosestElement(elementUnderCursor, ".md-b", true);
        }

        // Controls whether the markdown sign is rendered based on the container found.
        renderSigns(container, compulsion);
    };

    useEffect(() => {
        (async () => {
            setContent(await parseMarkdownString(md));
        })();
    }, [md]);

    useEffect(() => {
        // It is possible that the `cursor` is null, so the default value is set.
        restoreCursorSelection(editorElementRef.current, cursor || { start: 0, end: 0 });
        // When the cursor moves, you can also control the display of the markdown sign.
        requestAnimationFrame(() => handleCursorMove(true));
    }, [cursor]);

    /**
     * Renders the sign display by toggling the "sign-display" class between the current container 
     * and the last element that had the "sign-display" class. The function now includes a `compulsion` 
     * parameter that forces the class to be applied even if the container is the same as the last one.
     * 
     * @param {Element} container - The DOM element that should receive the "sign-display" class.
     * @param {Boolean} [compulsion=false] - A flag that, when set to true, forces the sign-display update even 
     *      when the container is the same as the last one.
     * 
     * @example
     * // Rendering is not forced.
     * renderSigns(markdownElement);
     * 
     * // Forced rendering.
     * renderSigns(markdownElement, true);
     */
    function renderSigns(container, compulsion = false) {
        // Get the reference to the last element that had the "sign-display" class
        const lastElement = lastHasSignDisplayElementRef.current;

        // If `compulsion` is false and the container is the same as the last element or their textContent 
        // matches, do nothing
        if (!compulsion && (container === lastElement ||
            lastElement?.textContent === container?.textContent)) return;

        // Remove the "sign-display" class from the last element if it exists
        lastElement?.classList.remove("sign-display");
        // Add the "sign-display" class to the current container element
        container?.classList.add("sign-display");

        // Update the reference to the current container as the last element with the "sign-display" class
        lastHasSignDisplayElementRef.current = container || null;
    }

    return (
        <ContentEditable
            {...props}
            className={"markdwon-editor"}
            innerRef={editorElementRef}
            html={content}
            tagName={"div"}
            onChange={handleChange}
            onBlur={handleBlur}
            onKeyUp={handleKeyUp}
            onKeyDown={handleKeyDown}
            onMouseUp={() => requestAnimationFrame(handleCursorMove)} />
    );
});

export default MarkdownEditor;