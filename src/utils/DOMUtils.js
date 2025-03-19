/**
 * Finds the nearest ancestor element that matches the specified CSS selector, starting from the given element.
 * Optionally includes the element itself and stops at a given boundary element.
 * 
 * @param {Element} element - The starting element to begin the search.
 * @param {String} selector - The CSS selector to match the ancestor element.
 * @param {Boolean} [isIncludeYourself=false] - Whether to include the starting element in the search.
 * @param {String} [limitSelector="#root"] - The CSS selector of the boundary element to limit the search range.
 * @returns {Element|null} The nearest matching element or null if no match is found.
 * 
 * @example
 * const closestBtn = findClosestElement(targetElement, '.btn');
 */
export function findClosestElement(element, selector, isIncludeYourself = false, limitSelector = "#root") {
    // If element or selector is not provided, return null
    if (!element || !selector) return null;

    // Get the limit element that constrains the search
    const limitElement = document.querySelector(limitSelector);
    let current = element;

    // Check if the starting element matches the selector (if included)
    if (isIncludeYourself && current.matches(selector)) {
        return current;
    }

    // Traverse upwards through the parent elements
    current = current.parentElement;

    while (current) {
        // Stop the search if we reach the limit element
        if (limitElement && current === limitElement) {
            return null;
        }

        // Return the current element if it matches the selector
        if (current.matches(selector)) {
            return current;
        }

        // Move to the next parent element
        current = current.parentElement;
    }

    // Return null if no matching element is found
    return null;
}

/**
 * Finds the furthest ancestor element that matches the specified CSS selector, starting from the given element.
 * Optionally includes the element itself and stops at a given boundary element.
 * 
 * @param {Element} element - The starting element to begin the search.
 * @param {String} selector - The CSS selector to match the ancestor element.
 * @param {Boolean} [isIncludeYourself=false] - Whether to include the starting element in the search.
 * @param {String} [limitSelector="#root"] - The CSS selector of the boundary element to limit the search range.
 * @returns {Element|null} The furthest matching ancestor element or null if no match is found.
 * 
 * @example
 * const furthestBtn = findFurthestElement(targetElement, '.btn');
 */
export function findFurthestElement(element, selector, isIncludeYourself = false, limitSelector = "#root") {
    // If element or selector is not provided, return null
    if (!element || !selector) return null;

    // Get the limit element that constrains the search
    const limitElement = document.querySelector(limitSelector);
    const candidates = [];
    let current = element;

    // If isIncludeYourself is true and the current element matches the selector, include it
    if (isIncludeYourself && current.matches(selector)) {
        candidates.push(current);
    }

    // Start traversing upwards from the parent element
    current = current.parentElement;

    while (current) {
        // Collect the matching elements
        if (current.matches(selector)) {
            candidates.push(current);
        }

        // Stop the search if the limit element is reached
        if (limitElement && current === limitElement) {
            break;
        }

        // Move to the next parent element
        current = current.parentElement;
    }

    // Return the last matching element (furthest ancestor)
    return candidates.length > 0 ? candidates.pop() : null;
}