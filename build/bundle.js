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
            rm: _programs_fs__WEBPACK_IMPORTED_MODULE_2__.rm,
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
    async remove(path) {
        const names = parse(path);
        if (names.length === 0)
            throw "no name specified";
        const target = names.pop();
        const dir = await this.walk(this.root, names);
        const entry = await promisify(this.db.transaction("files").objectStore("files").get(dir));
        if (entry.type !== "dir")
            throw "not a directory";
        if (!(target in entry.entrys))
            throw "item doesn't exist";
        delete entry.entrys[target];
        await promisify(this.db.transaction("files", "readwrite").objectStore("files").put(entry, dir));
        // TODO: fix memory leak
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
/* harmony export */   rm: () => (/* binding */ rm),
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
const rm = async (sys, argv) => {
    if (argv.length < 2) {
        sys.out("need argument\n");
        return;
    }
    try {
        await sys.monitor.computer.filesystem.remove(argv[1]);
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
const message = `\
List of commands:
    help
        Display this message.
    color [<angle>]
        Change terminal color.
    mkdir [<name>]
        Create a directory. Parent directory must exist.
    touch [<name>]
        Create an empty file. Parent directory must exist.
    cat [<name>]
        Print the contents of a file.
    ls [<name>]
        Print the entries in a directory.
    rm [<name>]
        Delete an entry from a directory.
This terminal is very work-in-progress.
`;
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (async (sys, argv) => {
    sys.out(message);
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
Run "help" on this terminal
and/or click on the paper to look down!

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
const paper = (0,root_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)("div", { class: "paper object", children: [(0,root_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)("h1", { children: ["CLUB WEBSITE MANUAL", (0,root_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("br", {}), "and", (0,root_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("br", {}), "CAKE DISPENSARY"] }), (0,root_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)("p", { children: ["Click on stuff to look at it. You probably figured that one out already, but did you know you can press ", (0,root_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("kbd", { children: "Esc" }), " to zoom back out???"] }), (0,root_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("p", { children: "The terminal's filesystem requires IndexedDB permissions." }), (0,root_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("p", { children: "Good luck!" }), (0,root_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("h2", { children: "About the club" }), (0,root_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("p", { children: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum." }), (0,root_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)("p", { children: ["Officers:", (0,root_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)("ul", { children: [(0,root_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)("li", { children: [(0,root_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("b", { children: "President:" }), " Joe"] }), (0,root_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)("li", { children: [(0,root_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("b", { children: "Vice President:" }), " Austin"] }), (0,root_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)("li", { children: [(0,root_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("b", { children: "Secretary:" }), " Thomas"] }), (0,root_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)("li", { children: [(0,root_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("b", { children: "Outreach Director:" }), " Xindi"] }), (0,root_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)("li", { children: [(0,root_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("b", { children: "Tech Lead:" }), " Jonathan"] }), (0,root_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)("li", { children: [(0,root_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("b", { children: "Contributing Members:" }), " Eden, Oscar"] })] })] }), (0,root_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("h2", { children: "About this site" }), (0,root_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("p", { children: "This is a prototype. Maybe it really is cooler than a plain old 2D site, or maybe it isn't and we'll work on something else." }), (0,root_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("p", { children: "Everything here is HTML/CSS/JS, with no client-side libraries! (Only TypeScript and webpack are used for development.) Maybe I should research libraries more. I still can't believe web browsers support really decent basic 3D!!!" }), (0,root_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("p", { children: "By the way, try zooming in and out, or resizing your browser window. Accessibility!! In fact, the terminal supports selections and copy-pasting via a few shims on a \"contenteditable\" element. Actually you can select any text on this site. Except the blinking cursor character. Cool effect, huh?" }), (0,root_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)("p", { children: ["This site's source code is available ", (0,root_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("a", { target: "_blank", rel: "noreferrer", href: "https://github.com/BFHS-Open/site", children: "here" }), ". It's licensed under the ISC License, which according to Wikipedia is (hopefully) just the MIT License but more concise."] }), (0,root_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("p", { children: "Have fun!" }), (0,root_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("p", { children: "-Austin" })] });
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,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S0FBSyxDQUFDLEdBQUMsQ0FBQyxNQUFNLEVBQUMsQ0FBQyxhQUM3RSxPQUFPLENBQUMsRUFBRSxDQUFDLEVBQUUsS0FBSyxHQUFDLENBQUMsR0FBQyxLQUFLLEdBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxLQUFLLEdBQUMsQ0FBQyxHQUFDLEtBQUssR0FBQyxDQUFDLEVBQUUsTUFBTSxFQUFFLENBQUMsRUFDM0QsT0FBTyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsS0FBSyxHQUFDLENBQUMsR0FBQyxLQUFLLEdBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxLQUFLLEdBQUMsQ0FBQyxHQUFDLEtBQUssR0FBQyxDQUFDLEVBQUUsTUFBTSxFQUFFLENBQUMsRUFDNUQsT0FBTyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsS0FBSyxHQUFDLENBQUMsR0FBQyxLQUFLLEdBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEtBQUssR0FBQyxDQUFDLEdBQUMsS0FBSyxHQUFDLENBQUMsRUFBRSxNQUFNLEVBQUUsQ0FBQyxFQUM3RCxPQUFPLENBQUMsRUFBRSxDQUFDLEVBQUUsS0FBSyxHQUFDLENBQUMsR0FBQyxLQUFLLEdBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEtBQUssR0FBQyxDQUFDLEdBQUMsS0FBSyxHQUFDLENBQUMsRUFBRSxNQUFNLEVBQUUsQ0FBQyxJQUMzRCxFQUNOLGdFQUFLLEtBQUssRUFBQyxPQUFPLEVBQUMsS0FBSyxFQUFFLGlEQUFTLENBQUMsRUFBRSxHQUFHLEVBQUUsY0FBYyxDQUFDLE1BQU0sR0FBQyxLQUFLLEdBQUMsQ0FBQyxNQUFNLEVBQUUsQ0FBQyxhQUM3RSwrREFBSyxLQUFLLEVBQUMsUUFBUSxFQUFDLEtBQUssRUFBRSxpREFBUyxDQUFDLEVBQUUsS0FBSyxFQUFFLFNBQVMsRUFBRSxLQUFLLEVBQUUsTUFBTSxFQUFFLEtBQUssRUFBRSxHQUFHLEVBQUUsY0FBYyxDQUFDLEtBQUssR0FBQyxDQUFDLHFCQUFxQixFQUFDLENBQUMsR0FBSSxFQUNySSwrREFBSyxL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QUNJLElBQUksRUFBRSxJQUFJO1FBQ1YsU0FBUyxFQUFFLDZEQUE2RDtLQUMzRTtJQUNEO1FBQ0ksSUFBSSxFQUFFLEtBQUs7UUFDWCxTQUFTLEVBQUUsOERBQThEO0tBQzVFO0NBQ0osQ0FBQyxDQUFDO0FBRUgsTUFBTSxPQUFPLEdBQUcsSUFBSSxnREFBTyxDQUFDLElBQUksQ0FBQyxDQUFDO0FBQ2xDLE9BQU8sQ0FBQyxJQUFJLEVBQUUsQ0FBQyIsInNvdXJjZXMiOlsid2VicGFjazovL2Jlbi1zaXRlLy4vanMvY3B1L2NvbXB1dGVyLnRzIiwid2VicGFjazovL2Jlbi1zaXRlLy4vanMvY3B1L2ZpbGVzeXN0ZW0udHMiLCJ3ZWJwYWNrOi8vYmVuLXNpdGUvLi9qcy9jcHUvcHJvZ3JhbXMvY29sb3IudHMiLCJ3ZWJwYWNrOi8vYmVuLXNpdGUvLi9qcy9jcHUvcHJvZ3JhbXMvZnMudHMiLCJ3ZWJwYWNrOi8vYmVuLXNpdGUvLi9qcy9jcHUvcHJvZ3JhbXMvaGVscC50cyIsIndlYnBhY2s6Ly9iZW4tc2l0ZS8uL2pzL2pzeC1ydW50aW1lLnRzIiwid2VicGFjazovL2Jlbi1zaXRlLy4vanMvbW9uaXRvci50cyIsIndlYnBhY2s6Ly9iZW4tc2l0ZS8uL2pzL29iamVjdHMvdGFibGUudHN4Iiwid2VicGFjazovL2Jlbi1zaXRlLy4vanMvdXRpbHMudHMiLCJ3ZWJwYWNrOi8vYmVuLXNpdGUvLi9qcy93b3JsZC50cyIsIndlYnBhY2s6Ly9iZW4tc2l0ZS93ZWJwYWNrL2Jvb3RzdHJhcCIsIndlYnBhY2s6Ly9iZW4tc2l0ZS93ZWJwYWNrL3J1bnRpbWUvZGVmaW5lIHByb3BlcnR5IGdldHRlcnMiLCJ3ZWJwYWNrOi8vYmVuLXNpdGUvd2VicGFjay9ydW50aW1lL2hhc093blByb3BlcnR5IHNob3J0aGFuZCIsIndlYnBhY2s6Ly9iZW4tc2l0ZS93ZWJwYWNrL3J1bnRpbWUvbWFrZSBuYW1lc3BhY2Ugb2JqZWN0Iiwid2VicGFjazovL2Jlbi1zaXRlLy4vanMvbWFpbi50c3giXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHR5cGUgTW9uaXRvciBmcm9tIFwiLi4vbW9uaXRvclwiO1xyXG5pbXBvcnQgdHlwZSB7IFByb2dyYW0gfSBmcm9tIFwiLi9wcm9ncmFtXCI7XHJcbmltcG9ydCBoZWxwIGZyb20gXCIuL3Byb2dyYW1zL2hlbHBcIjtcclxuaW1wb3J0IGNvbG9yIGZyb20gXCIuL3Byb2dyYW1zL2NvbG9yXCI7XHJcbmltcG9ydCB7IG1rZGlyLCB0b3VjaCwgY2F0LCB3cml0ZUZpbGUsIGxzLCBybSB9IGZyb20gXCIuL3Byb2dyYW1zL2ZzXCI7XHJcbmltcG9ydCB7IEZpbGVzeXN0ZW0gfSBmcm9tIFwiLi9maWxlc3lzdGVtXCI7XHJcblxyXG5leHBvcnQgY2xhc3MgQ29tcHV0ZXIge1xyXG4gICAgcHVibGljIG1vbml0b3I6IE1vbml0b3I7XHJcbiAgICBwdWJsaWMgcHJvZ3JhbXM6IE1hcDxzdHJpbmcsIFByb2dyYW0+O1xyXG4gICAgcHVibGljIGZpbGVzeXN0ZW06IEZpbGVzeXN0ZW07XHJcblxyXG4gICAgY29uc3RydWN0b3IobW9uaXRvcjogTW9uaXRvcikge1xyXG4gICAgICAgIHRoaXMubW9uaXRvciA9IG1vbml0b3I7XHJcbiAgICAgICAgdGhpcy5wcm9ncmFtcyA9IG5ldyBNYXAoT2JqZWN0LmVudHJpZXMoe1xyXG4gICAgICAgICAgICBoZWxwLFxyXG4gICAgICAgICAgICBjb2xvcixcclxuICAgICAgICAgICAgbWtkaXIsXHJcbiAgICAgICAgICAgIHRvdWNoLFxyXG4gICAgICAgICAgICBjYXQsXHJcbiAgICAgICAgICAgIFwid3JpdGUtZmlsZVwiOiB3cml0ZUZpbGUsXHJcbiAgICAgICAgICAgIGxzLFxyXG4gICAgICAgICAgICBybSxcclxuICAgICAgICB9KSk7XHJcbiAgICAgICAgdGhpcy5maWxlc3lzdGVtID0gbmV3IEZpbGVzeXN0ZW0oKTtcclxuICAgIH1cclxuXHJcbiAgICBhc3luYyBpbml0KCkge1xyXG4gICAgICAgIGF3YWl0IHRoaXMuZmlsZXN5c3RlbS5pbml0KCk7XHJcbiAgICB9XHJcblxyXG4gICAgYXN5bmMgcnVuKHN0cjogc3RyaW5nKSB7XHJcbiAgICAgICAgY29uc3QgcmVzID0gc3RyLnRyaW0oKS5zcGxpdCgvXFxzKy91KTtcclxuICAgICAgICBpZiAocmVzWzBdID09PSBcIlwiKSByZXR1cm47XHJcblxyXG4gICAgICAgIGNvbnN0IGNtZCA9IHJlc1swXTtcclxuICAgICAgICBpZiAodGhpcy5wcm9ncmFtcy5oYXMoY21kKSkge1xyXG4gICAgICAgICAgICBhd2FpdCB0aGlzLnByb2dyYW1zLmdldChjbWQpISh7IG91dDogKC4uLmFyZ3MpID0+IHRoaXMubW9uaXRvci5wcmludCguLi5hcmdzKSwgbW9uaXRvcjogdGhpcy5tb25pdG9yIH0sIHJlcyk7XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHRoaXMubW9uaXRvci5wcmludChgVW5yZWNvZ25pemVkIGNvbW1hbmQgXCIke2NtZH1cIlxcbmApO1xyXG4gICAgfVxyXG59XHJcbiIsImltcG9ydCB7IERpciwgRW50cnkgfSBmcm9tIFwiLi9maWxlXCI7XHJcblxyXG5jb25zdCBwcm9taXNpZnkgPSA8VD4ocmVxOiBJREJSZXF1ZXN0PFQ+KSA9PiBuZXcgUHJvbWlzZTxUPigocmVzLCByZWopID0+IHtcclxuICAgIHJlcS5hZGRFdmVudExpc3RlbmVyKFwic3VjY2Vzc1wiLCBmdW5jdGlvbigpIHtcclxuICAgICAgICByZXModGhpcy5yZXN1bHQpO1xyXG4gICAgfSk7XHJcbiAgICByZXEuYWRkRXZlbnRMaXN0ZW5lcihcImVycm9yXCIsIGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIGFsZXJ0KHRoaXMuZXJyb3IpO1xyXG4gICAgICAgIHJlaih0aGlzLmVycm9yKTtcclxuICAgICAgICAvLyBUT0RPOiBlcnJvciBoYW5kbGluZ1xyXG4gICAgfSk7XHJcbn0pO1xyXG5cclxuY29uc3QgcGFyc2UgPSAocGF0aDogc3RyaW5nKSA9PiB7XHJcbiAgICByZXR1cm4gcGF0aC50cmltKCkuc3BsaXQoXCIvXCIpLmZpbHRlcigobmFtZSkgPT4gbmFtZSAhPT0gXCJcIik7XHJcbn07XHJcblxyXG5leHBvcnQgY2xhc3MgRmlsZXN5c3RlbSB7XHJcbiAgICBwdWJsaWMgcm9vdCE6IElEQlZhbGlkS2V5O1xyXG4gICAgcHVibGljIGRiITogSURCRGF0YWJhc2U7XHJcblxyXG4gICAgYXN5bmMgaW5pdCgpIHtcclxuICAgICAgICBjb25zdCByZXF1ZXN0ID0gd2luZG93LmluZGV4ZWREQi5vcGVuKFwiZmlsZXN5c3RlbVwiLCAxKTtcclxuICAgICAgICByZXF1ZXN0LmFkZEV2ZW50TGlzdGVuZXIoXCJ1cGdyYWRlbmVlZGVkXCIsIGFzeW5jIGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICBjb25zdCBkYiA9IHRoaXMucmVzdWx0O1xyXG4gICAgICAgICAgICBjb25zdCBpbmZvID0gZGIuY3JlYXRlT2JqZWN0U3RvcmUoXCJpbmZvXCIpO1xyXG4gICAgICAgICAgICBjb25zdCBmaWxlcyA9IGRiLmNyZWF0ZU9iamVjdFN0b3JlKFwiZmlsZXNcIiwgeyBhdXRvSW5jcmVtZW50OiB0cnVlIH0pXHJcblxyXG4gICAgICAgICAgICBjb25zdCByZXEgPSBmaWxlcy5hZGQoe1xyXG4gICAgICAgICAgICAgICAgdHlwZTogXCJkaXJcIixcclxuICAgICAgICAgICAgICAgIGVudHJ5czoge30sXHJcbiAgICAgICAgICAgIH0gc2F0aXNmaWVzIERpcik7XHJcbiAgICAgICAgICAgIGluZm8ucHV0KGF3YWl0IHByb21pc2lmeShyZXEpLCBcInJvb3RcIik7XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgdGhpcy5kYiA9IGF3YWl0IHByb21pc2lmeShyZXF1ZXN0KTtcclxuICAgICAgICB0aGlzLnJvb3QgPSBhd2FpdCBwcm9taXNpZnkodGhpcy5kYi50cmFuc2FjdGlvbihcImluZm9cIikub2JqZWN0U3RvcmUoXCJpbmZvXCIpLmdldChcInJvb3RcIikpO1xyXG4gICAgfVxyXG5cclxuICAgIGFzeW5jIHdhbGsoYmFzZTogSURCVmFsaWRLZXksIG5hbWVzOiBzdHJpbmdbXSkge1xyXG4gICAgICAgIGZvciAoY29uc3QgbmFtZSBvZiBuYW1lcykge1xyXG4gICAgICAgICAgICBjb25zdCByZXEgPSB0aGlzLmRiLnRyYW5zYWN0aW9uKFwiZmlsZXNcIikub2JqZWN0U3RvcmUoXCJmaWxlc1wiKS5nZXQoYmFzZSkgYXMgSURCUmVxdWVzdDxFbnRyeT47XHJcbiAgICAgICAgICAgIGNvbnN0IGVudHJ5ID0gYXdhaXQgcHJvbWlzaWZ5KHJlcSk7XHJcbiAgICAgICAgICAgIGlmIChlbnRyeS50eXBlICE9PSBcImRpclwiKSB0aHJvdyBcIm5vdCBhIGRpcmVjdG9yeVwiO1xyXG4gICAgICAgICAgICBpZiAoIShuYW1lIGluIGVudHJ5LmVudHJ5cykpIHRocm93IFwiZG9lc24ndCBleGlzdFwiO1xyXG4gICAgICAgICAgICBiYXNlID0gZW50cnkuZW50cnlzW25hbWVdO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gYmFzZTtcclxuICAgIH1cclxuXHJcbiAgICBhc3luYyBtYWtlRGlyKHBhdGg6IHN0cmluZykge1xyXG4gICAgICAgIGNvbnN0IG5hbWVzID0gcGFyc2UocGF0aCk7XHJcbiAgICAgICAgaWYgKG5hbWVzLmxlbmd0aCA9PT0gMCkgdGhyb3cgXCJubyBuYW1lIHNwZWNpZmllZFwiO1xyXG4gICAgICAgIGNvbnN0IHRhcmdldCA9IG5hbWVzLnBvcCgpITtcclxuICAgICAgICBjb25zdCBkaXIgPSBhd2FpdCB0aGlzLndhbGsodGhpcy5yb290LCBuYW1lcyk7XHJcbiAgICBcclxuICAgICAgICBjb25zdCBlbnRyeSA9IGF3YWl0IHByb21pc2lmeSh0aGlzLmRiLnRyYW5zYWN0aW9uKFwiZmlsZXNcIikub2JqZWN0U3RvcmUoXCJmaWxlc1wiKS5nZXQoZGlyKSBhcyBJREJSZXF1ZXN0PEVudHJ5Pik7XHJcbiAgICAgICAgaWYgKGVudHJ5LnR5cGUgIT09IFwiZGlyXCIpIHRocm93IFwibm90IGEgZGlyZWN0b3J5XCI7XHJcbiAgICAgICAgaWYgKHRhcmdldCBpbiBlbnRyeS5lbnRyeXMpIHRocm93IFwiaXRlbSBhbHJlYWR5IGV4aXN0c1wiO1xyXG5cclxuICAgICAgICBjb25zdCByZXF1ZXN0ID0gdGhpcy5kYi50cmFuc2FjdGlvbihcImZpbGVzXCIsIFwicmVhZHdyaXRlXCIpLm9iamVjdFN0b3JlKFwiZmlsZXNcIikuYWRkKHtcclxuICAgICAgICAgICAgdHlwZTogXCJkaXJcIixcclxuICAgICAgICAgICAgZW50cnlzOiB7fSxcclxuICAgICAgICB9KTtcclxuICAgICAgICBlbnRyeS5lbnRyeXNbdGFyZ2V0XSA9IGF3YWl0IHByb21pc2lmeShyZXF1ZXN0KSBhcyBudW1iZXI7XHJcbiAgICAgICAgYXdhaXQgcHJvbWlzaWZ5KHRoaXMuZGIudHJhbnNhY3Rpb24oXCJmaWxlc1wiLCBcInJlYWR3cml0ZVwiKS5vYmplY3RTdG9yZShcImZpbGVzXCIpLnB1dChlbnRyeSwgZGlyKSk7XHJcbiAgICB9XHJcblxyXG4gICAgYXN5bmMgbWFrZUZpbGUocGF0aDogc3RyaW5nKSB7XHJcbiAgICAgICAgY29uc3QgbmFtZXMgPSBwYXJzZShwYXRoKTtcclxuICAgICAgICBpZiAobmFtZXMubGVuZ3RoID09PSAwKSB0aHJvdyBcIm5vIG5hbWUgc3BlY2lmaWVkXCI7XHJcbiAgICAgICAgY29uc3QgdGFyZ2V0ID0gbmFtZXMucG9wKCkhO1xyXG4gICAgICAgIGNvbnN0IGRpciA9IGF3YWl0IHRoaXMud2Fsayh0aGlzLnJvb3QsIG5hbWVzKTtcclxuXHJcbiAgICAgICAgY29uc3QgZW50cnkgPSBhd2FpdCBwcm9taXNpZnkodGhpcy5kYi50cmFuc2FjdGlvbihcImZpbGVzXCIpLm9iamVjdFN0b3JlKFwiZmlsZXNcIikuZ2V0KGRpcikgYXMgSURCUmVxdWVzdDxFbnRyeT4pO1xyXG4gICAgICAgIGlmIChlbnRyeS50eXBlICE9PSBcImRpclwiKSB0aHJvdyBcIm5vdCBhIGRpcmVjdG9yeVwiO1xyXG4gICAgICAgIGlmICh0YXJnZXQgaW4gZW50cnkuZW50cnlzKSB0aHJvdyBcIml0ZW0gYWxyZWFkeSBleGlzdHNcIjtcclxuXHJcbiAgICAgICAgY29uc3QgcmVxdWVzdCA9IHRoaXMuZGIudHJhbnNhY3Rpb24oXCJmaWxlc1wiLCBcInJlYWR3cml0ZVwiKS5vYmplY3RTdG9yZShcImZpbGVzXCIpLmFkZCh7XHJcbiAgICAgICAgICAgIHR5cGU6IFwiZmlsZVwiLFxyXG4gICAgICAgICAgICBjb250ZW50czogXCJcIixcclxuICAgICAgICB9KTtcclxuICAgICAgICBlbnRyeS5lbnRyeXNbdGFyZ2V0XSA9IGF3YWl0IHByb21pc2lmeShyZXF1ZXN0KSBhcyBudW1iZXI7XHJcbiAgICAgICAgYXdhaXQgcHJvbWlzaWZ5KHRoaXMuZGIudHJhbnNhY3Rpb24oXCJmaWxlc1wiLCBcInJlYWR3cml0ZVwiKS5vYmplY3RTdG9yZShcImZpbGVzXCIpLnB1dChlbnRyeSwgZGlyKSk7XHJcbiAgICB9XHJcblxyXG4gICAgYXN5bmMgcmVhZEZpbGUocGF0aDogc3RyaW5nKSB7XHJcbiAgICAgICAgY29uc3QgbmFtZXMgPSBwYXJzZShwYXRoKTtcclxuICAgICAgICBjb25zdCB0YXJnZXQgPSBhd2FpdCB0aGlzLndhbGsodGhpcy5yb290LCBuYW1lcyk7XHJcblxyXG4gICAgICAgIGNvbnN0IGVudHJ5ID0gYXdhaXQgcHJvbWlzaWZ5KHRoaXMuZGIudHJhbnNhY3Rpb24oXCJmaWxlc1wiKS5vYmplY3RTdG9yZShcImZpbGVzXCIpLmdldCh0YXJnZXQpIGFzIElEQlJlcXVlc3Q8RW50cnk+KTtcclxuICAgICAgICBpZiAoZW50cnkudHlwZSAhPT0gXCJmaWxlXCIpIHRocm93IFwibm90IGEgZmlsZVwiO1xyXG4gICAgICAgIHJldHVybiBlbnRyeS5jb250ZW50cztcclxuICAgIH1cclxuXHJcbiAgICBhc3luYyB3cml0ZUZpbGUocGF0aDogc3RyaW5nLCBjb250ZW50czogc3RyaW5nKSB7XHJcbiAgICAgICAgY29uc3QgbmFtZXMgPSBwYXJzZShwYXRoKTtcclxuICAgICAgICBpZiAobmFtZXMubGVuZ3RoID09PSAwKSB0aHJvdyBcIm5vIG5hbWUgc3BlY2lmaWVkXCI7XHJcbiAgICAgICAgY29uc3QgdGFyZ2V0ID0gYXdhaXQgdGhpcy53YWxrKHRoaXMucm9vdCwgbmFtZXMpO1xyXG5cclxuICAgICAgICBhd2FpdCBwcm9taXNpZnkodGhpcy5kYi50cmFuc2FjdGlvbihcImZpbGVzXCIsIFwicmVhZHdyaXRlXCIpLm9iamVjdFN0b3JlKFwiZmlsZXNcIikucHV0KHtcclxuICAgICAgICAgICAgdHlwZTogXCJmaWxlXCIsXHJcbiAgICAgICAgICAgIGNvbnRlbnRzLFxyXG4gICAgICAgIH0sIHRhcmdldCkpO1xyXG4gICAgfVxyXG5cclxuICAgIGFzeW5jIHJlYWREaXIocGF0aDogc3RyaW5nKSB7XHJcbiAgICAgICAgY29uc3QgbmFtZXMgPSBwYXJzZShwYXRoKTtcclxuICAgICAgICBjb25zdCB0YXJnZXQgPSBhd2FpdCB0aGlzLndhbGsodGhpcy5yb290LCBuYW1lcyk7XHJcblxyXG4gICAgICAgIGNvbnN0IGVudHJ5ID0gYXdhaXQgcHJvbWlzaWZ5KHRoaXMuZGIudHJhbnNhY3Rpb24oXCJmaWxlc1wiKS5vYmplY3RTdG9yZShcImZpbGVzXCIpLmdldCh0YXJnZXQpIGFzIElEQlJlcXVlc3Q8RW50cnk+KTtcclxuICAgICAgICBpZiAoZW50cnkudHlwZSAhPT0gXCJkaXJcIikgdGhyb3cgXCJub3QgYSBkaXJlY3RvcnlcIjtcclxuICAgICAgICByZXR1cm4gZW50cnkuZW50cnlzO1xyXG4gICAgfVxyXG5cclxuICAgIGFzeW5jIHJlbW92ZShwYXRoOiBzdHJpbmcpIHtcclxuICAgICAgICBjb25zdCBuYW1lcyA9IHBhcnNlKHBhdGgpO1xyXG4gICAgICAgIGlmIChuYW1lcy5sZW5ndGggPT09IDApIHRocm93IFwibm8gbmFtZSBzcGVjaWZpZWRcIjtcclxuICAgICAgICBjb25zdCB0YXJnZXQgPSBuYW1lcy5wb3AoKSE7XHJcbiAgICAgICAgY29uc3QgZGlyID0gYXdhaXQgdGhpcy53YWxrKHRoaXMucm9vdCwgbmFtZXMpO1xyXG5cclxuICAgICAgICBjb25zdCBlbnRyeSA9IGF3YWl0IHByb21pc2lmeSh0aGlzLmRiLnRyYW5zYWN0aW9uKFwiZmlsZXNcIikub2JqZWN0U3RvcmUoXCJmaWxlc1wiKS5nZXQoZGlyKSBhcyBJREJSZXF1ZXN0PEVudHJ5Pik7XHJcbiAgICAgICAgaWYgKGVudHJ5LnR5cGUgIT09IFwiZGlyXCIpIHRocm93IFwibm90IGEgZGlyZWN0b3J5XCI7XHJcbiAgICAgICAgaWYgKCEodGFyZ2V0IGluIGVudHJ5LmVudHJ5cykpIHRocm93IFwiaXRlbSBkb2Vzbid0IGV4aXN0XCI7XHJcblxyXG4gICAgICAgIGRlbGV0ZSBlbnRyeS5lbnRyeXNbdGFyZ2V0XTtcclxuICAgICAgICBhd2FpdCBwcm9taXNpZnkodGhpcy5kYi50cmFuc2FjdGlvbihcImZpbGVzXCIsIFwicmVhZHdyaXRlXCIpLm9iamVjdFN0b3JlKFwiZmlsZXNcIikucHV0KGVudHJ5LCBkaXIpKTtcclxuICAgICAgICAvLyBUT0RPOiBmaXggbWVtb3J5IGxlYWtcclxuICAgIH1cclxufVxyXG4iLCJpbXBvcnQgdHlwZSB7IFByb2dyYW0gfSBmcm9tIFwiLi4vcHJvZ3JhbVwiO1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgKGFzeW5jIChzeXMsIGFyZ3YpID0+IHtcclxuICAgIGNvbnN0IGh1ZSA9IGFyZ3ZbMV0gPT09IHVuZGVmaW5lZCA/IE1hdGgucmFuZG9tKCkgOiArYXJndlsxXS8zNjA7XHJcbiAgICBpZiAoIU51bWJlci5pc0Zpbml0ZShodWUpKSB7XHJcbiAgICAgICAgc3lzLm91dChgSW52YWxpZCBodWUgYW5nbGUgXCIke2FyZ3ZbMV19XCJcXG5gKTtcclxuICAgICAgICByZXR1cm47XHJcbiAgICB9XHJcbiAgICBzeXMubW9uaXRvci5yb290LnN0eWxlLnNldFByb3BlcnR5KFwiLS1zY3JlZW4tY29sb3JcIiwgYGhzbCgke2h1ZSA/PyBNYXRoLnJhbmRvbSgpfXR1cm4gMTAwJSA1MCUpYCk7XHJcbn0pIHNhdGlzZmllcyBQcm9ncmFtO1xyXG4iLCJpbXBvcnQgdHlwZSB7IFByb2dyYW0gfSBmcm9tIFwiLi4vcHJvZ3JhbVwiO1xyXG5cclxuZXhwb3J0IGNvbnN0IG1rZGlyOiBQcm9ncmFtID0gYXN5bmMgKHN5cywgYXJndikgPT4ge1xyXG4gICAgaWYgKGFyZ3YubGVuZ3RoIDwgMikge1xyXG4gICAgICAgIHN5cy5vdXQoXCJuZWVkIGFyZ3VtZW50XFxuXCIpO1xyXG4gICAgICAgIHJldHVybjtcclxuICAgIH1cclxuICAgIHRyeSB7XHJcbiAgICAgICAgYXdhaXQgc3lzLm1vbml0b3IuY29tcHV0ZXIuZmlsZXN5c3RlbS5tYWtlRGlyKGFyZ3ZbMV0pO1xyXG4gICAgfSBjYXRjaCAoZXJyKSB7XHJcbiAgICAgICAgc3lzLm91dChgJHtlcnJ9XFxuYCk7XHJcbiAgICAgICAgcmV0dXJuO1xyXG4gICAgfVxyXG59O1xyXG5cclxuZXhwb3J0IGNvbnN0IHRvdWNoOiBQcm9ncmFtID0gYXN5bmMgKHN5cywgYXJndikgPT4ge1xyXG4gICAgaWYgKGFyZ3YubGVuZ3RoIDwgMikge1xyXG4gICAgICAgIHN5cy5vdXQoXCJuZWVkIGFyZ3VtZW50XFxuXCIpO1xyXG4gICAgICAgIHJldHVybjtcclxuICAgIH1cclxuICAgIHRyeSB7XHJcbiAgICAgICAgYXdhaXQgc3lzLm1vbml0b3IuY29tcHV0ZXIuZmlsZXN5c3RlbS5tYWtlRmlsZShhcmd2WzFdKTtcclxuICAgIH0gY2F0Y2ggKGVycikge1xyXG4gICAgICAgIHN5cy5vdXQoYCR7ZXJyfVxcbmApO1xyXG4gICAgICAgIHJldHVybjtcclxuICAgIH1cclxufTtcclxuXHJcbmV4cG9ydCBjb25zdCBjYXQ6IFByb2dyYW0gPSBhc3luYyAoc3lzLCBhcmd2KSA9PiB7XHJcbiAgICBpZiAoYXJndi5sZW5ndGggPCAyKSB7XHJcbiAgICAgICAgc3lzLm91dChcIm5lZWQgYXJndW1lbnRcXG5cIik7XHJcbiAgICAgICAgcmV0dXJuO1xyXG4gICAgfVxyXG4gICAgdHJ5IHtcclxuICAgICAgICBzeXMub3V0KGF3YWl0IHN5cy5tb25pdG9yLmNvbXB1dGVyLmZpbGVzeXN0ZW0ucmVhZEZpbGUoYXJndlsxXSkpO1xyXG4gICAgfSBjYXRjaCAoZXJyKSB7XHJcbiAgICAgICAgc3lzLm91dChgJHtlcnJ9XFxuYCk7XHJcbiAgICAgICAgcmV0dXJuO1xyXG4gICAgfVxyXG59O1xyXG5cclxuZXhwb3J0IGNvbnN0IHdyaXRlRmlsZTogUHJvZ3JhbSA9IGFzeW5jIChzeXMsIGFyZ3YpID0+IHtcclxuICAgIGlmIChhcmd2Lmxlbmd0aCA8IDMpIHtcclxuICAgICAgICBzeXMub3V0KFwibmVlZCAyIGFyZ3VtZW50c1xcblwiKTtcclxuICAgICAgICByZXR1cm47XHJcbiAgICB9XHJcbiAgICB0cnkge1xyXG4gICAgICAgIGF3YWl0IHN5cy5tb25pdG9yLmNvbXB1dGVyLmZpbGVzeXN0ZW0ud3JpdGVGaWxlKGFyZ3ZbMV0sIGFyZ3ZbMl0gKyBcIlxcblwiKTtcclxuICAgIH0gY2F0Y2ggKGVycikge1xyXG4gICAgICAgIHN5cy5vdXQoYCR7ZXJyfVxcbmApO1xyXG4gICAgICAgIHJldHVybjtcclxuICAgIH1cclxufTtcclxuXHJcbmNvbnN0IGxpc3RpbmcgPSAoZW50cnlzOiBSZWNvcmQ8c3RyaW5nLCBudW1iZXI+KSA9PiB7XHJcbiAgICByZXR1cm4gT2JqZWN0LmtleXMoZW50cnlzKS5tYXAocyA9PiBzICsgXCJcXG5cIikuam9pbihcIlwiKTtcclxufTtcclxuXHJcbmV4cG9ydCBjb25zdCBsczogUHJvZ3JhbSA9IGFzeW5jIChzeXMsIGFyZ3YpID0+IHtcclxuICAgIHRyeSB7XHJcbiAgICAgICAgc3lzLm91dChsaXN0aW5nKGF3YWl0IHN5cy5tb25pdG9yLmNvbXB1dGVyLmZpbGVzeXN0ZW0ucmVhZERpcihhcmd2WzFdID8/IFwiL1wiKSkpO1xyXG4gICAgfSBjYXRjaCAoZXJyKSB7XHJcbiAgICAgICAgc3lzLm91dChgJHtlcnJ9XFxuYCk7XHJcbiAgICAgICAgcmV0dXJuO1xyXG4gICAgfVxyXG59O1xyXG5cclxuZXhwb3J0IGNvbnN0IHJtOiBQcm9ncmFtID0gYXN5bmMgKHN5cywgYXJndikgPT4ge1xyXG4gICAgaWYgKGFyZ3YubGVuZ3RoIDwgMikge1xyXG4gICAgICAgIHN5cy5vdXQoXCJuZWVkIGFyZ3VtZW50XFxuXCIpO1xyXG4gICAgICAgIHJldHVybjtcclxuICAgIH1cclxuICAgIHRyeSB7XHJcbiAgICAgICAgYXdhaXQgc3lzLm1vbml0b3IuY29tcHV0ZXIuZmlsZXN5c3RlbS5yZW1vdmUoYXJndlsxXSk7XHJcbiAgICB9IGNhdGNoIChlcnIpIHtcclxuICAgICAgICBzeXMub3V0KGAke2Vycn1cXG5gKTtcclxuICAgICAgICByZXR1cm47XHJcbiAgICB9XHJcbn07XHJcbiIsImltcG9ydCB0eXBlIHsgUHJvZ3JhbSB9IGZyb20gXCIuLi9wcm9ncmFtXCI7XHJcblxyXG5jb25zdCBtZXNzYWdlID0gYFxcXHJcbkxpc3Qgb2YgY29tbWFuZHM6XHJcbiAgICBoZWxwXHJcbiAgICAgICAgRGlzcGxheSB0aGlzIG1lc3NhZ2UuXHJcbiAgICBjb2xvciBbPGFuZ2xlPl1cclxuICAgICAgICBDaGFuZ2UgdGVybWluYWwgY29sb3IuXHJcbiAgICBta2RpciBbPG5hbWU+XVxyXG4gICAgICAgIENyZWF0ZSBhIGRpcmVjdG9yeS4gUGFyZW50IGRpcmVjdG9yeSBtdXN0IGV4aXN0LlxyXG4gICAgdG91Y2ggWzxuYW1lPl1cclxuICAgICAgICBDcmVhdGUgYW4gZW1wdHkgZmlsZS4gUGFyZW50IGRpcmVjdG9yeSBtdXN0IGV4aXN0LlxyXG4gICAgY2F0IFs8bmFtZT5dXHJcbiAgICAgICAgUHJpbnQgdGhlIGNvbnRlbnRzIG9mIGEgZmlsZS5cclxuICAgIGxzIFs8bmFtZT5dXHJcbiAgICAgICAgUHJpbnQgdGhlIGVudHJpZXMgaW4gYSBkaXJlY3RvcnkuXHJcbiAgICBybSBbPG5hbWU+XVxyXG4gICAgICAgIERlbGV0ZSBhbiBlbnRyeSBmcm9tIGEgZGlyZWN0b3J5LlxyXG5UaGlzIHRlcm1pbmFsIGlzIHZlcnkgd29yay1pbi1wcm9ncmVzcy5cclxuYFxyXG5cclxuZXhwb3J0IGRlZmF1bHQgKGFzeW5jIChzeXMsIGFyZ3YpID0+IHtcclxuICAgIHN5cy5vdXQobWVzc2FnZSk7XHJcbn0pIHNhdGlzZmllcyBQcm9ncmFtO1xyXG4iLCIvKlxyXG5vcmlnaW5hbGx5IHVzZWQgYXQgaHR0cHM6Ly9naXRodWIuY29tL3RvYnNwci1nYW1lcy9zaGFwZXotY29tbXVuaXR5LWVkaXRpb24vcHVsbC8xMi9jb21taXRzLzU2MzMwYTE0MzNlODFhMjYwYmU2NjY0OGY5MGRmNzdjODE3MjMwOGZcclxucmVsaWNlbnNlZCBieSBtZSwgdGhlIG9yaWdpbmFsIGF1dGhvclxyXG4qL1xyXG5cclxuZnVuY3Rpb24gaXNEaXNwbGF5ZWQobm9kZTogSlNYLk5vZGUpOiBub2RlIGlzIEV4Y2x1ZGU8SlNYLk5vZGUsIGJvb2xlYW4gfCBudWxsIHwgdW5kZWZpbmVkPiB7XHJcbiAgICByZXR1cm4gdHlwZW9mIG5vZGUgIT09IFwiYm9vbGVhblwiICYmIG5vZGUgIT0gbnVsbDtcclxufVxyXG5cclxuLyoqXHJcbiAqIEpTWCBmYWN0b3J5LlxyXG4gKi9cclxuZnVuY3Rpb24ganN4PFQgZXh0ZW5kcyBrZXlvZiBKU1guSW50cmluc2ljRWxlbWVudHM+KHRhZzogVCwgcHJvcHM6IEpTWC5JbnRyaW5zaWNFbGVtZW50c1tUXSk6IEhUTUxFbGVtZW50O1xyXG5mdW5jdGlvbiBqc3g8VSBleHRlbmRzIEpTWC5Qcm9wcz4odGFnOiBKU1guQ29tcG9uZW50PFU+LCBwcm9wczogVSk6IEVsZW1lbnQ7XHJcbmZ1bmN0aW9uIGpzeDxVIGV4dGVuZHMgSlNYLlByb3BzPihcclxuICAgIHRhZzoga2V5b2YgSlNYLkludHJpbnNpY0VsZW1lbnRzIHwgSlNYLkNvbXBvbmVudDxVPixcclxuICAgIHByb3BzOiBVXHJcbik6IEpTWC5FbGVtZW50IHtcclxuICAgIGlmICh0eXBlb2YgdGFnID09PSBcImZ1bmN0aW9uXCIpIHJldHVybiB0YWcocHJvcHMpO1xyXG5cclxuICAgIGNvbnN0IHsgY2hpbGRyZW4sIC4uLmF0dHJzIH0gPSBwcm9wcyBhcyBKU1guSW50cmluc2ljRWxlbWVudHNba2V5b2YgSlNYLkludHJpbnNpY0VsZW1lbnRzXTtcclxuXHJcbiAgICBjb25zdCBlbGVtZW50ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCh0YWcpO1xyXG4gICAgT2JqZWN0LmVudHJpZXMoYXR0cnMpLmZvckVhY2goKFtrZXksIHZhbHVlXSkgPT4ge1xyXG4gICAgICAgIHN3aXRjaCAodHlwZW9mIHZhbHVlKSB7XHJcbiAgICAgICAgICAgIGNhc2UgXCJib29sZWFuXCI6XHJcbiAgICAgICAgICAgICAgICBpZiAoIXZhbHVlKSByZXR1cm47XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gZWxlbWVudC5zZXRBdHRyaWJ1dGUoa2V5LCBcIlwiKTtcclxuICAgICAgICAgICAgY2FzZSBcIm51bWJlclwiOlxyXG4gICAgICAgICAgICBjYXNlIFwic3RyaW5nXCI6XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gZWxlbWVudC5zZXRBdHRyaWJ1dGUoa2V5LCBgJHt2YWx1ZX1gKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcihcIkpTWCBlbGVtZW50IGF0dHJpYnV0ZSBhc3NpZ25lZCBpbnZhbGlkIHR5cGVcIik7XHJcbiAgICB9KTtcclxuICAgIGVsZW1lbnQuYXBwZW5kKC4uLihbY2hpbGRyZW5dLmZsYXQoSW5maW5pdHkpIGFzIEpTWC5Ob2RlW10pLmZpbHRlcihpc0Rpc3BsYXllZCkpO1xyXG4gICAgcmV0dXJuIGVsZW1lbnQ7XHJcbn1cclxuXHJcbi8vIGZ1bmN0aW9uYWwgY29tcG9uZW50LCBjYWxsZWQgaW5kaXJlY3RseSBhcyBganN4KEZyYWdtZW50LCBwcm9wcylgXHJcbi8qKlxyXG4gKiBHcm91cHMgZWxlbWVudHMgd2l0aG91dCBpbnRyb2R1Y2luZyBhIHBhcmVudCBlbGVtZW50LlxyXG4gKi9cclxuY29uc3QgRnJhZ21lbnQgPSAocHJvcHM6IEpTWC5Qcm9wcykgPT4gcHJvcHMuY2hpbGRyZW4gYXMgSlNYLkVsZW1lbnQ7XHJcblxyXG4vLyBqc3hzIGlzIHVzZWQgd2hlbiB0aGVyZSBhcmUgbXVsdGlwbGUgY2hpbGRyZW5cclxuZXhwb3J0IHsganN4LCBqc3ggYXMganN4cywgRnJhZ21lbnQgfTtcclxuIiwiaW1wb3J0IHsgQ29tcHV0ZXIgfSBmcm9tIFwiLi9jcHUvY29tcHV0ZXJcIjtcclxuaW1wb3J0IHsgc2xlZXAsIHBvbHlmaWxsUGxhaW50ZXh0T25seSB9IGZyb20gXCIuL3V0aWxzXCI7XHJcblxyXG5jb25zdCB0ZXh0MSA9IGBXZWxjb21lIHRvIHRoZVxyXG5cclxu4paI4paI4paI4paI4paI4paI4pWX4paR4paI4paI4paI4paI4paI4paI4paI4pWX4paI4paI4pWX4paR4paR4paI4paI4pWX4paR4paI4paI4paI4paI4paI4paI4pWXXHJcbuKWiOKWiOKVlOKVkOKVkOKWiOKWiOKVl+KWiOKWiOKVlOKVkOKVkOKVkOKVkOKVneKWiOKWiOKVkeKWkeKWkeKWiOKWiOKVkeKWiOKWiOKVlOKVkOKVkOKVkOKVkOKVnVxyXG7ilojilojilojilojilojilojilabilZ3ilojilojilojilojilojilZfilpHilpHilojilojilojilojilojilojilojilZHilZrilojilojilojilojilojilZfilpFcclxu4paI4paI4pWU4pWQ4pWQ4paI4paI4pWX4paI4paI4pWU4pWQ4pWQ4pWd4paR4paR4paI4paI4pWU4pWQ4pWQ4paI4paI4pWR4paR4pWa4pWQ4pWQ4pWQ4paI4paI4pWXXHJcbuKWiOKWiOKWiOKWiOKWiOKWiOKVpuKVneKWiOKWiOKVkeKWkeKWkeKWkeKWkeKWkeKWiOKWiOKVkeKWkeKWkeKWiOKWiOKVkeKWiOKWiOKWiOKWiOKWiOKWiOKVlOKVnVxyXG7ilZrilZDilZDilZDilZDilZDilZ3ilpHilZrilZDilZ3ilpHilpHilpHilpHilpHilZrilZDilZ3ilpHilpHilZrilZDilZ3ilZrilZDilZDilZDilZDilZDilZ3ilpFcclxuXHJcbuKWkeKWiOKWiOKWiOKWiOKWiOKVl+KWkeKWkeKWiOKWiOKWiOKWiOKWiOKWiOKVl+KAg+KAg+KWkeKWiOKWiOKWiOKWiOKWiOKVl+KWkeKWiOKWiOKVl+KWkeKWkeKWkeKWkeKWkeKWiOKWiOKVl+KWkeKWkeKWkeKWiOKWiOKVl+KWiOKWiOKWiOKWiOKWiOKWiOKVl+KWkeKWiOKWiOKVl1xyXG7ilojilojilZTilZDilZDilojilojilZfilojilojilZTilZDilZDilZDilZDilZ3igIPigIPilojilojilZTilZDilZDilojilojilZfilojilojilZHilpHilpHilpHilpHilpHilojilojilZHilpHilpHilpHilojilojilZHilojilojilZTilZDilZDilojilojilZfilojilojilZFcclxu4paI4paI4pWR4paR4paR4pWa4pWQ4pWd4pWa4paI4paI4paI4paI4paI4pWX4paR4oCD4oCD4paI4paI4pWR4paR4paR4pWa4pWQ4pWd4paI4paI4pWR4paR4paR4paR4paR4paR4paI4paI4pWR4paR4paR4paR4paI4paI4pWR4paI4paI4paI4paI4paI4paI4pWm4pWd4paI4paI4pWRXHJcbuKWiOKWiOKVkeKWkeKWkeKWiOKWiOKVl+KWkeKVmuKVkOKVkOKVkOKWiOKWiOKVl+KAg+KAg+KWiOKWiOKVkeKWkeKWkeKWiOKWiOKVl+KWiOKWiOKVkeKWkeKWkeKWkeKWkeKWkeKWiOKWiOKVkeKWkeKWkeKWkeKWiOKWiOKVkeKWiOKWiOKVlOKVkOKVkOKWiOKWiOKVl+KVmuKVkOKVnVxyXG7ilZrilojilojilojilojilojilZTilZ3ilojilojilojilojilojilojilZTilZ3igIPigIPilZrilojilojilojilojilojilZTilZ3ilojilojilojilojilojilojilojilZfilZrilojilojilojilojilojilojilZTilZ3ilojilojilojilojilojilojilabilZ3ilojilojilZdcclxu4paR4pWa4pWQ4pWQ4pWQ4pWQ4pWd4paR4pWa4pWQ4pWQ4pWQ4pWQ4pWQ4pWd4paR4oCD4oCD4paR4pWa4pWQ4pWQ4pWQ4pWQ4pWd4paR4pWa4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWd4paR4pWa4pWQ4pWQ4pWQ4pWQ4pWQ4pWd4paR4pWa4pWQ4pWQ4pWQ4pWQ4pWQ4pWd4paR4pWa4pWQ4pWdXHJcbmA7XHJcblxyXG5jb25zdCB0ZXh0MXMgPSBgV2VsY29tZSB0byB0aGVcclxuXHJcbuKWiOKWhOKWhCDilojiloDiloAg4paI4paR4paIIOKWiOKWgFxyXG7ilojiloTilogg4paI4paA4paRIOKWiOKWgOKWiCDiloTilohcclxuXHJcbuKWiOKWgOKWgCDilojiloAgIOKWiOKWgOKWgCDilojilpHilpEg4paI4paR4paIIOKWiOKWhOKWhCDilohcclxu4paI4paE4paEIOKWhOKWiCAg4paI4paE4paEIOKWiOKWhOKWhCDilojiloTilogg4paI4paE4paIIOKWhFxyXG5gO1xyXG5cclxuY29uc3QgdGV4dDIgPSBgXHJcblJ1biBcImhlbHBcIiBvbiB0aGlzIHRlcm1pbmFsXHJcbmFuZC9vciBjbGljayBvbiB0aGUgcGFwZXIgdG8gbG9vayBkb3duIVxyXG5cclxuPiBgO1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgTW9uaXRvciB7XHJcbiAgICBwdWJsaWMgcm9vdDogSFRNTEVsZW1lbnQ7XHJcbiAgICBwdWJsaWMgc2NyZWVuOiBIVE1MRWxlbWVudDtcclxuICAgIHB1YmxpYyBjb250ZW50OiBIVE1MRWxlbWVudDtcclxuICAgIHB1YmxpYyBvdXRwdXQ6IEhUTUxFbGVtZW50O1xyXG4gICAgcHVibGljIGlucHV0OiBIVE1MRWxlbWVudDtcclxuICAgIHB1YmxpYyBjb21wdXRlcjogQ29tcHV0ZXI7XHJcblxyXG4gICAgY29uc3RydWN0b3Iocm9vdDogSFRNTEVsZW1lbnQpIHtcclxuICAgICAgICB0aGlzLnJvb3QgPSByb290O1xyXG4gICAgICAgIHRoaXMuc2NyZWVuID0gcm9vdC5nZXRFbGVtZW50c0J5Q2xhc3NOYW1lKFwic2NyZWVuXCIpWzBdIGFzIEhUTUxFbGVtZW50O1xyXG4gICAgICAgIHRoaXMuY29udGVudCA9IHJvb3QuZ2V0RWxlbWVudHNCeUNsYXNzTmFtZShcImNvbnRlbnRcIilbMF0gYXMgSFRNTEVsZW1lbnQ7XHJcbiAgICAgICAgdGhpcy5vdXRwdXQgPSByb290LmdldEVsZW1lbnRzQnlDbGFzc05hbWUoXCJvdXRwdXRcIilbMF0gYXMgSFRNTEVsZW1lbnQ7XHJcbiAgICAgICAgdGhpcy5pbnB1dCA9IHJvb3QuZ2V0RWxlbWVudHNCeUNsYXNzTmFtZShcImlucHV0XCIpWzBdIGFzIEhUTUxFbGVtZW50O1xyXG4gICAgICAgIHRoaXMuY29tcHV0ZXIgPSBuZXcgQ29tcHV0ZXIodGhpcyk7XHJcblxyXG4gICAgICAgIGNvbnN0IHNlbGYgPSB0aGlzO1xyXG4gICAgICAgIHBvbHlmaWxsUGxhaW50ZXh0T25seSh0aGlzLmlucHV0KTtcclxuICAgICAgICB0aGlzLnJvb3QuYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsIGZ1bmN0aW9uKGUpIHtcclxuICAgICAgICAgICAgaWYgKHdpbmRvdy5nZXRTZWxlY3Rpb24oKSEuaXNDb2xsYXBzZWQpIHNlbGYuaW5wdXQuZm9jdXMoKTtcclxuICAgICAgICB9KTtcclxuICAgICAgICB0aGlzLmlucHV0LmFkZEV2ZW50TGlzdGVuZXIoXCJmb2N1c1wiLCBmdW5jdGlvbihlKSB7XHJcbiAgICAgICAgICAgIHdpbmRvdy5nZXRTZWxlY3Rpb24oKSEuc2VsZWN0QWxsQ2hpbGRyZW4odGhpcyk7XHJcbiAgICAgICAgICAgIHdpbmRvdy5nZXRTZWxlY3Rpb24oKSEuY29sbGFwc2VUb0VuZCgpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIHRoaXMuaW5wdXQuYWRkRXZlbnRMaXN0ZW5lcihcImtleWRvd25cIiwgYXN5bmMgZnVuY3Rpb24oZSkge1xyXG4gICAgICAgICAgICBpZiAoZS5rZXkgIT09IFwiRW50ZXJcIikgcmV0dXJuO1xyXG4gICAgICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XHJcbiAgICAgICAgICAgIHNlbGYucHJpbnQodGhpcy50ZXh0Q29udGVudCArIFwiXFxuXCIpO1xyXG4gICAgICAgICAgICBjb25zdCBzdHIgPSB0aGlzLnRleHRDb250ZW50ITtcclxuICAgICAgICAgICAgdGhpcy50ZXh0Q29udGVudCA9IFwiXCI7XHJcbiAgICAgICAgICAgIGF3YWl0IHNlbGYuY29tcHV0ZXIucnVuKHN0cik7XHJcbiAgICAgICAgICAgIHNlbGYucHJpbnQoXCI+IFwiKTtcclxuICAgICAgICAgICAgdGhpcy5jbGFzc0xpc3QuYWRkKFwiZW1wdHlcIik7XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgdGhpcy5pbnB1dC5hZGRFdmVudExpc3RlbmVyKFwiaW5wdXRcIiwgZnVuY3Rpb24oZSkge1xyXG4gICAgICAgICAgICBpZiAodGhpcy50ZXh0Q29udGVudCEubGVuZ3RoID09PSAwKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmNsYXNzTGlzdC5hZGQoXCJlbXB0eVwiKTtcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuY2xhc3NMaXN0LnJlbW92ZShcImVtcHR5XCIpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcblxyXG4gICAgcHJpbnQoc3RyOiBzdHJpbmcpIHtcclxuICAgICAgICB0aGlzLm91dHB1dC5pbnNlcnRBZGphY2VudFRleHQoXCJiZWZvcmVlbmRcIiwgc3RyKTtcclxuICAgICAgICB0aGlzLmNvbnRlbnQuc2Nyb2xsVG9wID0gdGhpcy5jb250ZW50LnNjcm9sbEhlaWdodDtcclxuICAgIH1cclxuXHJcbiAgICBhc3luYyBib290KCkge1xyXG4gICAgICAgIGF3YWl0IHRoaXMuY29tcHV0ZXIuaW5pdCgpO1xyXG4gICAgICAgIGF3YWl0IHNsZWVwKDgwMCk7XHJcbiAgICAgICAgY29uc3Qgc2l6ZSA9IHBhcnNlRmxvYXQod2luZG93LmdldENvbXB1dGVkU3R5bGUoZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50KS5mb250U2l6ZSk7XHJcbiAgICAgICAgdGhpcy5wcmludChzaXplIDwgNzYgPyB0ZXh0MXMgOiB0ZXh0MSk7XHJcbiAgICAgICAgYXdhaXQgc2xlZXAoMTMwMCk7XHJcbiAgICAgICAgdGhpcy5wcmludCh0ZXh0Mik7XHJcbiAgICB9XHJcbn1cclxuIiwiaW1wb3J0IHsgbWFrZVN0eWxlIH0gZnJvbSBcIi4uL3V0aWxzXCI7XHJcblxyXG5jb25zdCB0aGljayA9IDE7XHJcblxyXG5jb25zdCBtYWtlTGVnID0gKHsgeCwgeSwgaGVpZ2h0IH06IHsgeDogbnVtYmVyLCB5OiBudW1iZXIsIGhlaWdodDogbnVtYmVyIH0pID0+IHtcclxuICAgIHJldHVybiA8ZGl2IGNsYXNzPVwiZ3JvdXBcIiBzdHlsZT17bWFrZVN0eWxlKHsgcG9zOiBgdHJhbnNsYXRlM2QoJHt4fXJlbSwwLCR7eX1yZW0pYH0pfT5cclxuICAgICAgICA8ZGl2IGNsYXNzPVwib2JqZWN0XCIgc3R5bGU9e21ha2VTdHlsZSh7IGNvbG9yOiBcIiMyNjFhMGRcIiwgd2lkdGg6IHRoaWNrLCBoZWlnaHQ6IGhlaWdodC10aGljaywgcG9zOiBgdHJhbnNsYXRlWCgke3RoaWNrLzJ9cmVtKSByb3RhdGVZKDkwZGVnKWB9KX0+PC9kaXY+XHJcbiAgICAgICAgPGRpdiBjbGFzcz1cIm9iamVjdFwiIHN0eWxlPXttYWtlU3R5bGUoeyBjb2xvcjogXCIjMjYxYTBkXCIsIHdpZHRoOiB0aGljaywgaGVpZ2h0OiBoZWlnaHQtdGhpY2ssIHBvczogYHRyYW5zbGF0ZVooJHt0aGljay8yfXJlbSlgfSl9PjwvZGl2PlxyXG4gICAgICAgIDxkaXYgY2xhc3M9XCJvYmplY3RcIiBzdHlsZT17bWFrZVN0eWxlKHsgY29sb3I6IFwiIzI2MWEwZFwiLCB3aWR0aDogdGhpY2ssIGhlaWdodDogaGVpZ2h0LXRoaWNrLCBwb3M6IGB0cmFuc2xhdGVYKCR7LXRoaWNrLzJ9cmVtKSByb3RhdGVZKC05MGRlZylgfSl9PjwvZGl2PlxyXG4gICAgICAgIDxkaXYgY2xhc3M9XCJvYmplY3RcIiBzdHlsZT17bWFrZVN0eWxlKHsgY29sb3I6IFwiIzI2MWEwZFwiLCB3aWR0aDogdGhpY2ssIGhlaWdodDogaGVpZ2h0LXRoaWNrLCBwb3M6IGB0cmFuc2xhdGVaKCR7LXRoaWNrLzJ9cmVtKSByb3RhdGVZKDE4MGRlZylgfSl9PjwvZGl2PlxyXG4gICAgPC9kaXY+O1xyXG59O1xyXG5cclxuZXhwb3J0IGNvbnN0IG1ha2VUYWJsZSA9ICh7IHdpZHRoLCBkZXB0aCwgaGVpZ2h0IH06IHsgd2lkdGg6IG51bWJlciwgZGVwdGg6IG51bWJlciwgaGVpZ2h0OiBudW1iZXIgfSkgPT4ge1xyXG4gICAgcmV0dXJuIDxkaXYgY2xhc3M9XCJncm91cFwiIHN0eWxlPXttYWtlU3R5bGUoeyBwb3M6IFwidHJhbnNsYXRlM2QoMCwwLDApXCJ9KX0+XHJcbiAgICAgICAgPGRpdiBjbGFzcz1cImdyb3VwXCIgc3R5bGU9e21ha2VTdHlsZSh7IHBvczogYHRyYW5zbGF0ZVkoJHsoLWhlaWdodCt0aGljaykvMn1yZW0pYH0pfT5cclxuICAgICAgICAgICAge21ha2VMZWcoeyB4OiB3aWR0aC8yLXRoaWNrKjIsIHk6IGRlcHRoLzItdGhpY2sqMiwgaGVpZ2h0IH0pfVxyXG4gICAgICAgICAgICB7bWFrZUxlZyh7IHg6IC13aWR0aC8yK3RoaWNrKjIsIHk6IGRlcHRoLzItdGhpY2sqMiwgaGVpZ2h0IH0pfVxyXG4gICAgICAgICAgICB7bWFrZUxlZyh7IHg6IC13aWR0aC8yK3RoaWNrKjIsIHk6IC1kZXB0aC8yK3RoaWNrKjIsIGhlaWdodCB9KX1cclxuICAgICAgICAgICAge21ha2VMZWcoeyB4OiB3aWR0aC8yLXRoaWNrKjIsIHk6IC1kZXB0aC8yK3RoaWNrKjIsIGhlaWdodCB9KX1cclxuICAgICAgICA8L2Rpdj5cclxuICAgICAgICA8ZGl2IGNsYXNzPVwiZ3JvdXBcIiBzdHlsZT17bWFrZVN0eWxlKHsgcG9zOiBgdHJhbnNsYXRlWSgkey1oZWlnaHQrdGhpY2svMn1yZW0pYCB9KX0+XHJcbiAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJvYmplY3RcIiBzdHlsZT17bWFrZVN0eWxlKHsgY29sb3I6IFwiIzVlM2QxOVwiLCB3aWR0aCwgaGVpZ2h0OiBkZXB0aCwgcG9zOiBgdHJhbnNsYXRlWSgkey10aGljay8yfXJlbSkgcm90YXRlWCg5MGRlZylgfSl9IC8+XHJcbiAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJvYmplY3RcIiBzdHlsZT17bWFrZVN0eWxlKHsgY29sb3I6IFwiIzI2MWEwZFwiLCB3aWR0aCwgaGVpZ2h0OiBkZXB0aCwgcG9zOiBgdHJhbnNsYXRlWSgke3RoaWNrLzJ9cmVtKSByb3RhdGVYKDkwZGVnKWB9KX0gLz5cclxuICAgICAgICAgICAgPGRpdiBjbGFzcz1cIm9iamVjdFwiIHN0eWxlPXttYWtlU3R5bGUoeyBjb2xvcjogXCIjNDkzMTE3XCIsIHdpZHRoLCBoZWlnaHQ6IHRoaWNrLCBwb3M6IGB0cmFuc2xhdGVaKCR7ZGVwdGgvMn1yZW0pYH0pfSAvPlxyXG4gICAgICAgICAgICA8ZGl2IGNsYXNzPVwib2JqZWN0XCIgc3R5bGU9e21ha2VTdHlsZSh7IGNvbG9yOiBcIiM0OTMxMTdcIiwgd2lkdGgsIGhlaWdodDogdGhpY2ssIHBvczogYHJvdGF0ZVkoMTgwZGVnKSB0cmFuc2xhdGVaKCR7ZGVwdGgvMn1yZW0pYH0pfSAvPlxyXG4gICAgICAgICAgICA8ZGl2IGNsYXNzPVwib2JqZWN0XCIgc3R5bGU9e21ha2VTdHlsZSh7IGNvbG9yOiBcIiM0OTMxMTdcIiwgd2lkdGg6IGRlcHRoLCBoZWlnaHQ6IHRoaWNrLCBwb3M6IGByb3RhdGVZKDkwZGVnKSB0cmFuc2xhdGVaKCR7d2lkdGgvMn1yZW0pYH0pfSAvPlxyXG4gICAgICAgICAgICA8ZGl2IGNsYXNzPVwib2JqZWN0XCIgc3R5bGU9e21ha2VTdHlsZSh7IGNvbG9yOiBcIiM0OTMxMTdcIiwgd2lkdGg6IGRlcHRoLCBoZWlnaHQ6IHRoaWNrLCBwb3M6IGByb3RhdGVZKC05MGRlZykgdHJhbnNsYXRlWigke3dpZHRoLzJ9cmVtKWB9KX0gLz5cclxuICAgICAgICA8L2Rpdj5cclxuICAgIDwvZGl2PjtcclxufTtcclxuIiwiZXhwb3J0IGNvbnN0IHNsZWVwID0gKG1zOiBudW1iZXIpID0+IG5ldyBQcm9taXNlKChyZXMpID0+IHtcclxuICAgIHNldEludGVydmFsKHJlcywgbXMpO1xyXG59KTtcclxuXHJcbmNvbnN0IHR5cGUgPSAoZWxlbTogSFRNTEVsZW1lbnQsIHRleHQ6IHN0cmluZykgPT4ge1xyXG4gICAgY29uc3Qgc2VsID0gd2luZG93LmdldFNlbGVjdGlvbigpITtcclxuICAgIGNvbnN0IGNvbnRlbnQgPSBlbGVtLnRleHRDb250ZW50ITtcclxuICAgIGNvbnN0IFtzdGFydCwgZW5kXSA9IFtcclxuICAgICAgICBzZWwuYW5jaG9yT2Zmc2V0ICogKHNlbC5hbmNob3JOb2RlID09PSBlbGVtID8gY29udGVudC5sZW5ndGggOiAxKSxcclxuICAgICAgICBzZWwuZm9jdXNPZmZzZXQgKiAoc2VsLmZvY3VzTm9kZSA9PT0gZWxlbSA/IGNvbnRlbnQubGVuZ3RoIDogMSksXHJcbiAgICBdLnNvcnQoKGEsYikgPT4gYSAtIGIpO1xyXG4gICAgZWxlbS50ZXh0Q29udGVudCA9IGNvbnRlbnQuc2xpY2UoMCwgc3RhcnQpICsgdGV4dCArIGNvbnRlbnQuc2xpY2UoZW5kKTtcclxuXHJcbiAgICBzZWwucmVtb3ZlQWxsUmFuZ2VzKCk7XHJcbiAgICBjb25zdCByYW5nZSA9IGRvY3VtZW50LmNyZWF0ZVJhbmdlKCk7XHJcbiAgICByYW5nZS5zZXRTdGFydChlbGVtLmNoaWxkTm9kZXNbMF0sIHN0YXJ0ICsgdGV4dC5sZW5ndGgpO1xyXG4gICAgcmFuZ2Uuc2V0RW5kKGVsZW0uY2hpbGROb2Rlc1swXSwgc3RhcnQgKyB0ZXh0Lmxlbmd0aCk7XHJcbiAgICBzZWwuYWRkUmFuZ2UocmFuZ2UpO1xyXG5cclxuICAgIGVsZW0uZGlzcGF0Y2hFdmVudChuZXcgRXZlbnQoXCJpbnB1dFwiKSk7XHJcbn07XHJcblxyXG4vKipcclxuICogRm9yIEZpcmVmb3guXHJcbiAqIEJhc2VkIG9uIGh0dHBzOi8vc3RhY2tvdmVyZmxvdy5jb20vYS82NDAwMTgzOVxyXG4gKi9cclxuZXhwb3J0IGNvbnN0IHBvbHlmaWxsUGxhaW50ZXh0T25seSA9IChlbGVtOiBIVE1MRWxlbWVudCkgPT4ge1xyXG4gICAgaWYgKGVsZW0uY29udGVudEVkaXRhYmxlID09PSBcInBsYWludGV4dC1vbmx5XCIpIHJldHVybjtcclxuXHJcbiAgICBlbGVtLmNvbnRlbnRFZGl0YWJsZSA9IFwidHJ1ZVwiO1xyXG4gICAgZWxlbS5hZGRFdmVudExpc3RlbmVyKFwia2V5ZG93blwiLCBmdW5jdGlvbihlKSB7XHJcbiAgICAgICAgaWYgKGUua2V5ICE9PSBcIkVudGVyXCIpIHJldHVybjtcclxuICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XHJcbiAgICB9KTtcclxuICAgIGVsZW0uYWRkRXZlbnRMaXN0ZW5lcihcInBhc3RlXCIsIGZ1bmN0aW9uKGUpIHtcclxuICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XHJcbiAgICAgICAgdHlwZSh0aGlzLCBlLmNsaXBib2FyZERhdGEhLmdldERhdGEoXCJ0ZXh0L3BsYWluXCIpKTtcclxuICAgIH0pO1xyXG4gICAgLy8gZml4ZXMgRmlyZWZveCBpbnNlcnRpbmcgYSA8YnI+XHJcbiAgICBlbGVtLmFkZEV2ZW50TGlzdGVuZXIoXCJpbnB1dFwiLCBmdW5jdGlvbihlKSB7XHJcbiAgICAgICAgaWYgKHRoaXMuY2hpbGRyZW4ubGVuZ3RoID09PSAwKSByZXR1cm47XHJcbiAgICAgICAgdGhpcy50ZXh0Q29udGVudCA9IFwiXCI7XHJcbiAgICB9KTtcclxuICAgIGlmIChlbGVtLmF1dG9mb2N1cykge1xyXG4gICAgICAgIGVsZW0uZm9jdXMoKTtcclxuICAgIH1cclxufTtcclxuXHJcbmV4cG9ydCBjb25zdCBtYWtlU3R5bGUgPSAoeyBjb2xvciA9IFwidHJhbnNwYXJlbnRcIiwgd2lkdGggPSAwLCBoZWlnaHQgPSAwLCBwb3MsIGNlbnRlciA9IHRydWUgfTogeyBjb2xvcj86IHN0cmluZywgd2lkdGg/OiBudW1iZXIsIGhlaWdodD86IG51bWJlciwgcG9zOiBzdHJpbmcsIGNlbnRlcj86IGJvb2xlYW4gfSkgPT4ge1xyXG4gICAgcmV0dXJuIGBcclxuICAgICAgICBiYWNrZ3JvdW5kLWNvbG9yOiAke2NvbG9yfTtcclxuICAgICAgICB3aWR0aDogJHt3aWR0aH1yZW07XHJcbiAgICAgICAgaGVpZ2h0OiAke2hlaWdodH1yZW07XHJcbiAgICAgICAgdHJhbnNmb3JtOiAke2NlbnRlciA/IFwidHJhbnNsYXRlKC01MCUsLTUwJSlcIiA6IFwiXCJ9ICR7cG9zfWA7XHJcbn07XHJcbiIsImV4cG9ydCBkZWZhdWx0IGNsYXNzIFdvcmxkIHtcclxuICAgIHB1YmxpYyByb290OiBIVE1MRWxlbWVudDtcclxuICAgIHB1YmxpYyBzZWxlY3RlZDogSFRNTEVsZW1lbnQgfCB1bmRlZmluZWQ7XHJcbiAgICBwdWJsaWMgZGVmYXVsdFRyYW5zZm9ybTogc3RyaW5nO1xyXG5cclxuICAgIGNvbnN0cnVjdG9yKHJvb3Q6IEhUTUxFbGVtZW50LCBvYmplY3RzOiB7IGVsZW06IEhUTUxFbGVtZW50LCB0cmFuc2Zvcm06IHN0cmluZyB9W10pIHtcclxuICAgICAgICB0aGlzLnJvb3QgPSByb290O1xyXG4gICAgICAgIGNvbnN0IHNlbGYgPSB0aGlzO1xyXG4gICAgICAgIGZvciAoY29uc3QgeyBlbGVtLCB0cmFuc2Zvcm0gfSBvZiBvYmplY3RzKSB7XHJcbiAgICAgICAgICAgIHRoaXMucm9vdC5hcHBlbmRDaGlsZChlbGVtKTtcclxuICAgICAgICAgICAgaWYgKHRyYW5zZm9ybSA9PSBudWxsKSBjb250aW51ZTtcclxuICAgICAgICAgICAgZWxlbS5zdHlsZS5wb2ludGVyRXZlbnRzID0gXCJhbGxcIjtcclxuICAgICAgICAgICAgZWxlbS5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgZnVuY3Rpb24oZSkge1xyXG4gICAgICAgICAgICAgICAgaWYgKHRoaXMgPT09IHNlbGYuc2VsZWN0ZWQpIHJldHVybjtcclxuICAgICAgICAgICAgICAgIGlmIChzZWxmLnNlbGVjdGVkICE9IG51bGwpIHNlbGYuc2VsZWN0ZWQuY2xhc3NMaXN0LnJlbW92ZShcInNlbGVjdGVkXCIpO1xyXG4gICAgICAgICAgICAgICAgc2VsZi5zZWxlY3RlZCA9IHRoaXM7XHJcbiAgICAgICAgICAgICAgICBzZWxmLnNlbGVjdGVkLmNsYXNzTGlzdC5hZGQoXCJzZWxlY3RlZFwiKTtcclxuICAgICAgICAgICAgICAgIHNlbGYucm9vdC5zdHlsZS50cmFuc2Zvcm0gPSB0cmFuc2Zvcm07XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH1cclxuICAgICAgICB0aGlzLmRlZmF1bHRUcmFuc2Zvcm0gPSB0aGlzLnJvb3Quc3R5bGUudHJhbnNmb3JtO1xyXG4gICAgICAgIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoXCJrZXlkb3duXCIsIGZ1bmN0aW9uKGUpIHtcclxuICAgICAgICAgICAgaWYgKGUua2V5ICE9IFwiRXNjYXBlXCIpIHJldHVybjtcclxuICAgICAgICAgICAgZS5zdG9wUHJvcGFnYXRpb24oKTtcclxuICAgICAgICAgICAgaWYgKHNlbGYuc2VsZWN0ZWQgIT0gbnVsbCkgc2VsZi5zZWxlY3RlZC5jbGFzc0xpc3QucmVtb3ZlKFwic2VsZWN0ZWRcIik7XHJcbiAgICAgICAgICAgIHNlbGYuc2VsZWN0ZWQgPSB1bmRlZmluZWQ7XHJcbiAgICAgICAgICAgIHNlbGYucm9vdC5zdHlsZS50cmFuc2Zvcm0gPSBzZWxmLmRlZmF1bHRUcmFuc2Zvcm07XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcbn1cclxuIiwiLy8gVGhlIG1vZHVsZSBjYWNoZVxudmFyIF9fd2VicGFja19tb2R1bGVfY2FjaGVfXyA9IHt9O1xuXG4vLyBUaGUgcmVxdWlyZSBmdW5jdGlvblxuZnVuY3Rpb24gX193ZWJwYWNrX3JlcXVpcmVfXyhtb2R1bGVJZCkge1xuXHQvLyBDaGVjayBpZiBtb2R1bGUgaXMgaW4gY2FjaGVcblx0dmFyIGNhY2hlZE1vZHVsZSA9IF9fd2VicGFja19tb2R1bGVfY2FjaGVfX1ttb2R1bGVJZF07XG5cdGlmIChjYWNoZWRNb2R1bGUgIT09IHVuZGVmaW5lZCkge1xuXHRcdHJldHVybiBjYWNoZWRNb2R1bGUuZXhwb3J0cztcblx0fVxuXHQvLyBDcmVhdGUgYSBuZXcgbW9kdWxlIChhbmQgcHV0IGl0IGludG8gdGhlIGNhY2hlKVxuXHR2YXIgbW9kdWxlID0gX193ZWJwYWNrX21vZHVsZV9jYWNoZV9fW21vZHVsZUlkXSA9IHtcblx0XHQvLyBubyBtb2R1bGUuaWQgbmVlZGVkXG5cdFx0Ly8gbm8gbW9kdWxlLmxvYWRlZCBuZWVkZWRcblx0XHRleHBvcnRzOiB7fVxuXHR9O1xuXG5cdC8vIEV4ZWN1dGUgdGhlIG1vZHVsZSBmdW5jdGlvblxuXHRfX3dlYnBhY2tfbW9kdWxlc19fW21vZHVsZUlkXShtb2R1bGUsIG1vZHVsZS5leHBvcnRzLCBfX3dlYnBhY2tfcmVxdWlyZV9fKTtcblxuXHQvLyBSZXR1cm4gdGhlIGV4cG9ydHMgb2YgdGhlIG1vZHVsZVxuXHRyZXR1cm4gbW9kdWxlLmV4cG9ydHM7XG59XG5cbiIsIi8vIGRlZmluZSBnZXR0ZXIgZnVuY3Rpb25zIGZvciBoYXJtb255IGV4cG9ydHNcbl9fd2VicGFja19yZXF1aXJlX18uZCA9IChleHBvcnRzLCBkZWZpbml0aW9uKSA9PiB7XG5cdGZvcih2YXIga2V5IGluIGRlZmluaXRpb24pIHtcblx0XHRpZihfX3dlYnBhY2tfcmVxdWlyZV9fLm8oZGVmaW5pdGlvbiwga2V5KSAmJiAhX193ZWJwYWNrX3JlcXVpcmVfXy5vKGV4cG9ydHMsIGtleSkpIHtcblx0XHRcdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBrZXksIHsgZW51bWVyYWJsZTogdHJ1ZSwgZ2V0OiBkZWZpbml0aW9uW2tleV0gfSk7XG5cdFx0fVxuXHR9XG59OyIsIl9fd2VicGFja19yZXF1aXJlX18ubyA9IChvYmosIHByb3ApID0+IChPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwob2JqLCBwcm9wKSkiLCIvLyBkZWZpbmUgX19lc01vZHVsZSBvbiBleHBvcnRzXG5fX3dlYnBhY2tfcmVxdWlyZV9fLnIgPSAoZXhwb3J0cykgPT4ge1xuXHRpZih0eXBlb2YgU3ltYm9sICE9PSAndW5kZWZpbmVkJyAmJiBTeW1ib2wudG9TdHJpbmdUYWcpIHtcblx0XHRPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgU3ltYm9sLnRvU3RyaW5nVGFnLCB7IHZhbHVlOiAnTW9kdWxlJyB9KTtcblx0fVxuXHRPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgJ19fZXNNb2R1bGUnLCB7IHZhbHVlOiB0cnVlIH0pO1xufTsiLCJpbXBvcnQgTW9uaXRvciBmcm9tIFwiLi9tb25pdG9yXCI7XHJcbmltcG9ydCBXb3JsZCBmcm9tIFwiLi93b3JsZFwiO1xyXG5pbXBvcnQgeyBtYWtlVGFibGUgfSBmcm9tIFwiLi9vYmplY3RzL3RhYmxlXCI7XHJcblxyXG5jb25zdCBjb21wID0gPGRpdiBpZD1cImNvbXBcIiBjbGFzcz1cImNvbXB1dGVyIG9iamVjdFwiPlxyXG4gICAgPGRpdiBjbGFzcz1cInNjcmVlblwiPlxyXG4gICAgICAgIDxkaXYgY2xhc3M9XCJjb250ZW50XCI+XHJcbiAgICAgICAgICAgIDxwcmUgY2xhc3M9XCJvdXRwdXRcIj48L3ByZT48cHJlIGF1dG9mb2N1cyBjbGFzcz1cImlucHV0IGVtcHR5XCIgY29udGVudGVkaXRhYmxlPVwicGxhaW50ZXh0LW9ubHlcIiBzcGVsbGNoZWNrPVwiZmFsc2VcIj48L3ByZT5cclxuICAgICAgICA8L2Rpdj5cclxuICAgIDwvZGl2PlxyXG48L2Rpdj47XHJcblxyXG5jb25zdCBwYXBlciA9IDxkaXYgY2xhc3M9XCJwYXBlciBvYmplY3RcIj5cclxuICAgIDxoMT5DTFVCIFdFQlNJVEUgTUFOVUFMPGJyIC8+YW5kPGJyIC8+Q0FLRSBESVNQRU5TQVJZPC9oMT5cclxuICAgIDxwPlxyXG4gICAgICAgIENsaWNrIG9uIHN0dWZmIHRvIGxvb2sgYXQgaXQuXHJcbiAgICAgICAgWW91IHByb2JhYmx5IGZpZ3VyZWQgdGhhdCBvbmUgb3V0IGFscmVhZHksXHJcbiAgICAgICAgYnV0IGRpZCB5b3Uga25vdyB5b3UgY2FuIHByZXNzIDxrYmQ+RXNjPC9rYmQ+IHRvIHpvb20gYmFjayBvdXQ/Pz9cclxuICAgIDwvcD5cclxuICAgIDxwPlxyXG4gICAgICAgIFRoZSB0ZXJtaW5hbCdzIGZpbGVzeXN0ZW0gcmVxdWlyZXMgSW5kZXhlZERCIHBlcm1pc3Npb25zLlxyXG4gICAgPC9wPlxyXG4gICAgPHA+XHJcbiAgICAgICAgR29vZCBsdWNrIVxyXG4gICAgPC9wPlxyXG4gICAgPGgyPkFib3V0IHRoZSBjbHViPC9oMj5cclxuICAgIDxwPlxyXG4gICAgICAgIExvcmVtIGlwc3VtIGRvbG9yIHNpdCBhbWV0LFxyXG4gICAgICAgIGNvbnNlY3RldHVyIGFkaXBpc2NpbmcgZWxpdCxcclxuICAgICAgICBzZWQgZG8gZWl1c21vZCB0ZW1wb3IgaW5jaWRpZHVudCB1dCBsYWJvcmUgZXQgZG9sb3JlIG1hZ25hIGFsaXF1YS5cclxuICAgICAgICBVdCBlbmltIGFkIG1pbmltIHZlbmlhbSxcclxuICAgICAgICBxdWlzIG5vc3RydWQgZXhlcmNpdGF0aW9uIHVsbGFtY28gbGFib3JpcyBuaXNpIHV0IGFsaXF1aXAgZXggZWEgY29tbW9kbyBjb25zZXF1YXQuXHJcbiAgICAgICAgRHVpcyBhdXRlIGlydXJlIGRvbG9yIGluIHJlcHJlaGVuZGVyaXQgaW4gdm9sdXB0YXRlIHZlbGl0IGVzc2UgY2lsbHVtIGRvbG9yZSBldSBmdWdpYXQgbnVsbGEgcGFyaWF0dXIuXHJcbiAgICAgICAgRXhjZXB0ZXVyIHNpbnQgb2NjYWVjYXQgY3VwaWRhdGF0IG5vbiBwcm9pZGVudCxcclxuICAgICAgICBzdW50IGluIGN1bHBhIHF1aSBvZmZpY2lhIGRlc2VydW50IG1vbGxpdCBhbmltIGlkIGVzdCBsYWJvcnVtLlxyXG4gICAgPC9wPlxyXG4gICAgPHA+XHJcbiAgICBPZmZpY2VyczpcclxuICAgICAgICA8dWw+XHJcbiAgICAgICAgICAgIDxsaT48Yj5QcmVzaWRlbnQ6PC9iPiBKb2U8L2xpPlxyXG4gICAgICAgICAgICA8bGk+PGI+VmljZSBQcmVzaWRlbnQ6PC9iPiBBdXN0aW48L2xpPlxyXG4gICAgICAgICAgICA8bGk+PGI+U2VjcmV0YXJ5OjwvYj4gVGhvbWFzPC9saT5cclxuICAgICAgICAgICAgPGxpPjxiPk91dHJlYWNoIERpcmVjdG9yOjwvYj4gWGluZGk8L2xpPlxyXG4gICAgICAgICAgICA8bGk+PGI+VGVjaCBMZWFkOjwvYj4gSm9uYXRoYW48L2xpPlxyXG4gICAgICAgICAgICA8bGk+PGI+Q29udHJpYnV0aW5nIE1lbWJlcnM6PC9iPiBFZGVuLCBPc2NhcjwvbGk+XHJcbiAgICAgICAgPC91bD5cclxuICAgIDwvcD5cclxuICAgIDxoMj5BYm91dCB0aGlzIHNpdGU8L2gyPlxyXG4gICAgPHA+XHJcbiAgICAgICAgVGhpcyBpcyBhIHByb3RvdHlwZS5cclxuICAgICAgICBNYXliZSBpdCByZWFsbHkgaXMgY29vbGVyIHRoYW4gYSBwbGFpbiBvbGQgMkQgc2l0ZSxcclxuICAgICAgICBvciBtYXliZSBpdCBpc24ndCBhbmQgd2UnbGwgd29yayBvbiBzb21ldGhpbmcgZWxzZS5cclxuICAgIDwvcD5cclxuICAgIDxwPlxyXG4gICAgICAgIEV2ZXJ5dGhpbmcgaGVyZSBpcyBIVE1ML0NTUy9KUywgd2l0aCBubyBjbGllbnQtc2lkZSBsaWJyYXJpZXMhXHJcbiAgICAgICAgKE9ubHkgVHlwZVNjcmlwdCBhbmQgd2VicGFjayBhcmUgdXNlZCBmb3IgZGV2ZWxvcG1lbnQuKVxyXG4gICAgICAgIE1heWJlIEkgc2hvdWxkIHJlc2VhcmNoIGxpYnJhcmllcyBtb3JlLlxyXG4gICAgICAgIEkgc3RpbGwgY2FuJ3QgYmVsaWV2ZSB3ZWIgYnJvd3NlcnMgc3VwcG9ydCByZWFsbHkgZGVjZW50IGJhc2ljIDNEISEhXHJcbiAgICA8L3A+XHJcbiAgICA8cD5cclxuICAgICAgICBCeSB0aGUgd2F5LCB0cnkgem9vbWluZyBpbiBhbmQgb3V0LCBvciByZXNpemluZyB5b3VyIGJyb3dzZXIgd2luZG93LlxyXG4gICAgICAgIEFjY2Vzc2liaWxpdHkhIVxyXG4gICAgICAgIEluIGZhY3QsIHRoZSB0ZXJtaW5hbCBzdXBwb3J0cyBzZWxlY3Rpb25zIGFuZCBjb3B5LXBhc3RpbmdcclxuICAgICAgICB2aWEgYSBmZXcgc2hpbXMgb24gYSBcImNvbnRlbnRlZGl0YWJsZVwiIGVsZW1lbnQuXHJcbiAgICAgICAgQWN0dWFsbHkgeW91IGNhbiBzZWxlY3QgYW55IHRleHQgb24gdGhpcyBzaXRlLlxyXG4gICAgICAgIEV4Y2VwdCB0aGUgYmxpbmtpbmcgY3Vyc29yIGNoYXJhY3Rlci4gQ29vbCBlZmZlY3QsIGh1aD9cclxuICAgIDwvcD5cclxuICAgIDxwPlxyXG4gICAgICAgIFRoaXMgc2l0ZSdzIHNvdXJjZSBjb2RlIGlzIGF2YWlsYWJsZSA8YSB0YXJnZXQ9XCJfYmxhbmtcIiByZWw9XCJub3JlZmVycmVyXCIgaHJlZj1cImh0dHBzOi8vZ2l0aHViLmNvbS9CRkhTLU9wZW4vc2l0ZVwiPmhlcmU8L2E+LlxyXG4gICAgICAgIEl0J3MgbGljZW5zZWQgdW5kZXIgdGhlIElTQyBMaWNlbnNlLFxyXG4gICAgICAgIHdoaWNoIGFjY29yZGluZyB0byBXaWtpcGVkaWEgaXMgKGhvcGVmdWxseSkganVzdCB0aGUgTUlUIExpY2Vuc2UgYnV0IG1vcmUgY29uY2lzZS5cclxuICAgIDwvcD5cclxuICAgIDxwPlxyXG4gICAgICAgIEhhdmUgZnVuIVxyXG4gICAgPC9wPlxyXG4gICAgPHA+XHJcbiAgICAgICAgLUF1c3RpblxyXG4gICAgPC9wPlxyXG48L2Rpdj47XHJcblxyXG5jb25zdCB3b3JsZCA9IG5ldyBXb3JsZChkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcIndvcmxkXCIpISwgW1xyXG4gICAge1xyXG4gICAgICAgIGVsZW06IG1ha2VUYWJsZSh7IHdpZHRoOiA1KjEyLCBkZXB0aDogMioxMiwgaGVpZ2h0OiAyLjUqMTIgfSksXHJcbiAgICAgICAgdHJhbnNmb3JtOiBcIlwiLFxyXG4gICAgfSxcclxuICAgIHtcclxuICAgICAgICBlbGVtOiBjb21wLFxyXG4gICAgICAgIHRyYW5zZm9ybTogXCJyb3RhdGVYKC0xMGRlZykgcm90YXRlWSgtNWRlZykgdHJhbnNsYXRlM2QoM3JlbSwzNXJlbSwwcmVtKVwiLFxyXG4gICAgfSxcclxuICAgIHtcclxuICAgICAgICBlbGVtOiBwYXBlcixcclxuICAgICAgICB0cmFuc2Zvcm06IFwicm90YXRlWCgtODBkZWcpIHJvdGF0ZVkoNWRlZykgdHJhbnNsYXRlM2QoLTVyZW0sMjhyZW0sLTVyZW0pXCIsXHJcbiAgICB9LFxyXG5dKTtcclxuXHJcbmNvbnN0IG1vbml0b3IgPSBuZXcgTW9uaXRvcihjb21wKTtcclxubW9uaXRvci5ib290KCk7XHJcbiJdLCJuYW1lcyI6W10sInNvdXJjZVJvb3QiOiIifQ==