import "./MarkdownEditor.scss";

import ContentEditable from "react-contenteditable";
import { memo, useEffect, useRef, useState } from "react";

import { parseMarkdownString, parseHTMLElement } from "../renderer/MarkdownRenderer";
import { saveCursorSelection, restoreCursorSelection } from "../utils/CursorUtils";
import { debounce } from "../utils/BaseUtils";

const MarkdownEditor = memo(({ md = "", ...props }) => {
    /** @type {React.RefObject<Node|null>} */
    const editorElementRef = useRef(null);
    /** @type {[content: String|null, setContent: React.Dispatch<React.SetStateAction<String|null>>]} */
    const [content, setContent] = useState(null);
    const [cursor, setCursor] = useState({ start: 0, end: 0 });

    const handleChange = debounce(async () => {
        const container = editorElementRef.current;

        // Save the cursor position before rendering.
        const selection = saveCursorSelection(container);

        // Restore the node back to a markdown string.
        const markdown = await parseHTMLElement(container);
        // Re-render markdown
        const html = await parseMarkdownString(markdown);
        setContent(html);

        setCursor(selection);
    }, 100);

    useEffect(() => {
        (async () => {
            setContent(await parseMarkdownString(md));
        })();
    }, [md]);

    useEffect(() => {
        restoreCursorSelection(editorElementRef.current, cursor);
    }, [cursor]);

    return (
        <ContentEditable
            {...props}
            className={"markdwon-editor"}
            innerRef={editorElementRef}
            html={content}
            tagName={"div"}
            onChange={handleChange} />
    );
});

export default MarkdownEditor;