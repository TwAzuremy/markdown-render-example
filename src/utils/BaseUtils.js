/**
 * Debounce function: Ensure that the callback function is executed after the event is triggered after a specified delay period has elapsed to prevent frequent triggering.
 * 
 * @param {Function} fn The callback function to be executed, which is called by the debounce function when the delay time has elapsed.
 * @param {Number} delay The debounce delay time, measured in milliseconds, indicates the wait time for the triggering function.
 * @returns {Function} A new function is returned, which is called with debounce.
 * 
 * @example
 * const debouncedFunc = debounce(() => {}, 100);
 */
export function debounce(fn, delay) {
    let timeoutId;

    return function (...args) {
        clearTimeout(timeoutId);

        timeoutId = setTimeout(() => {
            fn.apply(this, args);
        }, delay);
    };
}