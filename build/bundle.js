/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ "./js/cpu/computer.ts":
/*!****************************!*\
  !*** ./js/cpu/computer.ts ***!
  \****************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   Computer: () => (/* binding */ Computer)
/* harmony export */ });
/* harmony import */ var _programs_help__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./programs/help */ "./js/cpu/programs/help.ts");
/* harmony import */ var _programs_color__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./programs/color */ "./js/cpu/programs/color.ts");
/* harmony import */ var _programs_fs__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./programs/fs */ "./js/cpu/programs/fs.ts");
/* harmony import */ var _filesystem__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./filesystem */ "./js/cpu/filesystem.ts");




class Computer {
    monitor;
    programs;
    filesystem;
    constructor(monitor) {
        this.monitor = monitor;
        this.programs = new Map(Object.entries({
            help: _programs_help__WEBPACK_IMPORTED_MODULE_0__["default"],
            color: _programs_color__WEBPACK_IMPORTED_MODULE_1__["default"],
            mkdir: _programs_fs__WEBPACK_IMPORTED_MODULE_2__.mkdir,
            touch: _programs_fs__WEBPACK_IMPORTED_MODULE_2__.touch,
            cat: _programs_fs__WEBPACK_IMPORTED_MODULE_2__.cat,
            "write-file": _programs_fs__WEBPACK_IMPORTED_MODULE_2__.writeFile,
            ls: _programs_fs__WEBPACK_IMPORTED_MODULE_2__.ls,
        }));
        this.filesystem = new _filesystem__WEBPACK_IMPORTED_MODULE_3__.Filesystem();
    }
    async init() {
        await this.filesystem.init();
    }
    async run(str) {
        const res = str.trim().split(/\s+/u);
        if (res[0] === "")
            return;
        const cmd = res[0];
        if (this.programs.has(cmd)) {
            await this.programs.get(cmd)({ out: (...args) => this.monitor.print(...args), monitor: this.monitor }, res);
            return;
        }
        this.monitor.print(`Unrecognized command "${cmd}"\n`);
    }
}


/***/ }),

/***/ "./js/cpu/filesystem.ts":
/*!******************************!*\
  !*** ./js/cpu/filesystem.ts ***!
  \******************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   Filesystem: () => (/* binding */ Filesystem)
/* harmony export */ });
const promisify = (req) => new Promise((res, rej) => {
    req.addEventListener("success", function () {
        res(this.result);
    });
    req.addEventListener("error", function () {
        alert(this.error);
        rej(this.error);
        // TODO: error handling
    });
});
const parse = (path) => {
    return path.trim().split("/").filter((name) => name !== "");
};
class Filesystem {
    root;
    db;
    async init() {
        const request = window.indexedDB.open("filesystem", 1);
        request.addEventListener("upgradeneeded", async function () {
            const db = this.result;
            const info = db.createObjectStore("info");
            const files = db.createObjectStore("files", { autoIncrement: true });
            const req = files.add({
                type: "dir",
                entrys: {},
            });
            info.put(await promisify(req), "root");
        });
        this.db = await promisify(request);
        this.root = await promisify(this.db.transaction("info").objectStore("info").get("root"));
    }
    async walk(base, names) {
        for (const name of names) {
            const req = this.db.transaction("files").objectStore("files").get(base);
            const entry = await promisify(req);
            if (entry.type !== "dir")
                throw "not a directory";
            if (!(name in entry.entrys))
                throw "doesn't exist";
            base = entry.entrys[name];
        }
        return base;
    }
    async makeDir(path) {
        const names = parse(path);
        if (names.length === 0)
            throw "no name specified";
        const target = names.pop();
        const dir = await this.walk(this.root, names);
        const entry = await promisify(this.db.transaction("files").objectStore("files").get(dir));
        if (entry.type !== "dir")
            throw "not a directory";
        if (target in entry.entrys)
            throw "item already exists";
        const request = this.db.transaction("files", "readwrite").objectStore("files").add({
            type: "dir",
            entrys: {},
        });
        entry.entrys[target] = await promisify(request);
        await promisify(this.db.transaction("files", "readwrite").objectStore("files").put(entry, dir));
    }
    async makeFile(path) {
        const names = parse(path);
        if (names.length === 0)
            throw "no name specified";
        const target = names.pop();
        const dir = await this.walk(this.root, names);
        const entry = await promisify(this.db.transaction("files").objectStore("files").get(dir));
        if (entry.type !== "dir")
            throw "not a directory";
        if (target in entry.entrys)
            throw "item already exists";
        const request = this.db.transaction("files", "readwrite").objectStore("files").add({
            type: "file",
            contents: "",
        });
        entry.entrys[target] = await promisify(request);
        await promisify(this.db.transaction("files", "readwrite").objectStore("files").put(entry, dir));
    }
    async readFile(path) {
        const names = parse(path);
        const target = await this.walk(this.root, names);
        const entry = await promisify(this.db.transaction("files").objectStore("files").get(target));
        if (entry.type !== "file")
            throw "not a file";
        return entry.contents;
    }
    async writeFile(path, contents) {
        const names = parse(path);
        if (names.length === 0)
            throw "no name specified";
        const target = await this.walk(this.root, names);
        await promisify(this.db.transaction("files", "readwrite").objectStore("files").put({
            type: "file",
            contents,
        }, target));
    }
    async readDir(path) {
        const names = parse(path);
        const target = await this.walk(this.root, names);
        const entry = await promisify(this.db.transaction("files").objectStore("files").get(target));
        if (entry.type !== "dir")
            throw "not a directory";
        return entry.entrys;
    }
}


/***/ }),

/***/ "./js/cpu/programs/color.ts":
/*!**********************************!*\
  !*** ./js/cpu/programs/color.ts ***!
  \**********************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (async (sys, argv) => {
    const hue = argv[1] === undefined ? Math.random() : +argv[1] / 360;
    if (!Number.isFinite(hue)) {
        sys.out(`Invalid hue angle "${argv[1]}"\n`);
        return;
    }
    sys.monitor.root.style.setProperty("--screen-color", `hsl(${hue ?? Math.random()}turn 100% 50%)`);
});


/***/ }),

/***/ "./js/cpu/programs/fs.ts":
/*!*******************************!*\
  !*** ./js/cpu/programs/fs.ts ***!
  \*******************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   cat: () => (/* binding */ cat),
/* harmony export */   ls: () => (/* binding */ ls),
/* harmony export */   mkdir: () => (/* binding */ mkdir),
/* harmony export */   touch: () => (/* binding */ touch),
/* harmony export */   writeFile: () => (/* binding */ writeFile)
/* harmony export */ });
const mkdir = async (sys, argv) => {
    if (argv.length < 2) {
        sys.out("need argument\n");
        return;
    }
    try {
        await sys.monitor.computer.filesystem.makeDir(argv[1]);
    }
    catch (err) {
        sys.out(`${err}\n`);
        return;
    }
};
const touch = async (sys, argv) => {
    if (argv.length < 2) {
        sys.out("need argument\n");
        return;
    }
    try {
        await sys.monitor.computer.filesystem.makeFile(argv[1]);
    }
    catch (err) {
        sys.out(`${err}\n`);
        return;
    }
};
const cat = async (sys, argv) => {
    if (argv.length < 2) {
        sys.out("need argument\n");
        return;
    }
    try {
        sys.out(await sys.monitor.computer.filesystem.readFile(argv[1]));
    }
    catch (err) {
        sys.out(`${err}\n`);
        return;
    }
};
const writeFile = async (sys, argv) => {
    if (argv.length < 3) {
        sys.out("need 2 arguments\n");
        return;
    }
    try {
        await sys.monitor.computer.filesystem.writeFile(argv[1], argv[2] + "\n");
    }
    catch (err) {
        sys.out(`${err}\n`);
        return;
    }
};
const listing = (entrys) => {
    return Object.keys(entrys).map(s => s + "\n").join("");
};
const ls = async (sys, argv) => {
    try {
        sys.out(listing(await sys.monitor.computer.filesystem.readDir(argv[1] ?? "/")));
    }
    catch (err) {
        sys.out(`${err}\n`);
        return;
    }
};


/***/ }),

/***/ "./js/cpu/programs/help.ts":
/*!*********************************!*\
  !*** ./js/cpu/programs/help.ts ***!
  \*********************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (async (sys, argv) => {
    sys.out(`WIP sorry :(\nTry "color [deg]"!\n`);
});


/***/ }),

/***/ "./js/jsx-runtime.ts":
/*!***************************!*\
  !*** ./js/jsx-runtime.ts ***!
  \***************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   Fragment: () => (/* binding */ Fragment),
/* harmony export */   jsx: () => (/* binding */ jsx),
/* harmony export */   jsxs: () => (/* binding */ jsx)
/* harmony export */ });
/*
originally used at https://github.com/tobspr-games/shapez-community-edition/pull/12/commits/56330a1433e81a260be66648f90df77c8172308f
relicensed by me, the original author
*/
function isDisplayed(node) {
    return typeof node !== "boolean" && node != null;
}
function jsx(tag, props) {
    if (typeof tag === "function")
        return tag(props);
    const { children, ...attrs } = props;
    const element = document.createElement(tag);
    Object.entries(attrs).forEach(([key, value]) => {
        switch (typeof value) {
            case "boolean":
                if (!value)
                    return;
                return element.setAttribute(key, "");
            case "number":
            case "string":
                return element.setAttribute(key, `${value}`);
        }
        throw new TypeError("JSX element attribute assigned invalid type");
    });
    element.append(...[children].flat(Infinity).filter(isDisplayed));
    return element;
}
// functional component, called indirectly as `jsx(Fragment, props)`
/**
 * Groups elements without introducing a parent element.
 */
const Fragment = (props) => props.children;
// jsxs is used when there are multiple children



/***/ }),

/***/ "./js/monitor.ts":
/*!***********************!*\
  !*** ./js/monitor.ts ***!
  \***********************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ Monitor)
/* harmony export */ });
/* harmony import */ var _cpu_computer__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./cpu/computer */ "./js/cpu/computer.ts");
/* harmony import */ var _utils__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./utils */ "./js/utils.ts");


const text1 = `Welcome to the

██████╗░███████╗██╗░░██╗░██████╗
██╔══██╗██╔════╝██║░░██║██╔════╝
██████╦╝█████╗░░███████║╚█████╗░
██╔══██╗██╔══╝░░██╔══██║░╚═══██╗
██████╦╝██║░░░░░██║░░██║██████╔╝
╚═════╝░╚═╝░░░░░╚═╝░░╚═╝╚═════╝░

░█████╗░░██████╗  ░█████╗░██╗░░░░░██╗░░░██╗██████╗░██╗
██╔══██╗██╔════╝  ██╔══██╗██║░░░░░██║░░░██║██╔══██╗██║
██║░░╚═╝╚█████╗░  ██║░░╚═╝██║░░░░░██║░░░██║██████╦╝██║
██║░░██╗░╚═══██╗  ██║░░██╗██║░░░░░██║░░░██║██╔══██╗╚═╝
╚█████╔╝██████╔╝  ╚█████╔╝███████╗╚██████╔╝██████╦╝██╗
░╚════╝░╚═════╝░  ░╚════╝░╚══════╝░╚═════╝░╚═════╝░╚═╝
`;
const text1s = `Welcome to the

█▄▄ █▀▀ █░█ █▀
█▄█ █▀░ █▀█ ▄█

█▀▀ █▀  █▀▀ █░░ █░█ █▄▄ █
█▄▄ ▄█  █▄▄ █▄▄ █▄█ █▄█ ▄
`;
const text2 = `
Run "help" on this awful terminal
or click on the paper to look down!

> `;
class Monitor {
    root;
    screen;
    content;
    output;
    input;
    computer;
    constructor(root) {
        this.root = root;
        this.screen = root.getElementsByClassName("screen")[0];
        this.content = root.getElementsByClassName("content")[0];
        this.output = root.getElementsByClassName("output")[0];
        this.input = root.getElementsByClassName("input")[0];
        this.computer = new _cpu_computer__WEBPACK_IMPORTED_MODULE_0__.Computer(this);
        const self = this;
        (0,_utils__WEBPACK_IMPORTED_MODULE_1__.polyfillPlaintextOnly)(this.input);
        this.root.addEventListener("click", function (e) {
            if (window.getSelection().isCollapsed)
                self.input.focus();
        });
        this.input.addEventListener("focus", function (e) {
            window.getSelection().selectAllChildren(this);
            window.getSelection().collapseToEnd();
        });
        this.input.addEventListener("keydown", async function (e) {
            if (e.key !== "Enter")
                return;
            e.preventDefault();
            self.print(this.textContent + "\n");
            const str = this.textContent;
            this.textContent = "";
            await self.computer.run(str);
            self.print("> ");
            this.classList.add("empty");
        });
        this.input.addEventListener("input", function (e) {
            if (this.textContent.length === 0) {
                this.classList.add("empty");
            }
            else {
                this.classList.remove("empty");
            }
        });
    }
    print(str) {
        this.output.insertAdjacentText("beforeend", str);
        this.content.scrollTop = this.content.scrollHeight;
    }
    async boot() {
        await this.computer.init();
        await (0,_utils__WEBPACK_IMPORTED_MODULE_1__.sleep)(800);
        const size = parseFloat(window.getComputedStyle(document.documentElement).fontSize);
        this.print(size < 76 ? text1s : text1);
        await (0,_utils__WEBPACK_IMPORTED_MODULE_1__.sleep)(1300);
        this.print(text2);
    }
}


