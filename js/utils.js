/**
 * @param {number} ms 
 * @returns {Promise<void>}
 */
export const sleep = (ms) => new Promise((res) => {
    setInterval(res, ms);
});

/**
 * @param {HTMLElement} elem 
 * @param {string} text 
 */
const type = (elem, text) => {
    const sel = window.getSelection();
    const content = elem.textContent;
    const [start, end] = [
        sel.anchorOffset * (sel.anchorNode === elem ? elem.textContent.length : 1),
        sel.focusOffset * (sel.focusNode === elem ? elem.textContent.length : 1),
    ].sort((a,b) => a - b);
    elem.textContent = content.slice(0, start) + text + content.slice(end);

    sel.removeAllRanges();
    const range = document.createRange();
    range.setStart(elem.childNodes[0], start + text.length);
    range.setEnd(elem.childNodes[0], start + text.length);
    sel.addRange(range);

    elem.dispatchEvent(new Event("input"));
};

/**
 * For Firefox.
 * Based on https://stackoverflow.com/a/64001839
 * @param { HTMLElement } elem
 */
export const polyfillPlaintextOnly = (elem) => {
    if (elem.contentEditable === "plaintext-only") return;

    elem.contentEditable = "true";
    elem.addEventListener("keydown", function(e) {
        if (e.key !== "Enter") return;
        e.preventDefault();
    });
    elem.addEventListener("paste", function(e) {
        e.preventDefault();
        type(this, e.clipboardData.getData("text/plain"));
    });
    // fixes Firefox inserting a <br>
    elem.addEventListener("input", function(e) {
        if (this.children.length === 0) return;
        this.textContent = "";
    });
    if (elem.autofocus) {
        elem.focus();
    }
};