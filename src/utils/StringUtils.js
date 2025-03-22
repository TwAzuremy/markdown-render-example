import { rules } from "../renderer/rules";

/**
 * Converts a space-separated string into camel case (hump case).
 * The first letter of each word is capitalized except the first word.
 * 
 * @param {String} spacesSeparatedName - The space-separated string to convert.
 * @returns {String} The converted camel case string.
 * 
 * @example
 * const helloWorld = spacesSeparatedToHump("hello world");
 */
export function spacesSeparatedToHump(spacesSeparatedName) {
    return spacesSeparatedName
        .replace(/(?:^\w|[A-Z]|\b\w)/g, (match, index) => index === 0 ? match : match.toUpperCase())
        .replace(/\s+/g, '');
}

/**
 * Repeats a string a given number of times, separated by a specified separator.
 * 
 * @param {String} str - The string to repeat.
 * @param {Number} times - The number of times to repeat the string.
 * @param {String} [separator=""] - The separator to insert between repeated strings (defaults to an empty string).
 * @returns {String} The repeated string joined by the separator.
 * 
 * @example
 * const result = repeatWithSeparator("hello", 3, " "); // "hello hello hello"
 */
export function repeatWithSeparator(str, times, separator = "") {
    return Array(times).fill(str).join(separator);
}

/**
 * Remove trailing 'c's. Equivalent to str.replace(/c*$/, '').
 * /c*$/ is vulnerable to REDOS.
 *
 * @param {String} str
 * @param {String} c
 * @param {Boolean} invert Remove suffix of non-c chars instead. Default falsey.
 */
export function rtrim(str, c, invert) {
    const l = str.length;
    if (l === 0) {
        return '';
    }

    // Length of suffix matching the invert condition.
    let suffLen = 0;

    // Step left until we fail to match the invert condition.
    while (suffLen < l) {
        const currChar = str.charAt(l - suffLen - 1);
        if (currChar === c && !invert) {
            suffLen++;
        } else if (currChar !== c && invert) {
            suffLen++;
        } else {
            break;
        }
    }

    return str.slice(0, l - suffLen);
}

/**
 * Merges consecutive blockquote lines, stripping the ">" character and connecting them with line breaks.
 * It preserves empty lines, and merges content lines that are part of the same blockquote.
 * 
 * @param {[String]} lines - An array of lines, potentially containing blockquote lines (prefixed with '>').
 * 
 * @returns {[String]} A new array with blockquote lines merged where applicable, while preserving empty lines.
 * 
 * @example
 * const lines = [
 *   '> This is a blockquote line 1.',
 *   '> This is a blockquote line 2.',
 *   '> ',
 *   '> This is a new blockquote line.'
 * ];
 * 
 * const merged = mergeQuoteBlocks(lines);
 * console.log(merged);
 * // Output: [
 * //   '> This is a blockquote line 1.##br##This is a blockquote line 2.',
 * //   '> ',
 * //   '> This is a new blockquote line.'
 * // ]
 */
export function mergeQuoteBlocks(lines) {
    const result = [];
    for (const line of lines) {
        // Check if the current line is empty or matches the empty blockquote pattern
        const isEmpty = rules.other.blockquoteLineIsEmpty.test(line);

        if (isEmpty) {
            result.push(line);
        } else {
            if (result.length > 0) {
                const lastLine = result[result.length - 1];
                const lastIsEmpty = rules.other.blockquoteLineIsEmpty.test(lastLine);

                if (!lastIsEmpty) {
                    // Merge content lines: Take out the parts that have been stripped of the ">" and connect them with line breaks
                    const lastContent = lastLine.slice(1);
                    const currentContent = line.slice(1).trimStart();

                    result[result.length - 1] = `>${lastContent}##br##${currentContent}`;

                    continue;
                }
            }

            // Add the current line as-is
            result.push(line);
        }
    }

    return result;
}