/***/ }),

/***/ "./js/objects/table.tsx":
/*!******************************!*\
  !*** ./js/objects/table.tsx ***!
  \******************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   makeTable: () => (/* binding */ makeTable)
/* harmony export */ });
/* harmony import */ var root_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! root/jsx-runtime */ "./js/jsx-runtime.ts");
/* harmony import */ var _utils__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../utils */ "./js/utils.ts");


const thick = 1;
const makeLeg = ({ x, y, height }) => {
    return (0,root_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)("div", { class: "group", style: (0,_utils__WEBPACK_IMPORTED_MODULE_1__.makeStyle)({ pos: `translate3d(${x}rem,0,${y}rem)` }), children: [(0,root_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("div", { class: "object", style: (0,_utils__WEBPACK_IMPORTED_MODULE_1__.makeStyle)({ color: "#261a0d", width: thick, height: height - thick, pos: `translateX(${thick / 2}rem) rotateY(90deg)` }) }), (0,root_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("div", { class: "object", style: (0,_utils__WEBPACK_IMPORTED_MODULE_1__.makeStyle)({ color: "#261a0d", width: thick, height: height - thick, pos: `translateZ(${thick / 2}rem)` }) }), (0,root_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("div", { class: "object", style: (0,_utils__WEBPACK_IMPORTED_MODULE_1__.makeStyle)({ color: "#261a0d", width: thick, height: height - thick, pos: `translateX(${-thick / 2}rem) rotateY(-90deg)` }) }), (0,root_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("div", { class: "object", style: (0,_utils__WEBPACK_IMPORTED_MODULE_1__.makeStyle)({ color: "#261a0d", width: thick, height: height - thick, pos: `translateZ(${-thick / 2}rem) rotateY(180deg)` }) })] });
};
const makeTable = ({ width, depth, height }) => {
    return (0,root_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)("div", { class: "group", style: (0,_utils__WEBPACK_IMPORTED_MODULE_1__.makeStyle)({ pos: "translate3d(0,0,0)" }), children: [(0,root_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)("div", { class: "group", style: (0,_utils__WEBPACK_IMPORTED_MODULE_1__.makeStyle)({ pos: `translateY(${(-height + thick) / 2}rem)` }), children: [makeLeg({ x: width / 2 - thick * 2, y: depth / 2 - thick * 2, height }), makeLeg({ x: -width / 2 + thick * 2, y: depth / 2 - thick * 2, height }), makeLeg({ x: -width / 2 + thick * 2, y: -depth / 2 + thick * 2, height }), makeLeg({ x: width / 2 - thick * 2, y: -depth / 2 + thick * 2, height })] }), (0,root_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)("div", { class: "group", style: (0,_utils__WEBPACK_IMPORTED_MODULE_1__.makeStyle)({ pos: `translateY(${-height + thick / 2}rem)` }), children: [(0,root_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("div", { class: "object", style: (0,_utils__WEBPACK_IMPORTED_MODULE_1__.makeStyle)({ color: "#5e3d19", width, height: depth, pos: `translateY(${-thick / 2}rem) rotateX(90deg)` }) }), (0,root_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("div", { class: "object", style: (0,_utils__WEBPACK_IMPORTED_MODULE_1__.makeStyle)({ color: "#261a0d", width, height: depth, pos: `translateY(${thick / 2}rem) rotateX(90deg)` }) }), (0,root_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("div", { class: "object", style: (0,_utils__WEBPACK_IMPORTED_MODULE_1__.makeStyle)({ color: "#493117", width, height: thick, pos: `translateZ(${depth / 2}rem)` }) }), (0,root_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("div", { class: "object", style: (0,_utils__WEBPACK_IMPORTED_MODULE_1__.makeStyle)({ color: "#493117", width, height: thick, pos: `rotateY(180deg) translateZ(${depth / 2}rem)` }) }), (0,root_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("div", { class: "object", style: (0,_utils__WEBPACK_IMPORTED_MODULE_1__.makeStyle)({ color: "#493117", width: depth, height: thick, pos: `rotateY(90deg) translateZ(${width / 2}rem)` }) }), (0,root_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("div", { class: "object", style: (0,_utils__WEBPACK_IMPORTED_MODULE_1__.makeStyle)({ color: "#493117", width: depth, height: thick, pos: `rotateY(-90deg) translateZ(${width / 2}rem)` }) })] })] });
};


/***/ }),

/***/ "./js/utils.ts":
/*!*********************!*\
  !*** ./js/utils.ts ***!
  \*********************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   makeStyle: () => (/* binding */ makeStyle),
/* harmony export */   polyfillPlaintextOnly: () => (/* binding */ polyfillPlaintextOnly),
/* harmony export */   sleep: () => (/* binding */ sleep)
/* harmony export */ });
const sleep = (ms) => new Promise((res) => {
    setInterval(res, ms);
});
const type = (elem, text) => {
    const sel = window.getSelection();
    const content = elem.textContent;
    const [start, end] = [
        sel.anchorOffset * (sel.anchorNode === elem ? content.length : 1),
        sel.focusOffset * (sel.focusNode === elem ? content.length : 1),
    ].sort((a, b) => a - b);
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
 */
const polyfillPlaintextOnly = (elem) => {
    if (elem.contentEditable === "plaintext-only")
        return;
    elem.contentEditable = "true";
    elem.addEventListener("keydown", function (e) {
        if (e.key !== "Enter")
            return;
        e.preventDefault();
    });
    elem.addEventListener("paste", function (e) {
        e.preventDefault();
        type(this, e.clipboardData.getData("text/plain"));
    });
    // fixes Firefox inserting a <br>
    elem.addEventListener("input", function (e) {
        if (this.children.length === 0)
            return;
        this.textContent = "";
    });
    if (elem.autofocus) {
        elem.focus();
    }
};
const makeStyle = ({ color = "transparent", width = 0, height = 0, pos, center = true }) => {
    return `
        background-color: ${color};
        width: ${width}rem;
        height: ${height}rem;
        transform: ${center ? "translate(-50%,-50%)" : ""} ${pos}`;
};


/***/ }),

/***/ "./js/world.ts":
/*!*********************!*\
  !*** ./js/world.ts ***!
  \*********************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ World)
/* harmony export */ });
class World {
    root;
    selected;
    defaultTransform;
    constructor(root, objects) {
        this.root = root;
        const self = this;
        for (const { elem, transform } of objects) {
            this.root.appendChild(elem);
            if (transform == null)
                continue;
            elem.style.pointerEvents = "all";
            elem.addEventListener("click", function (e) {
                if (this === self.selected)
                    return;
                if (self.selected != null)
                    self.selected.classList.remove("selected");
                self.selected = this;
                self.selected.classList.add("selected");
                self.root.style.transform = transform;
            });
        }
        this.defaultTransform = this.root.style.transform;
        document.addEventListener("keydown", function (e) {
            if (e.key != "Escape")
                return;
            e.stopPropagation();
            if (self.selected != null)
                self.selected.classList.remove("selected");
            self.selected = undefined;
            self.root.style.transform = self.defaultTransform;
        });
    }
}


/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/define property getters */
/******/ 	(() => {
/******/ 		// define getter functions for harmony exports
/******/ 		__webpack_require__.d = (exports, definition) => {
/******/ 			for(var key in definition) {
/******/ 				if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 					Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 				}
/******/ 			}
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	(() => {
/******/ 		__webpack_require__.o = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop))
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	(() => {
/******/ 		// define __esModule on exports
/******/ 		__webpack_require__.r = (exports) => {
/******/ 			if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 				Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 			}
/******/ 			Object.defineProperty(exports, '__esModule', { value: true });
/******/ 		};
/******/ 	})();
/******/ 	
/************************************************************************/
var __webpack_exports__ = {};
// This entry need to be wrapped in an IIFE because it need to be isolated against other modules in the chunk.
(() => {
/*!*********************!*\
  !*** ./js/main.tsx ***!
  \*********************/
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var root_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! root/jsx-runtime */ "./js/jsx-runtime.ts");
/* harmony import */ var _monitor__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./monitor */ "./js/monitor.ts");
/* harmony import */ var _world__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./world */ "./js/world.ts");
/* harmony import */ var _objects_table__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./objects/table */ "./js/objects/table.tsx");




const comp = (0,root_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("div", { id: "comp", class: "computer object", children: (0,root_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("div", { class: "screen", children: (0,root_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)("div", { class: "content", children: [(0,root_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("pre", { class: "output" }), (0,root_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("pre", { autofocus: true, class: "input empty", contenteditable: "plaintext-only", spellcheck: "false" })] }) }) });
const paper = (0,root_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)("div", { class: "paper object", children: [(0,root_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("h2", { children: "About the club" }), (0,root_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("p", { children: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum." }), (0,root_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)("p", { children: ["Officers:", (0,root_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)("ul", { children: [(0,root_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("li", { children: "Alice" }), (0,root_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("li", { children: "Bob" })] })] })] });
const world = new _world__WEBPACK_IMPORTED_MODULE_2__["default"](document.getElementById("world"), [
    {
        elem: (0,_objects_table__WEBPACK_IMPORTED_MODULE_3__.makeTable)({ width: 5 * 12, depth: 2 * 12, height: 2.5 * 12 }),
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
const monitor = new _monitor__WEBPACK_IMPORTED_MODULE_1__["default"](comp);
monitor.boot();

})();

/******/ })()
;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,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SUFDTCxJQUNGLENBQUM7QUFFUCxNQUFNLEtBQUssR0FBRyxJQUFJLDhDQUFLLENBQUMsUUFBUSxDQUFDLGNBQWMsQ0FBQyxPQUFPLENBQUUsRUFBRTtJQUN2RDtRQUNJLElBQUksRUFBRSx5REFBUyxDQUFDLEVBQUUsS0FBSyxFQUFFLENBQUMsR0FBQyxFQUFFLEVBQUUsS0FBSyxFQUFFLENBQUMsR0FBQyxFQUFFLEVBQUUsTUFBTSxFQUFFLEdBQUcsR0FBQyxFQUFFLEVBQUUsQ0FBQztRQUM3RCxTQUFTLEVBQUUsRUFBRTtLQUNoQjtJQUNEO1FBQ0ksSUFBSSxFQUFFLElBQUk7UUFDVixTQUFTLEVBQUUsNkRBQTZEO0tBQzNFO0lBQ0Q7UUFDSSxJQUFJLEVBQUUsS0FBSztRQUNYLFNBQVMsRUFBRSw4REFBOEQ7S0FDNUU7Q0FDSixDQUFDLENBQUM7QUFFSCxNQUFNLE9BQU8sR0FBRyxJQUFJLGdEQUFPLENBQUMsSUFBSSxDQUFDLENBQUM7QUFDbEMsT0FBTyxDQUFDLElBQUksRUFBRSxDQUFDIiwic291cmNlcyI6WyJ3ZWJwYWNrOi8vYmVuLXNpdGUvLi9qcy9jcHUvY29tcHV0ZXIudHMiLCJ3ZWJwYWNrOi8vYmVuLXNpdGUvLi9qcy9jcHUvZmlsZXN5c3RlbS50cyIsIndlYnBhY2s6Ly9iZW4tc2l0ZS8uL2pzL2NwdS9wcm9ncmFtcy9jb2xvci50cyIsIndlYnBhY2s6Ly9iZW4tc2l0ZS8uL2pzL2NwdS9wcm9ncmFtcy9mcy50cyIsIndlYnBhY2s6Ly9iZW4tc2l0ZS8uL2pzL2NwdS9wcm9ncmFtcy9oZWxwLnRzIiwid2VicGFjazovL2Jlbi1zaXRlLy4vanMvanN4LXJ1bnRpbWUudHMiLCJ3ZWJwYWNrOi8vYmVuLXNpdGUvLi9qcy9tb25pdG9yLnRzIiwid2VicGFjazovL2Jlbi1zaXRlLy4vanMvb2JqZWN0cy90YWJsZS50c3giLCJ3ZWJwYWNrOi8vYmVuLXNpdGUvLi9qcy91dGlscy50cyIsIndlYnBhY2s6Ly9iZW4tc2l0ZS8uL2pzL3dvcmxkLnRzIiwid2VicGFjazovL2Jlbi1zaXRlL3dlYnBhY2svYm9vdHN0cmFwIiwid2VicGFjazovL2Jlbi1zaXRlL3dlYnBhY2svcnVudGltZS9kZWZpbmUgcHJvcGVydHkgZ2V0dGVycyIsIndlYnBhY2s6Ly9iZW4tc2l0ZS93ZWJwYWNrL3J1bnRpbWUvaGFzT3duUHJvcGVydHkgc2hvcnRoYW5kIiwid2VicGFjazovL2Jlbi1zaXRlL3dlYnBhY2svcnVudGltZS9tYWtlIG5hbWVzcGFjZSBvYmplY3QiLCJ3ZWJwYWNrOi8vYmVuLXNpdGUvLi9qcy9tYWluLnRzeCJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgdHlwZSBNb25pdG9yIGZyb20gXCIuLi9tb25pdG9yXCI7XHJcbmltcG9ydCB0eXBlIHsgUHJvZ3JhbSB9IGZyb20gXCIuL3Byb2dyYW1cIjtcclxuaW1wb3J0IGhlbHAgZnJvbSBcIi4vcHJvZ3JhbXMvaGVscFwiO1xyXG5pbXBvcnQgY29sb3IgZnJvbSBcIi4vcHJvZ3JhbXMvY29sb3JcIjtcclxuaW1wb3J0IHsgbWtkaXIsIHRvdWNoLCBjYXQsIHdyaXRlRmlsZSwgbHMgfSBmcm9tIFwiLi9wcm9ncmFtcy9mc1wiO1xyXG5pbXBvcnQgeyBGaWxlc3lzdGVtIH0gZnJvbSBcIi4vZmlsZXN5c3RlbVwiO1xyXG5cclxuZXhwb3J0IGNsYXNzIENvbXB1dGVyIHtcclxuICAgIHB1YmxpYyBtb25pdG9yOiBNb25pdG9yO1xyXG4gICAgcHVibGljIHByb2dyYW1zOiBNYXA8c3RyaW5nLCBQcm9ncmFtPjtcclxuICAgIHB1YmxpYyBmaWxlc3lzdGVtOiBGaWxlc3lzdGVtO1xyXG5cclxuICAgIGNvbnN0cnVjdG9yKG1vbml0b3I6IE1vbml0b3IpIHtcclxuICAgICAgICB0aGlzLm1vbml0b3IgPSBtb25pdG9yO1xyXG4gICAgICAgIHRoaXMucHJvZ3JhbXMgPSBuZXcgTWFwKE9iamVjdC5lbnRyaWVzKHtcclxuICAgICAgICAgICAgaGVscCxcclxuICAgICAgICAgICAgY29sb3IsXHJcbiAgICAgICAgICAgIG1rZGlyLFxyXG4gICAgICAgICAgICB0b3VjaCxcclxuICAgICAgICAgICAgY2F0LFxyXG4gICAgICAgICAgICBcIndyaXRlLWZpbGVcIjogd3JpdGVGaWxlLFxyXG4gICAgICAgICAgICBscyxcclxuICAgICAgICB9KSk7XHJcbiAgICAgICAgdGhpcy5maWxlc3lzdGVtID0gbmV3IEZpbGVzeXN0ZW0oKTtcclxuICAgIH1cclxuXHJcbiAgICBhc3luYyBpbml0KCkge1xyXG4gICAgICAgIGF3YWl0IHRoaXMuZmlsZXN5c3RlbS5pbml0KCk7XHJcbiAgICB9XHJcblxyXG4gICAgYXN5bmMgcnVuKHN0cjogc3RyaW5nKSB7XHJcbiAgICAgICAgY29uc3QgcmVzID0gc3RyLnRyaW0oKS5zcGxpdCgvXFxzKy91KTtcclxuICAgICAgICBpZiAocmVzWzBdID09PSBcIlwiKSByZXR1cm47XHJcblxyXG4gICAgICAgIGNvbnN0IGNtZCA9IHJlc1swXTtcclxuICAgICAgICBpZiAodGhpcy5wcm9ncmFtcy5oYXMoY21kKSkge1xyXG4gICAgICAgICAgICBhd2FpdCB0aGlzLnByb2dyYW1zLmdldChjbWQpISh7IG91dDogKC4uLmFyZ3MpID0+IHRoaXMubW9uaXRvci5wcmludCguLi5hcmdzKSwgbW9uaXRvcjogdGhpcy5tb25pdG9yIH0sIHJlcyk7XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHRoaXMubW9uaXRvci5wcmludChgVW5yZWNvZ25pemVkIGNvbW1hbmQgXCIke2NtZH1cIlxcbmApO1xyXG4gICAgfVxyXG59XHJcbiIsImltcG9ydCB7IERpciwgRW50cnkgfSBmcm9tIFwiLi9maWxlXCI7XHJcblxyXG5jb25zdCBwcm9taXNpZnkgPSA8VD4ocmVxOiBJREJSZXF1ZXN0PFQ+KSA9PiBuZXcgUHJvbWlzZTxUPigocmVzLCByZWopID0+IHtcclxuICAgIHJlcS5hZGRFdmVudExpc3RlbmVyKFwic3VjY2Vzc1wiLCBmdW5jdGlvbigpIHtcclxuICAgICAgICByZXModGhpcy5yZXN1bHQpO1xyXG4gICAgfSk7XHJcbiAgICByZXEuYWRkRXZlbnRMaXN0ZW5lcihcImVycm9yXCIsIGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIGFsZXJ0KHRoaXMuZXJyb3IpO1xyXG4gICAgICAgIHJlaih0aGlzLmVycm9yKTtcclxuICAgICAgICAvLyBUT0RPOiBlcnJvciBoYW5kbGluZ1xyXG4gICAgfSk7XHJcbn0pO1xyXG5cclxuY29uc3QgcGFyc2UgPSAocGF0aDogc3RyaW5nKSA9PiB7XHJcbiAgICByZXR1cm4gcGF0aC50cmltKCkuc3BsaXQoXCIvXCIpLmZpbHRlcigobmFtZSkgPT4gbmFtZSAhPT0gXCJcIik7XHJcbn07XHJcblxyXG5leHBvcnQgY2xhc3MgRmlsZXN5c3RlbSB7XHJcbiAgICBwdWJsaWMgcm9vdCE6IElEQlZhbGlkS2V5O1xyXG4gICAgcHVibGljIGRiITogSURCRGF0YWJhc2U7XHJcblxyXG4gICAgYXN5bmMgaW5pdCgpIHtcclxuICAgICAgICBjb25zdCByZXF1ZXN0ID0gd2luZG93LmluZGV4ZWREQi5vcGVuKFwiZmlsZXN5c3RlbVwiLCAxKTtcclxuICAgICAgICByZXF1ZXN0LmFkZEV2ZW50TGlzdGVuZXIoXCJ1cGdyYWRlbmVlZGVkXCIsIGFzeW5jIGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICBjb25zdCBkYiA9IHRoaXMucmVzdWx0O1xyXG4gICAgICAgICAgICBjb25zdCBpbmZvID0gZGIuY3JlYXRlT2JqZWN0U3RvcmUoXCJpbmZvXCIpO1xyXG4gICAgICAgICAgICBjb25zdCBmaWxlcyA9IGRiLmNyZWF0ZU9iamVjdFN0b3JlKFwiZmlsZXNcIiwgeyBhdXRvSW5jcmVtZW50OiB0cnVlIH0pXHJcblxyXG4gICAgICAgICAgICBjb25zdCByZXEgPSBmaWxlcy5hZGQoe1xyXG4gICAgICAgICAgICAgICAgdHlwZTogXCJkaXJcIixcclxuICAgICAgICAgICAgICAgIGVudHJ5czoge30sXHJcbiAgICAgICAgICAgIH0gc2F0aXNmaWVzIERpcik7XHJcbiAgICAgICAgICAgIGluZm8ucHV0KGF3YWl0IHByb21pc2lmeShyZXEpLCBcInJvb3RcIik7XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgdGhpcy5kYiA9IGF3YWl0IHByb21pc2lmeShyZXF1ZXN0KTtcclxuICAgICAgICB0aGlzLnJvb3QgPSBhd2FpdCBwcm9taXNpZnkodGhpcy5kYi50cmFuc2FjdGlvbihcImluZm9cIikub2JqZWN0U3RvcmUoXCJpbmZvXCIpLmdldChcInJvb3RcIikpO1xyXG4gICAgfVxyXG5cclxuICAgIGFzeW5jIHdhbGsoYmFzZTogSURCVmFsaWRLZXksIG5hbWVzOiBzdHJpbmdbXSkge1xyXG4gICAgICAgIGZvciAoY29uc3QgbmFtZSBvZiBuYW1lcykge1xyXG4gICAgICAgICAgICBjb25zdCByZXEgPSB0aGlzLmRiLnRyYW5zYWN0aW9uKFwiZmlsZXNcIikub2JqZWN0U3RvcmUoXCJmaWxlc1wiKS5nZXQoYmFzZSkgYXMgSURCUmVxdWVzdDxFbnRyeT47XHJcbiAgICAgICAgICAgIGNvbnN0IGVudHJ5ID0gYXdhaXQgcHJvbWlzaWZ5KHJlcSk7XHJcbiAgICAgICAgICAgIGlmIChlbnRyeS50eXBlICE9PSBcImRpclwiKSB0aHJvdyBcIm5vdCBhIGRpcmVjdG9yeVwiO1xyXG4gICAgICAgICAgICBpZiAoIShuYW1lIGluIGVudHJ5LmVudHJ5cykpIHRocm93IFwiZG9lc24ndCBleGlzdFwiO1xyXG4gICAgICAgICAgICBiYXNlID0gZW50cnkuZW50cnlzW25hbWVdO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gYmFzZTtcclxuICAgIH1cclxuXHJcbiAgICBhc3luYyBtYWtlRGlyKHBhdGg6IHN0cmluZykge1xyXG4gICAgICAgIGNvbnN0IG5hbWVzID0gcGFyc2UocGF0aCk7XHJcbiAgICAgICAgaWYgKG5hbWVzLmxlbmd0aCA9PT0gMCkgdGhyb3cgXCJubyBuYW1lIHNwZWNpZmllZFwiO1xyXG4gICAgICAgIGNvbnN0IHRhcmdldCA9IG5hbWVzLnBvcCgpITtcclxuICAgICAgICBjb25zdCBkaXIgPSBhd2FpdCB0aGlzLndhbGsodGhpcy5yb290LCBuYW1lcyk7XHJcbiAgICBcclxuICAgICAgICBjb25zdCBlbnRyeSA9IGF3YWl0IHByb21pc2lmeSh0aGlzLmRiLnRyYW5zYWN0aW9uKFwiZmlsZXNcIikub2JqZWN0U3RvcmUoXCJmaWxlc1wiKS5nZXQoZGlyKSBhcyBJREJSZXF1ZXN0PEVudHJ5Pik7XHJcbiAgICAgICAgaWYgKGVudHJ5LnR5cGUgIT09IFwiZGlyXCIpIHRocm93IFwibm90IGEgZGlyZWN0b3J5XCI7XHJcbiAgICAgICAgaWYgKHRhcmdldCBpbiBlbnRyeS5lbnRyeXMpIHRocm93IFwiaXRlbSBhbHJlYWR5IGV4aXN0c1wiO1xyXG5cclxuICAgICAgICBjb25zdCByZXF1ZXN0ID0gdGhpcy5kYi50cmFuc2FjdGlvbihcImZpbGVzXCIsIFwicmVhZHdyaXRlXCIpLm9iamVjdFN0b3JlKFwiZmlsZXNcIikuYWRkKHtcclxuICAgICAgICAgICAgdHlwZTogXCJkaXJcIixcclxuICAgICAgICAgICAgZW50cnlzOiB7fSxcclxuICAgICAgICB9KTtcclxuICAgICAgICBlbnRyeS5lbnRyeXNbdGFyZ2V0XSA9IGF3YWl0IHByb21pc2lmeShyZXF1ZXN0KSBhcyBudW1iZXI7XHJcbiAgICAgICAgYXdhaXQgcHJvbWlzaWZ5KHRoaXMuZGIudHJhbnNhY3Rpb24oXCJmaWxlc1wiLCBcInJlYWR3cml0ZVwiKS5vYmplY3RTdG9yZShcImZpbGVzXCIpLnB1dChlbnRyeSwgZGlyKSk7XHJcbiAgICB9XHJcblxyXG4gICAgYXN5bmMgbWFrZUZpbGUocGF0aDogc3RyaW5nKSB7XHJcbiAgICAgICAgY29uc3QgbmFtZXMgPSBwYXJzZShwYXRoKTtcclxuICAgICAgICBpZiAobmFtZXMubGVuZ3RoID09PSAwKSB0aHJvdyBcIm5vIG5hbWUgc3BlY2lmaWVkXCI7XHJcbiAgICAgICAgY29uc3QgdGFyZ2V0ID0gbmFtZXMucG9wKCkhO1xyXG4gICAgICAgIGNvbnN0IGRpciA9IGF3YWl0IHRoaXMud2Fsayh0aGlzLnJvb3QsIG5hbWVzKTtcclxuXHJcbiAgICAgICAgY29uc3QgZW50cnkgPSBhd2FpdCBwcm9taXNpZnkodGhpcy5kYi50cmFuc2FjdGlvbihcImZpbGVzXCIpLm9iamVjdFN0b3JlKFwiZmlsZXNcIikuZ2V0KGRpcikgYXMgSURCUmVxdWVzdDxFbnRyeT4pO1xyXG4gICAgICAgIGlmIChlbnRyeS50eXBlICE9PSBcImRpclwiKSB0aHJvdyBcIm5vdCBhIGRpcmVjdG9yeVwiO1xyXG4gICAgICAgIGlmICh0YXJnZXQgaW4gZW50cnkuZW50cnlzKSB0aHJvdyBcIml0ZW0gYWxyZWFkeSBleGlzdHNcIjtcclxuXHJcbiAgICAgICAgY29uc3QgcmVxdWVzdCA9IHRoaXMuZGIudHJhbnNhY3Rpb24oXCJmaWxlc1wiLCBcInJlYWR3cml0ZVwiKS5vYmplY3RTdG9yZShcImZpbGVzXCIpLmFkZCh7XHJcbiAgICAgICAgICAgIHR5cGU6IFwiZmlsZVwiLFxyXG4gICAgICAgICAgICBjb250ZW50czogXCJcIixcclxuICAgICAgICB9KTtcclxuICAgICAgICBlbnRyeS5lbnRyeXNbdGFyZ2V0XSA9IGF3YWl0IHByb21pc2lmeShyZXF1ZXN0KSBhcyBudW1iZXI7XHJcbiAgICAgICAgYXdhaXQgcHJvbWlzaWZ5KHRoaXMuZGIudHJhbnNhY3Rpb24oXCJmaWxlc1wiLCBcInJlYWR3cml0ZVwiKS5vYmplY3RTdG9yZShcImZpbGVzXCIpLnB1dChlbnRyeSwgZGlyKSk7XHJcbiAgICB9XHJcblxyXG4gICAgYXN5bmMgcmVhZEZpbGUocGF0aDogc3RyaW5nKSB7XHJcbiAgICAgICAgY29uc3QgbmFtZXMgPSBwYXJzZShwYXRoKTtcclxuICAgICAgICBjb25zdCB0YXJnZXQgPSBhd2FpdCB0aGlzLndhbGsodGhpcy5yb290LCBuYW1lcyk7XHJcblxyXG4gICAgICAgIGNvbnN0IGVudHJ5ID0gYXdhaXQgcHJvbWlzaWZ5KHRoaXMuZGIudHJhbnNhY3Rpb24oXCJmaWxlc1wiKS5vYmplY3RTdG9yZShcImZpbGVzXCIpLmdldCh0YXJnZXQpIGFzIElEQlJlcXVlc3Q8RW50cnk+KTtcclxuICAgICAgICBpZiAoZW50cnkudHlwZSAhPT0gXCJmaWxlXCIpIHRocm93IFwibm90IGEgZmlsZVwiO1xyXG4gICAgICAgIHJldHVybiBlbnRyeS5jb250ZW50cztcclxuICAgIH1cclxuXHJcbiAgICBhc3luYyB3cml0ZUZpbGUocGF0aDogc3RyaW5nLCBjb250ZW50czogc3RyaW5nKSB7XHJcbiAgICAgICAgY29uc3QgbmFtZXMgPSBwYXJzZShwYXRoKTtcclxuICAgICAgICBpZiAobmFtZXMubGVuZ3RoID09PSAwKSB0aHJvdyBcIm5vIG5hbWUgc3BlY2lmaWVkXCI7XHJcbiAgICAgICAgY29uc3QgdGFyZ2V0ID0gYXdhaXQgdGhpcy53YWxrKHRoaXMucm9vdCwgbmFtZXMpO1xyXG5cclxuICAgICAgICBhd2FpdCBwcm9taXNpZnkodGhpcy5kYi50cmFuc2FjdGlvbihcImZpbGVzXCIsIFwicmVhZHdyaXRlXCIpLm9iamVjdFN0b3JlKFwiZmlsZXNcIikucHV0KHtcclxuICAgICAgICAgICAgdHlwZTogXCJmaWxlXCIsXHJcbiAgICAgICAgICAgIGNvbnRlbnRzLFxyXG4gICAgICAgIH0sIHRhcmdldCkpO1xyXG4gICAgfVxyXG5cclxuICAgIGFzeW5jIHJlYWREaXIocGF0aDogc3RyaW5nKSB7XHJcbiAgICAgICAgY29uc3QgbmFtZXMgPSBwYXJzZShwYXRoKTtcclxuICAgICAgICBjb25zdCB0YXJnZXQgPSBhd2FpdCB0aGlzLndhbGsodGhpcy5yb290LCBuYW1lcyk7XHJcblxyXG4gICAgICAgIGNvbnN0IGVudHJ5ID0gYXdhaXQgcHJvbWlzaWZ5KHRoaXMuZGIudHJhbnNhY3Rpb24oXCJmaWxlc1wiKS5vYmplY3RTdG9yZShcImZpbGVzXCIpLmdldCh0YXJnZXQpIGFzIElEQlJlcXVlc3Q8RW50cnk+KTtcclxuICAgICAgICBpZiAoZW50cnkudHlwZSAhPT0gXCJkaXJcIikgdGhyb3cgXCJub3QgYSBkaXJlY3RvcnlcIjtcclxuICAgICAgICByZXR1cm4gZW50cnkuZW50cnlzO1xyXG4gICAgfVxyXG59XHJcbiIsImltcG9ydCB0eXBlIHsgUHJvZ3JhbSB9IGZyb20gXCIuLi9wcm9ncmFtXCI7XHJcblxyXG5leHBvcnQgZGVmYXVsdCAoYXN5bmMgKHN5cywgYXJndikgPT4ge1xyXG4gICAgY29uc3QgaHVlID0gYXJndlsxXSA9PT0gdW5kZWZpbmVkID8gTWF0aC5yYW5kb20oKSA6ICthcmd2WzFdLzM2MDtcclxuICAgIGlmICghTnVtYmVyLmlzRmluaXRlKGh1ZSkpIHtcclxuICAgICAgICBzeXMub3V0KGBJbnZhbGlkIGh1ZSBhbmdsZSBcIiR7YXJndlsxXX1cIlxcbmApO1xyXG4gICAgICAgIHJldHVybjtcclxuICAgIH1cclxuICAgIHN5cy5tb25pdG9yLnJvb3Quc3R5bGUuc2V0UHJvcGVydHkoXCItLXNjcmVlbi1jb2xvclwiLCBgaHNsKCR7aHVlID8/IE1hdGgucmFuZG9tKCl9dHVybiAxMDAlIDUwJSlgKTtcclxufSkgc2F0aXNmaWVzIFByb2dyYW07XHJcbiIsImltcG9ydCB0eXBlIHsgUHJvZ3JhbSB9IGZyb20gXCIuLi9wcm9ncmFtXCI7XHJcblxyXG5leHBvcnQgY29uc3QgbWtkaXI6IFByb2dyYW0gPSBhc3luYyAoc3lzLCBhcmd2KSA9PiB7XHJcbiAgICBpZiAoYXJndi5sZW5ndGggPCAyKSB7XHJcbiAgICAgICAgc3lzLm91dChcIm5lZWQgYXJndW1lbnRcXG5cIik7XHJcbiAgICAgICAgcmV0dXJuO1xyXG4gICAgfVxyXG4gICAgdHJ5IHtcclxuICAgICAgICBhd2FpdCBzeXMubW9uaXRvci5jb21wdXRlci5maWxlc3lzdGVtLm1ha2VEaXIoYXJndlsxXSk7XHJcbiAgICB9IGNhdGNoIChlcnIpIHtcclxuICAgICAgICBzeXMub3V0KGAke2Vycn1cXG5gKTtcclxuICAgICAgICByZXR1cm47XHJcbiAgICB9XHJcbn07XHJcblxyXG5leHBvcnQgY29uc3QgdG91Y2g6IFByb2dyYW0gPSBhc3luYyAoc3lzLCBhcmd2KSA9PiB7XHJcbiAgICBpZiAoYXJndi5sZW5ndGggPCAyKSB7XHJcbiAgICAgICAgc3lzLm91dChcIm5lZWQgYXJndW1lbnRcXG5cIik7XHJcbiAgICAgICAgcmV0dXJuO1xyXG4gICAgfVxyXG4gICAgdHJ5IHtcclxuICAgICAgICBhd2FpdCBzeXMubW9uaXRvci5jb21wdXRlci5maWxlc3lzdGVtLm1ha2VGaWxlKGFyZ3ZbMV0pO1xyXG4gICAgfSBjYXRjaCAoZXJyKSB7XHJcbiAgICAgICAgc3lzLm91dChgJHtlcnJ9XFxuYCk7XHJcbiAgICAgICAgcmV0dXJuO1xyXG4gICAgfVxyXG59O1xyXG5cclxuZXhwb3J0IGNvbnN0IGNhdDogUHJvZ3JhbSA9IGFzeW5jIChzeXMsIGFyZ3YpID0+IHtcclxuICAgIGlmIChhcmd2Lmxlbmd0aCA8IDIpIHtcclxuICAgICAgICBzeXMub3V0KFwibmVlZCBhcmd1bWVudFxcblwiKTtcclxuICAgICAgICByZXR1cm47XHJcbiAgICB9XHJcbiAgICB0cnkge1xyXG4gICAgICAgIHN5cy5vdXQoYXdhaXQgc3lzLm1vbml0b3IuY29tcHV0ZXIuZmlsZXN5c3RlbS5yZWFkRmlsZShhcmd2WzFdKSk7XHJcbiAgICB9IGNhdGNoIChlcnIpIHtcclxuICAgICAgICBzeXMub3V0KGAke2Vycn1cXG5gKTtcclxuICAgICAgICByZXR1cm47XHJcbiAgICB9XHJcbn07XHJcblxyXG5leHBvcnQgY29uc3Qgd3JpdGVGaWxlOiBQcm9ncmFtID0gYXN5bmMgKHN5cywgYXJndikgPT4ge1xyXG4gICAgaWYgKGFyZ3YubGVuZ3RoIDwgMykge1xyXG4gICAgICAgIHN5cy5vdXQoXCJuZWVkIDIgYXJndW1lbnRzXFxuXCIpO1xyXG4gICAgICAgIHJldHVybjtcclxuICAgIH1cclxuICAgIHRyeSB7XHJcbiAgICAgICAgYXdhaXQgc3lzLm1vbml0b3IuY29tcHV0ZXIuZmlsZXN5c3RlbS53cml0ZUZpbGUoYXJndlsxXSwgYXJndlsyXSArIFwiXFxuXCIpO1xyXG4gICAgfSBjYXRjaCAoZXJyKSB7XHJcbiAgICAgICAgc3lzLm91dChgJHtlcnJ9XFxuYCk7XHJcbiAgICAgICAgcmV0dXJuO1xyXG4gICAgfVxyXG59O1xyXG5cclxuY29uc3QgbGlzdGluZyA9IChlbnRyeXM6IFJlY29yZDxzdHJpbmcsIG51bWJlcj4pID0+IHtcclxuICAgIHJldHVybiBPYmplY3Qua2V5cyhlbnRyeXMpLm1hcChzID0+IHMgKyBcIlxcblwiKS5qb2luKFwiXCIpO1xyXG59O1xyXG5cclxuZXhwb3J0IGNvbnN0IGxzOiBQcm9ncmFtID0gYXN5bmMgKHN5cywgYXJndikgPT4ge1xyXG4gICAgdHJ5IHtcclxuICAgICAgICBzeXMub3V0KGxpc3RpbmcoYXdhaXQgc3lzLm1vbml0b3IuY29tcHV0ZXIuZmlsZXN5c3RlbS5yZWFkRGlyKGFyZ3ZbMV0gPz8gXCIvXCIpKSk7XHJcbiAgICB9IGNhdGNoIChlcnIpIHtcclxuICAgICAgICBzeXMub3V0KGAke2Vycn1cXG5gKTtcclxuICAgICAgICByZXR1cm47XHJcbiAgICB9XHJcbn07XHJcbiIsImltcG9ydCB0eXBlIHsgUHJvZ3JhbSB9IGZyb20gXCIuLi9wcm9ncmFtXCI7XHJcblxyXG5leHBvcnQgZGVmYXVsdCAoYXN5bmMgKHN5cywgYXJndikgPT4ge1xyXG4gICAgc3lzLm91dChgV0lQIHNvcnJ5IDooXFxuVHJ5IFwiY29sb3IgW2RlZ11cIiFcXG5gKTtcclxufSkgc2F0aXNmaWVzIFByb2dyYW07XHJcbiIsIi8qXHJcbm9yaWdpbmFsbHkgdXNlZCBhdCBodHRwczovL2dpdGh1Yi5jb20vdG9ic3ByLWdhbWVzL3NoYXBlei1jb21tdW5pdHktZWRpdGlvbi9wdWxsLzEyL2NvbW1pdHMvNTYzMzBhMTQzM2U4MWEyNjBiZTY2NjQ4ZjkwZGY3N2M4MTcyMzA4ZlxyXG5yZWxpY2Vuc2VkIGJ5IG1lLCB0aGUgb3JpZ2luYWwgYXV0aG9yXHJcbiovXHJcblxyXG5mdW5jdGlvbiBpc0Rpc3BsYXllZChub2RlOiBKU1guTm9kZSk6IG5vZGUgaXMgRXhjbHVkZTxKU1guTm9kZSwgYm9vbGVhbiB8IG51bGwgfCB1bmRlZmluZWQ+IHtcclxuICAgIHJldHVybiB0eXBlb2Ygbm9kZSAhPT0gXCJib29sZWFuXCIgJiYgbm9kZSAhPSBudWxsO1xyXG59XHJcblxyXG4vKipcclxuICogSlNYIGZhY3RvcnkuXHJcbiAqL1xyXG5mdW5jdGlvbiBqc3g8VCBleHRlbmRzIGtleW9mIEpTWC5JbnRyaW5zaWNFbGVtZW50cz4odGFnOiBULCBwcm9wczogSlNYLkludHJpbnNpY0VsZW1lbnRzW1RdKTogSFRNTEVsZW1lbnQ7XHJcbmZ1bmN0aW9uIGpzeDxVIGV4dGVuZHMgSlNYLlByb3BzPih0YWc6IEpTWC5Db21wb25lbnQ8VT4sIHByb3BzOiBVKTogRWxlbWVudDtcclxuZnVuY3Rpb24ganN4PFUgZXh0ZW5kcyBKU1guUHJvcHM+KFxyXG4gICAgdGFnOiBrZXlvZiBKU1guSW50cmluc2ljRWxlbWVudHMgfCBKU1guQ29tcG9uZW50PFU+LFxyXG4gICAgcHJvcHM6IFVcclxuKTogSlNYLkVsZW1lbnQge1xyXG4gICAgaWYgKHR5cGVvZiB0YWcgPT09IFwiZnVuY3Rpb25cIikgcmV0dXJuIHRhZyhwcm9wcyk7XHJcblxyXG4gICAgY29uc3QgeyBjaGlsZHJlbiwgLi4uYXR0cnMgfSA9IHByb3BzIGFzIEpTWC5JbnRyaW5zaWNFbGVtZW50c1trZXlvZiBKU1guSW50cmluc2ljRWxlbWVudHNdO1xyXG5cclxuICAgIGNvbnN0IGVsZW1lbnQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KHRhZyk7XHJcbiAgICBPYmplY3QuZW50cmllcyhhdHRycykuZm9yRWFjaCgoW2tleSwgdmFsdWVdKSA9PiB7XHJcbiAgICAgICAgc3dpdGNoICh0eXBlb2YgdmFsdWUpIHtcclxuICAgICAgICAgICAgY2FzZSBcImJvb2xlYW5cIjpcclxuICAgICAgICAgICAgICAgIGlmICghdmFsdWUpIHJldHVybjtcclxuICAgICAgICAgICAgICAgIHJldHVybiBlbGVtZW50LnNldEF0dHJpYnV0ZShrZXksIFwiXCIpO1xyXG4gICAgICAgICAgICBjYXNlIFwibnVtYmVyXCI6XHJcbiAgICAgICAgICAgIGNhc2UgXCJzdHJpbmdcIjpcclxuICAgICAgICAgICAgICAgIHJldHVybiBlbGVtZW50LnNldEF0dHJpYnV0ZShrZXksIGAke3ZhbHVlfWApO1xyXG4gICAgICAgIH1cclxuICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKFwiSlNYIGVsZW1lbnQgYXR0cmlidXRlIGFzc2lnbmVkIGludmFsaWQgdHlwZVwiKTtcclxuICAgIH0pO1xyXG4gICAgZWxlbWVudC5hcHBlbmQoLi4uKFtjaGlsZHJlbl0uZmxhdChJbmZpbml0eSkgYXMgSlNYLk5vZGVbXSkuZmlsdGVyKGlzRGlzcGxheWVkKSk7XHJcbiAgICByZXR1cm4gZWxlbWVudDtcclxufVxyXG5cclxuLy8gZnVuY3Rpb25hbCBjb21wb25lbnQsIGNhbGxlZCBpbmRpcmVjdGx5IGFzIGBqc3goRnJhZ21lbnQsIHByb3BzKWBcclxuLyoqXHJcbiAqIEdyb3VwcyBlbGVtZW50cyB3aXRob3V0IGludHJvZHVjaW5nIGEgcGFyZW50IGVsZW1lbnQuXHJcbiAqL1xyXG5jb25zdCBGcmFnbWVudCA9IChwcm9wczogSlNYLlByb3BzKSA9PiBwcm9wcy5jaGlsZHJlbiBhcyBKU1guRWxlbWVudDtcclxuXHJcbi8vIGpzeHMgaXMgdXNlZCB3aGVuIHRoZXJlIGFyZSBtdWx0aXBsZSBjaGlsZHJlblxyXG5leHBvcnQgeyBqc3gsIGpzeCBhcyBqc3hzLCBGcmFnbWVudCB9O1xyXG4iLCJpbXBvcnQgeyBDb21wdXRlciB9IGZyb20gXCIuL2NwdS9jb21wdXRlclwiO1xyXG5pbXBvcnQgeyBzbGVlcCwgcG9seWZpbGxQbGFpbnRleHRPbmx5IH0gZnJvbSBcIi4vdXRpbHNcIjtcclxuXHJcbmNvbnN0IHRleHQxID0gYFdlbGNvbWUgdG8gdGhlXHJcblxyXG7ilojilojilojilojilojilojilZfilpHilojilojilojilojilojilojilojilZfilojilojilZfilpHilpHilojilojilZfilpHilojilojilojilojilojilojilZdcclxu4paI4paI4pWU4pWQ4pWQ4paI4paI4pWX4paI4paI4pWU4pWQ4pWQ4pWQ4pWQ4pWd4paI4paI4pWR4paR4paR4paI4paI4pWR4paI4paI4pWU4pWQ4pWQ4pWQ4pWQ4pWdXHJcbuKWiOKWiOKWiOKWiOKWiOKWiOKVpuKVneKWiOKWiOKWiOKWiOKWiOKVl+KWkeKWkeKWiOKWiOKWiOKWiOKWiOKWiOKWiOKVkeKVmuKWiOKWiOKWiOKWiOKWiOKVl+KWkVxyXG7ilojilojilZTilZDilZDilojilojilZfilojilojilZTilZDilZDilZ3ilpHilpHilojilojilZTilZDilZDilojilojilZHilpHilZrilZDilZDilZDilojilojilZdcclxu4paI4paI4paI4paI4paI4paI4pWm4pWd4paI4paI4pWR4paR4paR4paR4paR4paR4paI4paI4pWR4paR4paR4paI4paI4pWR4paI4paI4paI4paI4paI4paI4pWU4pWdXHJcbuKVmuKVkOKVkOKVkOKVkOKVkOKVneKWkeKVmuKVkOKVneKWkeKWkeKWkeKWkeKWkeKVmuKVkOKVneKWkeKWkeKVmuKVkOKVneKVmuKVkOKVkOKVkOKVkOKVkOKVneKWkVxyXG5cclxu4paR4paI4paI4paI4paI4paI4pWX4paR4paR4paI4paI4paI4paI4paI4paI4pWX4oCD4oCD4paR4paI4paI4paI4paI4paI4pWX4paR4paI4paI4pWX4paR4paR4paR4paR4paR4paI4paI4pWX4paR4paR4paR4paI4paI4pWX4paI4paI4paI4paI4paI4paI4pWX4paR4paI4paI4pWXXHJcbuKWiOKWiOKVlOKVkOKVkOKWiOKWiOKVl+KWiOKWiOKVlOKVkOKVkOKVkOKVkOKVneKAg+KAg+KWiOKWiOKVlOKVkOKVkOKWiOKWiOKVl+KWiOKWiOKVkeKWkeKWkeKWkeKWkeKWkeKWiOKWiOKVkeKWkeKWkeKWkeKWiOKWiOKVkeKWiOKWiOKVlOKVkOKVkOKWiOKWiOKVl+KWiOKWiOKVkVxyXG7ilojilojilZHilpHilpHilZrilZDilZ3ilZrilojilojilojilojilojilZfilpHigIPigIPilojilojilZHilpHilpHilZrilZDilZ3ilojilojilZHilpHilpHilpHilpHilpHilojilojilZHilpHilpHilpHilojilojilZHilojilojilojilojilojilojilabilZ3ilojilojilZFcclxu4paI4paI4pWR4paR4paR4paI4paI4pWX4paR4pWa4pWQ4pWQ4pWQ4paI4paI4pWX4oCD4oCD4paI4paI4pWR4paR4paR4paI4paI4pWX4paI4paI4pWR4paR4paR4paR4paR4paR4paI4paI4pWR4paR4paR4paR4paI4paI4pWR4paI4paI4pWU4pWQ4pWQ4paI4paI4pWX4pWa4pWQ4pWdXHJcbuKVmuKWiOKWiOKWiOKWiOKWiOKVlOKVneKWiOKWiOKWiOKWiOKWiOKWiOKVlOKVneKAg+KAg+KVmuKWiOKWiOKWiOKWiOKWiOKVlOKVneKWiOKWiOKWiOKWiOKWiOKWiOKWiOKVl+KVmuKWiOKWiOKWiOKWiOKWiOKWiOKVlOKVneKWiOKWiOKWiOKWiOKWiOKWiOKVpuKVneKWiOKWiOKVl1xyXG7ilpHilZrilZDilZDilZDilZDilZ3ilpHilZrilZDilZDilZDilZDilZDilZ3ilpHigIPigIPilpHilZrilZDilZDilZDilZDilZ3ilpHilZrilZDilZDilZDilZDilZDilZDilZ3ilpHilZrilZDilZDilZDilZDilZDilZ3ilpHilZrilZDilZDilZDilZDilZDilZ3ilpHilZrilZDilZ1cclxuYDtcclxuXHJcbmNvbnN0IHRleHQxcyA9IGBXZWxjb21lIHRvIHRoZVxyXG5cclxu4paI4paE4paEIOKWiOKWgOKWgCDilojilpHilogg4paI4paAXHJcbuKWiOKWhOKWiCDilojiloDilpEg4paI4paA4paIIOKWhOKWiFxyXG5cclxu4paI4paA4paAIOKWiOKWgCAg4paI4paA4paAIOKWiOKWkeKWkSDilojilpHilogg4paI4paE4paEIOKWiFxyXG7ilojiloTiloQg4paE4paIICDilojiloTiloQg4paI4paE4paEIOKWiOKWhOKWiCDilojiloTilogg4paEXHJcbmA7XHJcblxyXG5jb25zdCB0ZXh0MiA9IGBcclxuUnVuIFwiaGVscFwiIG9uIHRoaXMgYXdmdWwgdGVybWluYWxcclxub3IgY2xpY2sgb24gdGhlIHBhcGVyIHRvIGxvb2sgZG93biFcclxuXHJcbj4gYDtcclxuXHJcbmV4cG9ydCBkZWZhdWx0IGNsYXNzIE1vbml0b3Ige1xyXG4gICAgcHVibGljIHJvb3Q6IEhUTUxFbGVtZW50O1xyXG4gICAgcHVibGljIHNjcmVlbjogSFRNTEVsZW1lbnQ7XHJcbiAgICBwdWJsaWMgY29udGVudDogSFRNTEVsZW1lbnQ7XHJcbiAgICBwdWJsaWMgb3V0cHV0OiBIVE1MRWxlbWVudDtcclxuICAgIHB1YmxpYyBpbnB1dDogSFRNTEVsZW1lbnQ7XHJcbiAgICBwdWJsaWMgY29tcHV0ZXI6IENvbXB1dGVyO1xyXG5cclxuICAgIGNvbnN0cnVjdG9yKHJvb3Q6IEhUTUxFbGVtZW50KSB7XHJcbiAgICAgICAgdGhpcy5yb290ID0gcm9vdDtcclxuICAgICAgICB0aGlzLnNjcmVlbiA9IHJvb3QuZ2V0RWxlbWVudHNCeUNsYXNzTmFtZShcInNjcmVlblwiKVswXSBhcyBIVE1MRWxlbWVudDtcclxuICAgICAgICB0aGlzLmNvbnRlbnQgPSByb290LmdldEVsZW1lbnRzQnlDbGFzc05hbWUoXCJjb250ZW50XCIpWzBdIGFzIEhUTUxFbGVtZW50O1xyXG4gICAgICAgIHRoaXMub3V0cHV0ID0gcm9vdC5nZXRFbGVtZW50c0J5Q2xhc3NOYW1lKFwib3V0cHV0XCIpWzBdIGFzIEhUTUxFbGVtZW50O1xyXG4gICAgICAgIHRoaXMuaW5wdXQgPSByb290LmdldEVsZW1lbnRzQnlDbGFzc05hbWUoXCJpbnB1dFwiKVswXSBhcyBIVE1MRWxlbWVudDtcclxuICAgICAgICB0aGlzLmNvbXB1dGVyID0gbmV3IENvbXB1dGVyKHRoaXMpO1xyXG5cclxuICAgICAgICBjb25zdCBzZWxmID0gdGhpcztcclxuICAgICAgICBwb2x5ZmlsbFBsYWludGV4dE9ubHkodGhpcy5pbnB1dCk7XHJcbiAgICAgICAgdGhpcy5yb290LmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCBmdW5jdGlvbihlKSB7XHJcbiAgICAgICAgICAgIGlmICh3aW5kb3cuZ2V0U2VsZWN0aW9uKCkhLmlzQ29sbGFwc2VkKSBzZWxmLmlucHV0LmZvY3VzKCk7XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgdGhpcy5pbnB1dC5hZGRFdmVudExpc3RlbmVyKFwiZm9jdXNcIiwgZnVuY3Rpb24oZSkge1xyXG4gICAgICAgICAgICB3aW5kb3cuZ2V0U2VsZWN0aW9uKCkhLnNlbGVjdEFsbENoaWxkcmVuKHRoaXMpO1xyXG4gICAgICAgICAgICB3aW5kb3cuZ2V0U2VsZWN0aW9uKCkhLmNvbGxhcHNlVG9FbmQoKTtcclxuICAgICAgICB9KTtcclxuICAgICAgICB0aGlzLmlucHV0LmFkZEV2ZW50TGlzdGVuZXIoXCJrZXlkb3duXCIsIGFzeW5jIGZ1bmN0aW9uKGUpIHtcclxuICAgICAgICAgICAgaWYgKGUua2V5ICE9PSBcIkVudGVyXCIpIHJldHVybjtcclxuICAgICAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xyXG4gICAgICAgICAgICBzZWxmLnByaW50KHRoaXMudGV4dENvbnRlbnQgKyBcIlxcblwiKTtcclxuICAgICAgICAgICAgY29uc3Qgc3RyID0gdGhpcy50ZXh0Q29udGVudCE7XHJcbiAgICAgICAgICAgIHRoaXMudGV4dENvbnRlbnQgPSBcIlwiO1xyXG4gICAgICAgICAgICBhd2FpdCBzZWxmLmNvbXB1dGVyLnJ1bihzdHIpO1xyXG4gICAgICAgICAgICBzZWxmLnByaW50KFwiPiBcIik7XHJcbiAgICAgICAgICAgIHRoaXMuY2xhc3NMaXN0LmFkZChcImVtcHR5XCIpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIHRoaXMuaW5wdXQuYWRkRXZlbnRMaXN0ZW5lcihcImlucHV0XCIsIGZ1bmN0aW9uKGUpIHtcclxuICAgICAgICAgICAgaWYgKHRoaXMudGV4dENvbnRlbnQhLmxlbmd0aCA9PT0gMCkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5jbGFzc0xpc3QuYWRkKFwiZW1wdHlcIik7XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmNsYXNzTGlzdC5yZW1vdmUoXCJlbXB0eVwiKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG5cclxuICAgIHByaW50KHN0cjogc3RyaW5nKSB7XHJcbiAgICAgICAgdGhpcy5vdXRwdXQuaW5zZXJ0QWRqYWNlbnRUZXh0KFwiYmVmb3JlZW5kXCIsIHN0cik7XHJcbiAgICAgICAgdGhpcy5jb250ZW50LnNjcm9sbFRvcCA9IHRoaXMuY29udGVudC5zY3JvbGxIZWlnaHQ7XHJcbiAgICB9XHJcblxyXG4gICAgYXN5bmMgYm9vdCgpIHtcclxuICAgICAgICBhd2FpdCB0aGlzLmNvbXB1dGVyLmluaXQoKTtcclxuICAgICAgICBhd2FpdCBzbGVlcCg4MDApO1xyXG4gICAgICAgIGNvbnN0IHNpemUgPSBwYXJzZUZsb2F0KHdpbmRvdy5nZXRDb21wdXRlZFN0eWxlKGRvY3VtZW50LmRvY3VtZW50RWxlbWVudCkuZm9udFNpemUpO1xyXG4gICAgICAgIHRoaXMucHJpbnQoc2l6ZSA8IDc2ID8gdGV4dDFzIDogdGV4dDEpO1xyXG4gICAgICAgIGF3YWl0IHNsZWVwKDEzMDApO1xyXG4gICAgICAgIHRoaXMucHJpbnQodGV4dDIpO1xyXG4gICAgfVxyXG59XHJcbiIsImltcG9ydCB7IG1ha2VTdHlsZSB9IGZyb20gXCIuLi91dGlsc1wiO1xyXG5cclxuY29uc3QgdGhpY2sgPSAxO1xyXG5cclxuY29uc3QgbWFrZUxlZyA9ICh7IHgsIHksIGhlaWdodCB9OiB7IHg6IG51bWJlciwgeTogbnVtYmVyLCBoZWlnaHQ6IG51bWJlciB9KSA9PiB7XHJcbiAgICByZXR1cm4gPGRpdiBjbGFzcz1cImdyb3VwXCIgc3R5bGU9e21ha2VTdHlsZSh7IHBvczogYHRyYW5zbGF0ZTNkKCR7eH1yZW0sMCwke3l9cmVtKWB9KX0+XHJcbiAgICAgICAgPGRpdiBjbGFzcz1cIm9iamVjdFwiIHN0eWxlPXttYWtlU3R5bGUoeyBjb2xvcjogXCIjMjYxYTBkXCIsIHdpZHRoOiB0aGljaywgaGVpZ2h0OiBoZWlnaHQtdGhpY2ssIHBvczogYHRyYW5zbGF0ZVgoJHt0aGljay8yfXJlbSkgcm90YXRlWSg5MGRlZylgfSl9PjwvZGl2PlxyXG4gICAgICAgIDxkaXYgY2xhc3M9XCJvYmplY3RcIiBzdHlsZT17bWFrZVN0eWxlKHsgY29sb3I6IFwiIzI2MWEwZFwiLCB3aWR0aDogdGhpY2ssIGhlaWdodDogaGVpZ2h0LXRoaWNrLCBwb3M6IGB0cmFuc2xhdGVaKCR7dGhpY2svMn1yZW0pYH0pfT48L2Rpdj5cclxuICAgICAgICA8ZGl2IGNsYXNzPVwib2JqZWN0XCIgc3R5bGU9e21ha2VTdHlsZSh7IGNvbG9yOiBcIiMyNjFhMGRcIiwgd2lkdGg6IHRoaWNrLCBoZWlnaHQ6IGhlaWdodC10aGljaywgcG9zOiBgdHJhbnNsYXRlWCgkey10aGljay8yfXJlbSkgcm90YXRlWSgtOTBkZWcpYH0pfT48L2Rpdj5cclxuICAgICAgICA8ZGl2IGNsYXNzPVwib2JqZWN0XCIgc3R5bGU9e21ha2VTdHlsZSh7IGNvbG9yOiBcIiMyNjFhMGRcIiwgd2lkdGg6IHRoaWNrLCBoZWlnaHQ6IGhlaWdodC10aGljaywgcG9zOiBgdHJhbnNsYXRlWigkey10aGljay8yfXJlbSkgcm90YXRlWSgxODBkZWcpYH0pfT48L2Rpdj5cclxuICAgIDwvZGl2PjtcclxufTtcclxuXHJcbmV4cG9ydCBjb25zdCBtYWtlVGFibGUgPSAoeyB3aWR0aCwgZGVwdGgsIGhlaWdodCB9OiB7IHdpZHRoOiBudW1iZXIsIGRlcHRoOiBudW1iZXIsIGhlaWdodDogbnVtYmVyIH0pID0+IHtcclxuICAgIHJldHVybiA8ZGl2IGNsYXNzPVwiZ3JvdXBcIiBzdHlsZT17bWFrZVN0eWxlKHsgcG9zOiBcInRyYW5zbGF0ZTNkKDAsMCwwKVwifSl9PlxyXG4gICAgICAgIDxkaXYgY2xhc3M9XCJncm91cFwiIHN0eWxlPXttYWtlU3R5bGUoeyBwb3M6IGB0cmFuc2xhdGVZKCR7KC1oZWlnaHQrdGhpY2spLzJ9cmVtKWB9KX0+XHJcbiAgICAgICAgICAgIHttYWtlTGVnKHsgeDogd2lkdGgvMi10aGljayoyLCB5OiBkZXB0aC8yLXRoaWNrKjIsIGhlaWdodCB9KX1cclxuICAgICAgICAgICAge21ha2VMZWcoeyB4OiAtd2lkdGgvMit0aGljayoyLCB5OiBkZXB0aC8yLXRoaWNrKjIsIGhlaWdodCB9KX1cclxuICAgICAgICAgICAge21ha2VMZWcoeyB4OiAtd2lkdGgvMit0aGljayoyLCB5OiAtZGVwdGgvMit0aGljayoyLCBoZWlnaHQgfSl9XHJcbiAgICAgICAgICAgIHttYWtlTGVnKHsgeDogd2lkdGgvMi10aGljayoyLCB5OiAtZGVwdGgvMit0aGljayoyLCBoZWlnaHQgfSl9XHJcbiAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgPGRpdiBjbGFzcz1cImdyb3VwXCIgc3R5bGU9e21ha2VTdHlsZSh7IHBvczogYHRyYW5zbGF0ZVkoJHstaGVpZ2h0K3RoaWNrLzJ9cmVtKWAgfSl9PlxyXG4gICAgICAgICAgICA8ZGl2IGNsYXNzPVwib2JqZWN0XCIgc3R5bGU9e21ha2VTdHlsZSh7IGNvbG9yOiBcIiM1ZTNkMTlcIiwgd2lkdGgsIGhlaWdodDogZGVwdGgsIHBvczogYHRyYW5zbGF0ZVkoJHstdGhpY2svMn1yZW0pIHJvdGF0ZVgoOTBkZWcpYH0pfSAvPlxyXG4gICAgICAgICAgICA8ZGl2IGNsYXNzPVwib2JqZWN0XCIgc3R5bGU9e21ha2VTdHlsZSh7IGNvbG9yOiBcIiMyNjFhMGRcIiwgd2lkdGgsIGhlaWdodDogZGVwdGgsIHBvczogYHRyYW5zbGF0ZVkoJHt0aGljay8yfXJlbSkgcm90YXRlWCg5MGRlZylgfSl9IC8+XHJcbiAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJvYmplY3RcIiBzdHlsZT17bWFrZVN0eWxlKHsgY29sb3I6IFwiIzQ5MzExN1wiLCB3aWR0aCwgaGVpZ2h0OiB0aGljaywgcG9zOiBgdHJhbnNsYXRlWigke2RlcHRoLzJ9cmVtKWB9KX0gLz5cclxuICAgICAgICAgICAgPGRpdiBjbGFzcz1cIm9iamVjdFwiIHN0eWxlPXttYWtlU3R5bGUoeyBjb2xvcjogXCIjNDkzMTE3XCIsIHdpZHRoLCBoZWlnaHQ6IHRoaWNrLCBwb3M6IGByb3RhdGVZKDE4MGRlZykgdHJhbnNsYXRlWigke2RlcHRoLzJ9cmVtKWB9KX0gLz5cclxuICAgICAgICAgICAgPGRpdiBjbGFzcz1cIm9iamVjdFwiIHN0eWxlPXttYWtlU3R5bGUoeyBjb2xvcjogXCIjNDkzMTE3XCIsIHdpZHRoOiBkZXB0aCwgaGVpZ2h0OiB0aGljaywgcG9zOiBgcm90YXRlWSg5MGRlZykgdHJhbnNsYXRlWigke3dpZHRoLzJ9cmVtKWB9KX0gLz5cclxuICAgICAgICAgICAgPGRpdiBjbGFzcz1cIm9iamVjdFwiIHN0eWxlPXttYWtlU3R5bGUoeyBjb2xvcjogXCIjNDkzMTE3XCIsIHdpZHRoOiBkZXB0aCwgaGVpZ2h0OiB0aGljaywgcG9zOiBgcm90YXRlWSgtOTBkZWcpIHRyYW5zbGF0ZVooJHt3aWR0aC8yfXJlbSlgfSl9IC8+XHJcbiAgICAgICAgPC9kaXY+XHJcbiAgICA8L2Rpdj47XHJcbn07XHJcbiIsImV4cG9ydCBjb25zdCBzbGVlcCA9IChtczogbnVtYmVyKSA9PiBuZXcgUHJvbWlzZSgocmVzKSA9PiB7XHJcbiAgICBzZXRJbnRlcnZhbChyZXMsIG1zKTtcclxufSk7XHJcblxyXG5jb25zdCB0eXBlID0gKGVsZW06IEhUTUxFbGVtZW50LCB0ZXh0OiBzdHJpbmcpID0+IHtcclxuICAgIGNvbnN0IHNlbCA9IHdpbmRvdy5nZXRTZWxlY3Rpb24oKSE7XHJcbiAgICBjb25zdCBjb250ZW50ID0gZWxlbS50ZXh0Q29udGVudCE7XHJcbiAgICBjb25zdCBbc3RhcnQsIGVuZF0gPSBbXHJcbiAgICAgICAgc2VsLmFuY2hvck9mZnNldCAqIChzZWwuYW5jaG9yTm9kZSA9PT0gZWxlbSA/IGNvbnRlbnQubGVuZ3RoIDogMSksXHJcbiAgICAgICAgc2VsLmZvY3VzT2Zmc2V0ICogKHNlbC5mb2N1c05vZGUgPT09IGVsZW0gPyBjb250ZW50Lmxlbmd0aCA6IDEpLFxyXG4gICAgXS5zb3J0KChhLGIpID0+IGEgLSBiKTtcclxuICAgIGVsZW0udGV4dENvbnRlbnQgPSBjb250ZW50LnNsaWNlKDAsIHN0YXJ0KSArIHRleHQgKyBjb250ZW50LnNsaWNlKGVuZCk7XHJcblxyXG4gICAgc2VsLnJlbW92ZUFsbFJhbmdlcygpO1xyXG4gICAgY29uc3QgcmFuZ2UgPSBkb2N1bWVudC5jcmVhdGVSYW5nZSgpO1xyXG4gICAgcmFuZ2Uuc2V0U3RhcnQoZWxlbS5jaGlsZE5vZGVzWzBdLCBzdGFydCArIHRleHQubGVuZ3RoKTtcclxuICAgIHJhbmdlLnNldEVuZChlbGVtLmNoaWxkTm9kZXNbMF0sIHN0YXJ0ICsgdGV4dC5sZW5ndGgpO1xyXG4gICAgc2VsLmFkZFJhbmdlKHJhbmdlKTtcclxuXHJcbiAgICBlbGVtLmRpc3BhdGNoRXZlbnQobmV3IEV2ZW50KFwiaW5wdXRcIikpO1xyXG59O1xyXG5cclxuLyoqXHJcbiAqIEZvciBGaXJlZm94LlxyXG4gKiBCYXNlZCBvbiBodHRwczovL3N0YWNrb3ZlcmZsb3cuY29tL2EvNjQwMDE4MzlcclxuICovXHJcbmV4cG9ydCBjb25zdCBwb2x5ZmlsbFBsYWludGV4dE9ubHkgPSAoZWxlbTogSFRNTEVsZW1lbnQpID0+IHtcclxuICAgIGlmIChlbGVtLmNvbnRlbnRFZGl0YWJsZSA9PT0gXCJwbGFpbnRleHQtb25seVwiKSByZXR1cm47XHJcblxyXG4gICAgZWxlbS5jb250ZW50RWRpdGFibGUgPSBcInRydWVcIjtcclxuICAgIGVsZW0uYWRkRXZlbnRMaXN0ZW5lcihcImtleWRvd25cIiwgZnVuY3Rpb24oZSkge1xyXG4gICAgICAgIGlmIChlLmtleSAhPT0gXCJFbnRlclwiKSByZXR1cm47XHJcbiAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xyXG4gICAgfSk7XHJcbiAgICBlbGVtLmFkZEV2ZW50TGlzdGVuZXIoXCJwYXN0ZVwiLCBmdW5jdGlvbihlKSB7XHJcbiAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xyXG4gICAgICAgIHR5cGUodGhpcywgZS5jbGlwYm9hcmREYXRhIS5nZXREYXRhKFwidGV4dC9wbGFpblwiKSk7XHJcbiAgICB9KTtcclxuICAgIC8vIGZpeGVzIEZpcmVmb3ggaW5zZXJ0aW5nIGEgPGJyPlxyXG4gICAgZWxlbS5hZGRFdmVudExpc3RlbmVyKFwiaW5wdXRcIiwgZnVuY3Rpb24oZSkge1xyXG4gICAgICAgIGlmICh0aGlzLmNoaWxkcmVuLmxlbmd0aCA9PT0gMCkgcmV0dXJuO1xyXG4gICAgICAgIHRoaXMudGV4dENvbnRlbnQgPSBcIlwiO1xyXG4gICAgfSk7XHJcbiAgICBpZiAoZWxlbS5hdXRvZm9jdXMpIHtcclxuICAgICAgICBlbGVtLmZvY3VzKCk7XHJcbiAgICB9XHJcbn07XHJcblxyXG5leHBvcnQgY29uc3QgbWFrZVN0eWxlID0gKHsgY29sb3IgPSBcInRyYW5zcGFyZW50XCIsIHdpZHRoID0gMCwgaGVpZ2h0ID0gMCwgcG9zLCBjZW50ZXIgPSB0cnVlIH06IHsgY29sb3I/OiBzdHJpbmcsIHdpZHRoPzogbnVtYmVyLCBoZWlnaHQ/OiBudW1iZXIsIHBvczogc3RyaW5nLCBjZW50ZXI/OiBib29sZWFuIH0pID0+IHtcclxuICAgIHJldHVybiBgXHJcbiAgICAgICAgYmFja2dyb3VuZC1jb2xvcjogJHtjb2xvcn07XHJcbiAgICAgICAgd2lkdGg6ICR7d2lkdGh9cmVtO1xyXG4gICAgICAgIGhlaWdodDogJHtoZWlnaHR9cmVtO1xyXG4gICAgICAgIHRyYW5zZm9ybTogJHtjZW50ZXIgPyBcInRyYW5zbGF0ZSgtNTAlLC01MCUpXCIgOiBcIlwifSAke3Bvc31gO1xyXG59O1xyXG4iLCJleHBvcnQgZGVmYXVsdCBjbGFzcyBXb3JsZCB7XHJcbiAgICBwdWJsaWMgcm9vdDogSFRNTEVsZW1lbnQ7XHJcbiAgICBwdWJsaWMgc2VsZWN0ZWQ6IEhUTUxFbGVtZW50IHwgdW5kZWZpbmVkO1xyXG4gICAgcHVibGljIGRlZmF1bHRUcmFuc2Zvcm06IHN0cmluZztcclxuXHJcbiAgICBjb25zdHJ1Y3Rvcihyb290OiBIVE1MRWxlbWVudCwgb2JqZWN0czogeyBlbGVtOiBIVE1MRWxlbWVudCwgdHJhbnNmb3JtOiBzdHJpbmcgfVtdKSB7XHJcbiAgICAgICAgdGhpcy5yb290ID0gcm9vdDtcclxuICAgICAgICBjb25zdCBzZWxmID0gdGhpcztcclxuICAgICAgICBmb3IgKGNvbnN0IHsgZWxlbSwgdHJhbnNmb3JtIH0gb2Ygb2JqZWN0cykge1xyXG4gICAgICAgICAgICB0aGlzLnJvb3QuYXBwZW5kQ2hpbGQoZWxlbSk7XHJcbiAgICAgICAgICAgIGlmICh0cmFuc2Zvcm0gPT0gbnVsbCkgY29udGludWU7XHJcbiAgICAgICAgICAgIGVsZW0uc3R5bGUucG9pbnRlckV2ZW50cyA9IFwiYWxsXCI7XHJcbiAgICAgICAgICAgIGVsZW0uYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsIGZ1bmN0aW9uKGUpIHtcclxuICAgICAgICAgICAgICAgIGlmICh0aGlzID09PSBzZWxmLnNlbGVjdGVkKSByZXR1cm47XHJcbiAgICAgICAgICAgICAgICBpZiAoc2VsZi5zZWxlY3RlZCAhPSBudWxsKSBzZWxmLnNlbGVjdGVkLmNsYXNzTGlzdC5yZW1vdmUoXCJzZWxlY3RlZFwiKTtcclxuICAgICAgICAgICAgICAgIHNlbGYuc2VsZWN0ZWQgPSB0aGlzO1xyXG4gICAgICAgICAgICAgICAgc2VsZi5zZWxlY3RlZC5jbGFzc0xpc3QuYWRkKFwic2VsZWN0ZWRcIik7XHJcbiAgICAgICAgICAgICAgICBzZWxmLnJvb3Quc3R5bGUudHJhbnNmb3JtID0gdHJhbnNmb3JtO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9XHJcbiAgICAgICAgdGhpcy5kZWZhdWx0VHJhbnNmb3JtID0gdGhpcy5yb290LnN0eWxlLnRyYW5zZm9ybTtcclxuICAgICAgICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKFwia2V5ZG93blwiLCBmdW5jdGlvbihlKSB7XHJcbiAgICAgICAgICAgIGlmIChlLmtleSAhPSBcIkVzY2FwZVwiKSByZXR1cm47XHJcbiAgICAgICAgICAgIGUuc3RvcFByb3BhZ2F0aW9uKCk7XHJcbiAgICAgICAgICAgIGlmIChzZWxmLnNlbGVjdGVkICE9IG51bGwpIHNlbGYuc2VsZWN0ZWQuY2xhc3NMaXN0LnJlbW92ZShcInNlbGVjdGVkXCIpO1xyXG4gICAgICAgICAgICBzZWxmLnNlbGVjdGVkID0gdW5kZWZpbmVkO1xyXG4gICAgICAgICAgICBzZWxmLnJvb3Quc3R5bGUudHJhbnNmb3JtID0gc2VsZi5kZWZhdWx0VHJhbnNmb3JtO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG59XHJcbiIsIi8vIFRoZSBtb2R1bGUgY2FjaGVcbnZhciBfX3dlYnBhY2tfbW9kdWxlX2NhY2hlX18gPSB7fTtcblxuLy8gVGhlIHJlcXVpcmUgZnVuY3Rpb25cbmZ1bmN0aW9uIF9fd2VicGFja19yZXF1aXJlX18obW9kdWxlSWQpIHtcblx0Ly8gQ2hlY2sgaWYgbW9kdWxlIGlzIGluIGNhY2hlXG5cdHZhciBjYWNoZWRNb2R1bGUgPSBfX3dlYnBhY2tfbW9kdWxlX2NhY2hlX19bbW9kdWxlSWRdO1xuXHRpZiAoY2FjaGVkTW9kdWxlICE9PSB1bmRlZmluZWQpIHtcblx0XHRyZXR1cm4gY2FjaGVkTW9kdWxlLmV4cG9ydHM7XG5cdH1cblx0Ly8gQ3JlYXRlIGEgbmV3IG1vZHVsZSAoYW5kIHB1dCBpdCBpbnRvIHRoZSBjYWNoZSlcblx0dmFyIG1vZHVsZSA9IF9fd2VicGFja19tb2R1bGVfY2FjaGVfX1ttb2R1bGVJZF0gPSB7XG5cdFx0Ly8gbm8gbW9kdWxlLmlkIG5lZWRlZFxuXHRcdC8vIG5vIG1vZHVsZS5sb2FkZWQgbmVlZGVkXG5cdFx0ZXhwb3J0czoge31cblx0fTtcblxuXHQvLyBFeGVjdXRlIHRoZSBtb2R1bGUgZnVuY3Rpb25cblx0X193ZWJwYWNrX21vZHVsZXNfX1ttb2R1bGVJZF0obW9kdWxlLCBtb2R1bGUuZXhwb3J0cywgX193ZWJwYWNrX3JlcXVpcmVfXyk7XG5cblx0Ly8gUmV0dXJuIHRoZSBleHBvcnRzIG9mIHRoZSBtb2R1bGVcblx0cmV0dXJuIG1vZHVsZS5leHBvcnRzO1xufVxuXG4iLCIvLyBkZWZpbmUgZ2V0dGVyIGZ1bmN0aW9ucyBmb3IgaGFybW9ueSBleHBvcnRzXG5fX3dlYnBhY2tfcmVxdWlyZV9fLmQgPSAoZXhwb3J0cywgZGVmaW5pdGlvbikgPT4ge1xuXHRmb3IodmFyIGtleSBpbiBkZWZpbml0aW9uKSB7XG5cdFx0aWYoX193ZWJwYWNrX3JlcXVpcmVfXy5vKGRlZmluaXRpb24sIGtleSkgJiYgIV9fd2VicGFja19yZXF1aXJlX18ubyhleHBvcnRzLCBrZXkpKSB7XG5cdFx0XHRPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywga2V5LCB7IGVudW1lcmFibGU6IHRydWUsIGdldDogZGVmaW5pdGlvbltrZXldIH0pO1xuXHRcdH1cblx0fVxufTsiLCJfX3dlYnBhY2tfcmVxdWlyZV9fLm8gPSAob2JqLCBwcm9wKSA9PiAoT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKG9iaiwgcHJvcCkpIiwiLy8gZGVmaW5lIF9fZXNNb2R1bGUgb24gZXhwb3J0c1xuX193ZWJwYWNrX3JlcXVpcmVfXy5yID0gKGV4cG9ydHMpID0+IHtcblx0aWYodHlwZW9mIFN5bWJvbCAhPT0gJ3VuZGVmaW5lZCcgJiYgU3ltYm9sLnRvU3RyaW5nVGFnKSB7XG5cdFx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFN5bWJvbC50b1N0cmluZ1RhZywgeyB2YWx1ZTogJ01vZHVsZScgfSk7XG5cdH1cblx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsICdfX2VzTW9kdWxlJywgeyB2YWx1ZTogdHJ1ZSB9KTtcbn07IiwiaW1wb3J0IE1vbml0b3IgZnJvbSBcIi4vbW9uaXRvclwiO1xyXG5pbXBvcnQgV29ybGQgZnJvbSBcIi4vd29ybGRcIjtcclxuaW1wb3J0IHsgbWFrZVRhYmxlIH0gZnJvbSBcIi4vb2JqZWN0cy90YWJsZVwiO1xyXG5cclxuY29uc3QgY29tcCA9IDxkaXYgaWQ9XCJjb21wXCIgY2xhc3M9XCJjb21wdXRlciBvYmplY3RcIj5cclxuICAgIDxkaXYgY2xhc3M9XCJzY3JlZW5cIj5cclxuICAgICAgICA8ZGl2IGNsYXNzPVwiY29udGVudFwiPlxyXG4gICAgICAgICAgICA8cHJlIGNsYXNzPVwib3V0cHV0XCI+PC9wcmU+PHByZSBhdXRvZm9jdXMgY2xhc3M9XCJpbnB1dCBlbXB0eVwiIGNvbnRlbnRlZGl0YWJsZT1cInBsYWludGV4dC1vbmx5XCIgc3BlbGxjaGVjaz1cImZhbHNlXCI+PC9wcmU+XHJcbiAgICAgICAgPC9kaXY+XHJcbiAgICA8L2Rpdj5cclxuPC9kaXY+O1xyXG5cclxuY29uc3QgcGFwZXIgPSA8ZGl2IGNsYXNzPVwicGFwZXIgb2JqZWN0XCI+XHJcbiAgICA8aDI+QWJvdXQgdGhlIGNsdWI8L2gyPlxyXG4gICAgPHA+XHJcbiAgICAgICAgTG9yZW0gaXBzdW0gZG9sb3Igc2l0IGFtZXQsXHJcbiAgICAgICAgY29uc2VjdGV0dXIgYWRpcGlzY2luZyBlbGl0LFxyXG4gICAgICAgIHNlZCBkbyBlaXVzbW9kIHRlbXBvciBpbmNpZGlkdW50IHV0IGxhYm9yZSBldCBkb2xvcmUgbWFnbmEgYWxpcXVhLlxyXG4gICAgICAgIFV0IGVuaW0gYWQgbWluaW0gdmVuaWFtLFxyXG4gICAgICAgIHF1aXMgbm9zdHJ1ZCBleGVyY2l0YXRpb24gdWxsYW1jbyBsYWJvcmlzIG5pc2kgdXQgYWxpcXVpcCBleCBlYSBjb21tb2RvIGNvbnNlcXVhdC5cclxuICAgICAgICBEdWlzIGF1dGUgaXJ1cmUgZG9sb3IgaW4gcmVwcmVoZW5kZXJpdCBpbiB2b2x1cHRhdGUgdmVsaXQgZXNzZSBjaWxsdW0gZG9sb3JlIGV1IGZ1Z2lhdCBudWxsYSBwYXJpYXR1ci5cclxuICAgICAgICBFeGNlcHRldXIgc2ludCBvY2NhZWNhdCBjdXBpZGF0YXQgbm9uIHByb2lkZW50LFxyXG4gICAgICAgIHN1bnQgaW4gY3VscGEgcXVpIG9mZmljaWEgZGVzZXJ1bnQgbW9sbGl0IGFuaW0gaWQgZXN0IGxhYm9ydW0uXHJcbiAgICA8L3A+XHJcbiAgICA8cD5cclxuICAgIE9mZmljZXJzOlxyXG4gICAgICAgIDx1bD5cclxuICAgICAgICAgICAgPGxpPkFsaWNlPC9saT5cclxuICAgICAgICAgICAgPGxpPkJvYjwvbGk+XHJcbiAgICAgICAgPC91bD5cclxuICAgIDwvcD5cclxuPC9kaXY+O1xyXG5cclxuY29uc3Qgd29ybGQgPSBuZXcgV29ybGQoZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJ3b3JsZFwiKSEsIFtcclxuICAgIHtcclxuICAgICAgICBlbGVtOiBtYWtlVGFibGUoeyB3aWR0aDogNSoxMiwgZGVwdGg6IDIqMTIsIGhlaWdodDogMi41KjEyIH0pLFxyXG4gICAgICAgIHRyYW5zZm9ybTogXCJcIixcclxuICAgIH0sXHJcbiAgICB7XHJcbiAgICAgICAgZWxlbTogY29tcCxcclxuICAgICAgICB0cmFuc2Zvcm06IFwicm90YXRlWCgtMTBkZWcpIHJvdGF0ZVkoLTVkZWcpIHRyYW5zbGF0ZTNkKDNyZW0sMzVyZW0sMHJlbSlcIixcclxuICAgIH0sXHJcbiAgICB7XHJcbiAgICAgICAgZWxlbTogcGFwZXIsXHJcbiAgICAgICAgdHJhbnNmb3JtOiBcInJvdGF0ZVgoLTgwZGVnKSByb3RhdGVZKDVkZWcpIHRyYW5zbGF0ZTNkKC01cmVtLDI4cmVtLC01cmVtKVwiLFxyXG4gICAgfSxcclxuXSk7XHJcblxyXG5jb25zdCBtb25pdG9yID0gbmV3IE1vbml0b3IoY29tcCk7XHJcbm1vbml0b3IuYm9vdCgpO1xyXG4iXSwibmFtZXMiOltdLCJzb3VyY2VSb290IjoiIn0=