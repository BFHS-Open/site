import { jsx as _jsx, jsxs as _jsxs } from "/build/jsx-runtime.js#/jsx-runtime";
import Monitor from "./monitor.js";
import World from "./world.js";
import { makeTable } from "./objects/table.js";
const comp = _jsx("div", { id: "comp", class: "computer object", children: _jsx("div", { class: "screen", children: _jsxs("div", { class: "content", children: [_jsx("pre", { class: "output" }), _jsx("pre", { autofocus: true, class: "input empty", contenteditable: "plaintext-only", spellcheck: "false" })] }) }) });
const paper = _jsxs("div", { class: "paper object", children: [_jsx("h2", { children: "About the club" }), _jsx("p", { children: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum." }), _jsxs("p", { children: ["Officers:", _jsxs("ul", { children: [_jsx("li", { children: "Alice" }), _jsx("li", { children: "Bob" })] })] })] });
const world = new World(document.getElementById("world"), [
    {
        elem: makeTable({ width: 5 * 12, depth: 2 * 12, height: 2.5 * 12 }),
        transform: "",
    },
    {
        elem: comp,
        transform: "rotateX(-10deg) rotateY(-5deg) translate3d(3rem,35rem,0rem)",
    },
    {
        elem: paper,
        transform: "rotateX(-80deg) rotateY(5deg) translate3d(-5rem,28rem,-5rem)",
    },
]);
const monitor = new Monitor(comp);
monitor.boot();
//# sourceMappingURL=main.js.map