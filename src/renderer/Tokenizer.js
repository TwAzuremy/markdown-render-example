import { rtrim } from "../utils/StringUtils";
import { rules } from "./rules";

export const tokenizer = {
    blockquote(src) {
        const cap = this.rules.block.blockquote.exec(src);
        if (cap) {
            let lines = rtrim(cap[0], '\n').split('\n');
            let raw = '';
            let text = '';
            const tokens = [];

            while (lines.length > 0) {
                let inBlockquote = false;
                const currentLines = [];

                let i;
                for (i = 0; i < lines.length; i++) {
                    if (this.rules.other.blockquoteStart.test(lines[i])) {
                        const [isEmpty, lastIsEmpty, hasZeroWiseSpace] = [
                            rules.other.blockquoteLineIsEmpty.test(lines[i]),
                            rules.other.blockquoteLineIsEmpty.test(currentLines[i - 1]),
                            rules.other.blockquoteLineHasZeroWideSpace.test(lines[i])
                        ];

                        if (isEmpty) {
                            currentLines.push('> ');
                        } else if (hasZeroWiseSpace) {
                            currentLines.push('> $\u200b$');
                        } else {
                            !lastIsEmpty && currentLines[i - 1] ?
                                (currentLines[i - 1] += "\\\n" + lines[i]) :
                                currentLines.push(lines[i]);
                        }

                        inBlockquote = true;
                    } else if (!inBlockquote) {
                        currentLines.push(lines[i]);
                    } else {
                        break;
                    }
                }

                lines = lines.slice(i);

                const currentRaw = currentLines.join('\n');
                const currentText = currentRaw
                    .replace(this.rules.other.blockquoteSetextReplace, '\n    $1')
                    .replace(this.rules.other.blockquoteSetextReplace2, '');
                raw = raw ? `${raw}\n${currentRaw}` : currentRaw;
                text = text ? `${text}\n${currentText}` : currentText;

                const top = this.lexer.state.top;
                this.lexer.state.top = true;
                this.lexer.blockTokens(currentText, tokens, true);
                this.lexer.state.top = top;

                if (lines.length === 0) {
                    break;
                }

                const lastToken = tokens.at(-1);

                if (lastToken?.type === 'code') {
                    break;
                } else if (lastToken?.type === 'blockquote') {
                    const oldToken = lastToken;
                    const newText = oldToken.raw + '\n' + lines.join('\n');
                    const newToken = this.blockquote(newText);
                    tokens[tokens.length - 1] = newToken;

                    raw = raw.substring(0, raw.length - oldToken.raw.length) + newToken.raw;
                    text = text.substring(0, text.length - oldToken.text.length) + newToken.text;
                    break;
                } else if (lastToken?.type === 'list') {
                    const oldToken = lastToken;
                    const newText = oldToken.raw + '\n' + lines.join('\n');
                    const newToken = this.list(newText);
                    tokens[tokens.length - 1] = newToken;

                    raw = raw.substring(0, raw.length - lastToken.raw.length) + newToken.raw;
                    text = text.substring(0, text.length - oldToken.raw.length) + newToken.raw;
                    lines = newText.substring(tokens.at(-1).raw.length).split('\n');
                    continue;
                }
            }

            return {
                type: 'blockquote',
                raw,
                tokens,
                text
            };
        }
    }
};