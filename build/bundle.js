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
            elem.style.pointerEvents = "auto";
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
const paper = (0,root_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("div", { class: "paper object", children: (0,root_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)("div", { class: "scroll", children: [(0,root_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)("h1", { children: ["CLUB WEBSITE MANUAL", (0,root_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("br", {}), "and", (0,root_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("br", {}), "CAKE DISPENSARY"] }), (0,root_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)("p", { children: ["Click on stuff to look at it. You probably figured that one out already, but did you know you can press ", (0,root_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("kbd", { children: "Esc" }), " to zoom back out???"] }), (0,root_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("p", { children: "The terminal's filesystem requires IndexedDB permissions." }), (0,root_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("p", { children: "Good luck!" }), (0,root_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("h2", { children: "About the club" }), (0,root_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("p", { children: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum." }), (0,root_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)("p", { children: ["Officers:", (0,root_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)("ul", { children: [(0,root_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)("li", { children: [(0,root_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("b", { children: "President:" }), " Joe"] }), (0,root_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)("li", { children: [(0,root_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("b", { children: "Vice President:" }), " Austin"] }), (0,root_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)("li", { children: [(0,root_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("b", { children: "Secretary:" }), " Thomas"] }), (0,root_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)("li", { children: [(0,root_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("b", { children: "Outreach Director:" }), " Xindi"] }), (0,root_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)("li", { children: [(0,root_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("b", { children: "Tech Lead:" }), " Jonathan"] }), (0,root_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)("li", { children: [(0,root_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("b", { children: "Contributing Members:" }), " Eden, Oscar"] })] })] }), (0,root_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("h2", { children: "About this site" }), (0,root_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("p", { children: "This is a prototype. Maybe it really is cooler than a plain old 2D site, or maybe it isn't and we'll work on something else." }), (0,root_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("p", { children: "Everything here is HTML/CSS/JS, with no client-side libraries! (Only TypeScript and webpack are used for development.) Maybe I should research libraries more. I still can't believe web browsers support really decent basic 3D!!!" }), (0,root_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("p", { children: "By the way, try zooming in and out, or resizing your browser window. Accessibility!! In fact, the terminal supports selections and copy-pasting via a few shims on a \"contenteditable\" element. Actually you can select any text on this site. Except the blinking cursor character. Cool effect, huh?" }), (0,root_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)("p", { children: ["This site's source code is available ", (0,root_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("a", { target: "_blank", rel: "noreferrer", href: "https://github.com/BFHS-Open/site", children: "here" }), ". It's licensed under the ISC License, which according to Wikipedia is (hopefully) just the MIT License but more concise."] }), (0,root_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("p", { children: "Have fun!" }), (0,root_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("p", { children: "-Austin" })] }) });
const world = new _world__WEBPACK_IMPORTED_MODULE_2__["default"](document.getElementById("world"), [
    {
        elem: (0,_objects_table__WEBPACK_IMPORTED_MODULE_3__.makeTable)({ width: 5 * 12, depth: 2 * 12, height: 2.5 * 12 }),
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,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S0FBSyxDQUFDLEdBQUMsQ0FBQyxNQUFNLEVBQUMsQ0FBQyxhQUM3RSxPQUFPLENBQUMsRUFBRSxDQUFDLEVBQUUsS0FBSyxHQUFDLENBQUMsR0FBQyxLQUFLLEdBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxLQUFLLEdBQUMsQ0FBQyxHQUFDLEtBQUssR0FBQyxDQUFDLEVBQUUsTUFBTSxFQUFFLENBQUMsRUFDM0QsT0FBTyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsS0FBSyxHQUFDLENBQUMsR0FBQyxLQUFLLEdBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxLQUFLLEdBQUMsQ0FBQyxHQUFDLEtBQUssR0FBQyxDQUFDLEVBQUUsTUFBTSxFQUFFLENBQUMsRUFDNUQsT0FBTyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsS0FBSyxHQUFDLENBQUMsR0FBQyxLQUFLLEdBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEtBQUssR0FBQyxDQUFDLEdBQUMsS0FBSyxHQUFDLENBQUMsRUFBRSxNQUFNLEVBQUUsQ0FBQyxFQUM3RCxPQUFPLENBQUMsRUFBRSxDQUFDLEVBQUUsS0FBSyxHQUFDLENBQUMsR0FBQyxLQUFLLEdBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEtBQUssR0FBQyxDQUFDLEdBQUMsS0FBSyxHQUFDLENBQUMsRUFBRSxNQUFNLEVBQUUsQ0FBQyxJQUMzRCxFQUNOLGdFQUFLLEtBQUssRUFBQyxPQUFPLEVBQUMsS0FBSyxFQUFFLGlEQUFTLENBQUMsRUFBRSxHQUFHLEVBQUUsY0FBYyxDQUFDLE1BQU0sR0FBQyxLQUFLLEdBQUMsQ0FBQyxNQUFNLEVBQUUsQ0FBQyxhQUM3RSwrREFBSyxLQUFLLEVBQUMsUUFBUSxFQUFDLEtBQUssRUFBRSxpREFBUyxDQUFDLEVBQUUsS0FBSyxFQUFFLFNBQVMsRUFBRSxLQUFLLEVBQUUsTUFBTSxFQUFFLEtBQUssRUFBRSxHQUFHLEVBQUUsY0FBYyxDQUFDLEtBQUssR0FBQyxDQUFDLHFCQUFxQixFQUFDLENBQUMsR0FBSSxFQUNySSwrREFBSyxLQUFLLEVBQUMsUUFBUSxFQUFDLEtBQUssRUFBRSxpREFBUyxDQUFDLEVBQUUsS0FBSyxFQUFFLFNBQVMsRUFBRSxLQUFLLEVBQUUsTUFBTSxFQUFFLEtBQUssRUFBRSxHQUFHLEVBQUUsY0FBYyxLQUFLLEdBQUMsQ0FBQyxxQkFBcUIsRUFBQyxDQUFDLEdBQUksRUFDcEksK0RBQUssS0FBSyxFQUFDLFFBQVEsRUFBQyxLQUFLLEVBQUUsaURBQVMsQ0FBQyxFQUFFLEtBQUssRUFBRSxTQUFTLEVBQUUsS0FBSyxFQUFFLE1BQU0sRUFBRSxLQUFLLEVBQUUsR0FBRyxFQUFFLGNBQWMsS0FBSyxHQUFDLENBQUMsTUFBTSxFQUFDLENBQUMsR0FBSSxFQUNySCwrREFBSyxLQUFLLEVBQUMsUUFBUSxFQUFDLEtBQUssRUFBRSxpREFBUyxDQUFDLEVBQUUsS0FBSyxFQUFFLFNBQVMsRUFBRSxLQUFLLEVBQUUsTUFBTSxFQUFFLEtBQUssRUFBRSxHQUFHLEVBQUUsOEJBQThCLEtBQUssR0FBQyxDQUFDLE1BQU0sRUFBQyxDQUFDLEdBQUksRUFDckksK0RBQUssS0FBSyxFQUFDLFFBQVEsRUFBQyxLQUFLLEVBQUUsaURBQVMsQ0FBQyxFQUFFLEtBQUssRUFBRSxTQUFTLEVBQUUsS0FBSyxFQUFFLEtBQUssRUFBRSxNQUFNLEVBQUUsS0FBSyxFQUFFLEdBQUcsRUFBRSw2QkFBNkIsS0FBSyxHQUFDLENBQUMsTUFBTSxFQUFDLENBQUMsR0FBSSxFQUMzSSwrREFBSyxLQUFLLEVBQUMsUUFBUSxFQUFDLEtBQUssRUFBRSxpREFBUyxDQUFDLEVBQUUsS0FBSyxFQUFFLFNBQVMsRUFBRSxLQUFLLEVBQUUsS0FBSyxFQUFFLE1BQU0sRUFBRSxLQUFLLEVBQUUsR0FBRyxFQUFFLDhCQUE4QixLQUFLLEdBQUMsQ0FBQyxNQUFNLEVBQUMsQ0FBQyxHQUFJLElBQzFJLElBQ0osQ0FBQztBQUNYLENBQUMsQ0FBQzs7Ozs7Ozs7Ozs7Ozs7Ozs7QUM5QkssTUFBTSxLQUFLLEdBQUcsQ0FBQyxFQUFVLEVBQUUsRUFBRSxDQUFDLElBQUksT0FBTyxDQUFDLENBQUMsR0FBRyxFQUFFLEVBQUU7SUFDckQsV0FBVyxDQUFDLEdBQUcsRUFBRSxFQUFFLENBQUMsQ0FBQztBQUN6QixDQUFDLENBQUMsQ0FBQztBQUVILE1BQU0sSUFBSSxHQUFHLENBQUMsSUFBaUIsRUFBRSxJQUFZLEVBQUUsRUFBRTtJQUM3QyxNQUFNLEdBQUcsR0FBRyxNQUFNLENBQUMsWUFBWSxFQUFHLENBQUM7SUFDbkMsTUFBTSxPQUFPLEdBQUcsSUFBSSxDQUFDLFdBQVksQ0FBQztJQUNsQyxNQUFNLENBQUMsS0FBSyxFQUFFLEdBQUcsQ0FBQyxHQUFHO1FBQ2pCLEdBQUcsQ0FBQyxZQUFZLEdBQUcsQ0FBQyxHQUFHLENBQUMsVUFBVSxLQUFLLElBQUksQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQ2pFLEdBQUcsQ0FBQyxXQUFXLEdBQUcsQ0FBQyxHQUFHLENBQUMsU0FBUyxLQUFLLElBQUksQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO0tBQ2xFLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxFQUFDLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDO0lBQ3ZCLElBQUksQ0FBQyxXQUFXLEdBQUcsT0FBTyxDQUFDLEtBQUssQ0FBQyxDQUFDLEVBQUUsS0FBSyxDQUFDLEdBQUcsSUFBSSxHQUFHLE9BQU8sQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUM7SUFFdkUsR0FBRyxDQUFDLGVBQWUsRUFBRSxDQUFDO0lBQ3RCLE1BQU0sS0FBSyxHQUFHLFFBQVEsQ0FBQyxXQUFXLEVBQUUsQ0FBQztJQUNyQyxLQUFLLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDLEVBQUUsS0FBSyxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQztJQUN4RCxLQUFLLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDLEVBQUUsS0FBSyxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQztJQUN0RCxHQUFHLENBQUMsUUFBUSxDQUFDLEtBQUssQ0FBQyxDQUFDO0lBRXBCLElBQUksQ0FBQyxhQUFhLENBQUMsSUFBSSxLQUFLLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQztBQUMzQyxDQUFDLENBQUM7QUFFRjs7O0dBR0c7QUFDSSxNQUFNLHFCQUFxQixHQUFHLENBQUMsSUFBaUIsRUFBRSxFQUFFO0lBQ3ZELElBQUksSUFBSSxDQUFDLGVBQWUsS0FBSyxnQkFBZ0I7UUFBRSxPQUFPO0lBRXRELElBQUksQ0FBQyxlQUFlLEdBQUcsTUFBTSxDQUFDO0lBQzlCLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxTQUFTLEVBQUUsVUFBUyxDQUFDO1FBQ3ZDLElBQUksQ0FBQyxDQUFDLEdBQUcsS0FBSyxPQUFPO1lBQUUsT0FBTztRQUM5QixDQUFDLENBQUMsY0FBYyxFQUFFLENBQUM7SUFDdkIsQ0FBQyxDQUFDLENBQUM7SUFDSCxJQUFJLENBQUMsZ0JBQWdCLENBQUMsT0FBTyxFQUFFLFVBQVMsQ0FBQztRQUNyQyxDQUFDLENBQUMsY0FBYyxFQUFFLENBQUM7UUFDbkIsSUFBSSxDQUFDLElBQUksRUFBRSxDQUFDLENBQUMsYUFBYyxDQUFDLE9BQU8sQ0FBQyxZQUFZLENBQUMsQ0FBQyxDQUFDO0lBQ3ZELENBQUMsQ0FBQyxDQUFDO0lBQ0gsaUNBQWlDO0lBQ2pDLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxPQUFPLEVBQUUsVUFBUyxDQUFDO1FBQ3JDLElBQUksSUFBSSxDQUFDLFFBQVEsQ0FBQyxNQUFNLEtBQUssQ0FBQztZQUFFLE9BQU87UUFDdkMsSUFBSSxDQUFDLFdBQVcsR0FBRyxFQUFFLENBQUM7SUFDMUIsQ0FBQyxDQUFDLENBQUM7SUFDSCxJQUFJLElBQUksQ0FBQyxTQUFTLEVBQUUsQ0FBQztRQUNqQixJQUFJLENBQUMsS0FBSyxFQUFFLENBQUM7SUFDakIsQ0FBQztBQUNMLENBQUMsQ0FBQztBQUVLLE1BQU0sU0FBUyxHQUFHLENBQUMsRUFBRSxLQUFLLEdBQUcsYUFBYSxFQUFFLEtBQUssR0FBRyxDQUFDLEVBQUUsTUFBTSxHQUFHLENBQUMsRUFBRSxHQUFHLEVBQUUsTUFBTSxHQUFHLElBQUksRUFBc0YsRUFBRSxFQUFFO0lBQ2xMLE9BQU87NEJBQ2lCLEtBQUs7aUJBQ2hCLEtBQUs7a0JBQ0osTUFBTTtxQkFDSCxNQUFNLENBQUMsQ0FBQyxDQUFDLHNCQUFzQixDQUFDLENBQUMsQ0FBQyxFQUFFLElBQUksR0FBRyxFQUFFLENBQUM7QUFDbkUsQ0FBQyxDQUFDOzs7Ozs7Ozs7Ozs7Ozs7QUN0RGEsTUFBTSxLQUFLO0lBQ2YsSUFBSSxDQUFjO0lBQ2xCLFFBQVEsQ0FBMEI7SUFDbEMsZ0JBQWdCLENBQVM7SUFFaEMsWUFBWSxJQUFpQixFQUFFLE9BQW9EO1FBQy9FLElBQUksQ0FBQyxJQUFJLEdBQUcsSUFBSSxDQUFDO1FBQ2pCLE1BQU0sSUFBSSxHQUFHLElBQUksQ0FBQztRQUNsQixLQUFLLE1BQU0sRUFBRSxJQUFJLEVBQUUsU0FBUyxFQUFFLElBQUksT0FBTyxFQUFFLENBQUM7WUFDeEMsSUFBSSxDQUFDLElBQUksQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDLENBQUM7WUFDNUIsSUFBSSxTQUFTLElBQUksSUFBSTtnQkFBRSxTQUFTO1lBQ2hDLElBQUksQ0FBQyxLQUFLLENBQUMsYUFBYSxHQUFHLE1BQU0sQ0FBQztZQUNsQyxJQUFJLENBQUMsZ0JBQWdCLENBQUMsT0FBTyxFQUFFLFVBQVMsQ0FBQztnQkFDckMsSUFBSSxJQUFJLEtBQUssSUFBSSxDQUFDLFFBQVE7b0JBQUUsT0FBTztnQkFDbkMsSUFBSSxJQUFJLENBQUMsUUFBUSxJQUFJLElBQUk7b0JBQUUsSUFBSSxDQUFDLFFBQVEsQ0FBQyxTQUFTLENBQUMsTUFBTSxDQUFDLFVBQVUsQ0FBQyxDQUFDO2dCQUN0RSxJQUFJLENBQUMsUUFBUSxHQUFHLElBQUksQ0FBQztnQkFDckIsSUFBSSxDQUFDLFFBQVEsQ0FBQyxTQUFTLENBQUMsR0FBRyxDQUFDLFVBQVUsQ0FBQyxDQUFDO2dCQUN4QyxJQUFJLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxTQUFTLEdBQUcsU0FBUyxDQUFDO1lBQzFDLENBQUMsQ0FBQyxDQUFDO1FBQ1AsQ0FBQztRQUNELElBQUksQ0FBQyxnQkFBZ0IsR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxTQUFTLENBQUM7UUFDbEQsUUFBUSxDQUFDLGdCQUFnQixDQUFDLFNBQVMsRUFBRSxVQUFTLENBQUM7WUFDM0MsSUFBSSxDQUFDLENBQUMsR0FBRyxJQUFJLFFBQVE7Z0JBQUUsT0FBTztZQUM5QixDQUFDLENBQUMsZUFBZSxFQUFFLENBQUM7WUFDcEIsSUFBSSxJQUFJLENBQUMsUUFBUSxJQUFJLElBQUk7Z0JBQUUsSUFBSSxDQUFDLFFBQVEsQ0FBQyxTQUFTLENBQUMsTUFBTSxDQUFDLFVBQVUsQ0FBQyxDQUFDO1lBQ3RFLElBQUksQ0FBQyxRQUFRLEdBQUcsU0FBUyxDQUFDO1lBQzFCLElBQUksQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLFNBQVMsR0FBRyxJQUFJLENBQUMsZ0JBQWdCLENBQUM7UUFDdEQsQ0FBQyxDQUFDLENBQUM7SUFDUCxDQUFDO0NBQ0o7Ozs7Ozs7VUM3QkQ7VUFDQTs7VUFFQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTs7VUFFQTtVQUNBOztVQUVBO1VBQ0E7VUFDQTs7Ozs7V0N0QkE7V0FDQTtXQUNBO1dBQ0E7V0FDQSx5Q0FBeUMsd0NBQXdDO1dBQ2pGO1dBQ0E7V0FDQTs7Ozs7V0NQQTs7Ozs7V0NBQTtXQUNBO1dBQ0E7V0FDQSx1REFBdUQsaUJBQWlCO1dBQ3hFO1dBQ0EsZ0RBQWdELGFBQWE7V0FDN0Q7Ozs7Ozs7Ozs7Ozs7Ozs7QUNOZ0M7QUFDSjtBQUNnQjtBQUU1QyxNQUFNLElBQUksR0FBRywrREFBSyxFQUFFLEVBQUMsTUFBTSxFQUFDLEtBQUssRUFBQyxpQkFBaUIsWUFDL0MsK0RBQUssS0FBSyxFQUFDLFFBQVEsWUFDZixnRUFBSyxLQUFLLEVBQUMsU0FBUyxhQUNoQiwrREFBSyxLQUFLLEVBQUMsUUFBUSxHQUFPLGlFQUFLLFNBQVMsUUFBQyxLQUFLLEVBQUMsYUFBYSxFQUFDLGVBQWUsRUFBQyxnQkFBZ0IsRUFBQyxVQUFVLEVBQUMsT0FBTyxHQUFPLElBQ3JILEdBQ0osR0FDSixDQUFDO0FBRVAsTUFBTSxLQUFLLEdBQUcsK0RBQUssS0FBSyxFQUFDLGNBQWMsWUFDbkMsZ0VBQUssS0FBSyxFQUFDLFFBQVEsYUFDZixpR0FBdUIsK0RBQU0sU0FBRywrREFBTSx1QkFBb0IsRUFDMUQscUxBR21DLGlGQUFjLDRCQUM3QyxFQUNKLHFJQUVJLEVBQ0osc0ZBRUksRUFDSiwyRkFBdUIsRUFDdkIseWdCQVNJLEVBQ0osc0ZBRUksMEVBQ0ksMEVBQUksc0ZBQWlCLFlBQVMsRUFDOUIsMEVBQUksMkZBQXNCLGVBQVksRUFDdEMsMEVBQUksc0ZBQWlCLGVBQVksRUFDakMsMEVBQUksOEZBQXlCLGNBQVcsRUFDeEMsMEVBQUksc0ZBQWlCLGlCQUFjLEVBQ25DLDBFQUFJLGlHQUE0QixvQkFBaUIsSUFDaEQsSUFDTCxFQUNKLDRGQUF3QixFQUN4Qix3TUFJSSxFQUNKLCtTQUtJLEVBQ0osb1hBT0ksRUFDSixrSEFDeUMsNkRBQUcsTUFBTSxFQUFDLFFBQVEsRUFBQyxHQUFHLEVBQUMsWUFBWSxFQUFDLElBQUksRUFBQyxtQ0FBbUMscUJBQVMsaUlBRzFILEVBQ0oscUZBRUksRUFDSixtRkFFSSxJQUNGLEdBQ0osQ0FBQztBQUVQLE1BQU0sS0FBSyxHQUFHLElBQUksOENBQUssQ0FBQyxRQUFRLENBQUMsY0FBYyxDQUFDLE9BQU8sQ0FBRSxFQUFFO0lBQ3ZEO1FBQ0ksSUFBSSxFQUFFLHlEQUFTLENBQUMsRUFBRSxLQUFLLEVBQUUsQ0FBQyxHQUFDLEVBQUUsRUFBRSxLQUFLLEVBQUUsQ0FBQyxHQUFDLEVBQUUsRUFBRSxNQUFNLEVBQUUsR0FBRyxHQUFDLEVBQUUsRUFBRSxDQUFDO0tBQ2hFO0lBQ0Q7UUFDSSxJQUFJLEVBQUUsSUFBSTtRQUNWLFNBQVMsRUFBRSw2REFBNkQ7S0FDM0U7SUFDRDtRQUNJLElBQUksRUFBRSxLQUFLO1FBQ1gsU0FBUyxFQUFFLDhEQUE4RDtLQUM1RTtDQUNKLENBQUMsQ0FBQztBQUVILE1BQU0sT0FBTyxHQUFHLElBQUksZ0RBQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQztBQUNsQyxPQUFPLENBQUMsSUFBSSxFQUFFLENBQUMiLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly9iZW4tc2l0ZS8uL2pzL2NwdS9jb21wdXRlci50cyIsIndlYnBhY2s6Ly9iZW4tc2l0ZS8uL2pzL2NwdS9maWxlc3lzdGVtLnRzIiwid2VicGFjazovL2Jlbi1zaXRlLy4vanMvY3B1L3Byb2dyYW1zL2NvbG9yLnRzIiwid2VicGFjazovL2Jlbi1zaXRlLy4vanMvY3B1L3Byb2dyYW1zL2ZzLnRzIiwid2VicGFjazovL2Jlbi1zaXRlLy4vanMvY3B1L3Byb2dyYW1zL2hlbHAudHMiLCJ3ZWJwYWNrOi8vYmVuLXNpdGUvLi9qcy9qc3gtcnVudGltZS50cyIsIndlYnBhY2s6Ly9iZW4tc2l0ZS8uL2pzL21vbml0b3IudHMiLCJ3ZWJwYWNrOi8vYmVuLXNpdGUvLi9qcy9vYmplY3RzL3RhYmxlLnRzeCIsIndlYnBhY2s6Ly9iZW4tc2l0ZS8uL2pzL3V0aWxzLnRzIiwid2VicGFjazovL2Jlbi1zaXRlLy4vanMvd29ybGQudHMiLCJ3ZWJwYWNrOi8vYmVuLXNpdGUvd2VicGFjay9ib290c3RyYXAiLCJ3ZWJwYWNrOi8vYmVuLXNpdGUvd2VicGFjay9ydW50aW1lL2RlZmluZSBwcm9wZXJ0eSBnZXR0ZXJzIiwid2VicGFjazovL2Jlbi1zaXRlL3dlYnBhY2svcnVudGltZS9oYXNPd25Qcm9wZXJ0eSBzaG9ydGhhbmQiLCJ3ZWJwYWNrOi8vYmVuLXNpdGUvd2VicGFjay9ydW50aW1lL21ha2UgbmFtZXNwYWNlIG9iamVjdCIsIndlYnBhY2s6Ly9iZW4tc2l0ZS8uL2pzL21haW4udHN4Il0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB0eXBlIE1vbml0b3IgZnJvbSBcIi4uL21vbml0b3JcIjtcclxuaW1wb3J0IHR5cGUgeyBQcm9ncmFtIH0gZnJvbSBcIi4vcHJvZ3JhbVwiO1xyXG5pbXBvcnQgaGVscCBmcm9tIFwiLi9wcm9ncmFtcy9oZWxwXCI7XHJcbmltcG9ydCBjb2xvciBmcm9tIFwiLi9wcm9ncmFtcy9jb2xvclwiO1xyXG5pbXBvcnQgeyBta2RpciwgdG91Y2gsIGNhdCwgd3JpdGVGaWxlLCBscywgcm0gfSBmcm9tIFwiLi9wcm9ncmFtcy9mc1wiO1xyXG5pbXBvcnQgeyBGaWxlc3lzdGVtIH0gZnJvbSBcIi4vZmlsZXN5c3RlbVwiO1xyXG5cclxuZXhwb3J0IGNsYXNzIENvbXB1dGVyIHtcclxuICAgIHB1YmxpYyBtb25pdG9yOiBNb25pdG9yO1xyXG4gICAgcHVibGljIHByb2dyYW1zOiBNYXA8c3RyaW5nLCBQcm9ncmFtPjtcclxuICAgIHB1YmxpYyBmaWxlc3lzdGVtOiBGaWxlc3lzdGVtO1xyXG5cclxuICAgIGNvbnN0cnVjdG9yKG1vbml0b3I6IE1vbml0b3IpIHtcclxuICAgICAgICB0aGlzLm1vbml0b3IgPSBtb25pdG9yO1xyXG4gICAgICAgIHRoaXMucHJvZ3JhbXMgPSBuZXcgTWFwKE9iamVjdC5lbnRyaWVzKHtcclxuICAgICAgICAgICAgaGVscCxcclxuICAgICAgICAgICAgY29sb3IsXHJcbiAgICAgICAgICAgIG1rZGlyLFxyXG4gICAgICAgICAgICB0b3VjaCxcclxuICAgICAgICAgICAgY2F0LFxyXG4gICAgICAgICAgICBcIndyaXRlLWZpbGVcIjogd3JpdGVGaWxlLFxyXG4gICAgICAgICAgICBscyxcclxuICAgICAgICAgICAgcm0sXHJcbiAgICAgICAgfSkpO1xyXG4gICAgICAgIHRoaXMuZmlsZXN5c3RlbSA9IG5ldyBGaWxlc3lzdGVtKCk7XHJcbiAgICB9XHJcblxyXG4gICAgYXN5bmMgaW5pdCgpIHtcclxuICAgICAgICBhd2FpdCB0aGlzLmZpbGVzeXN0ZW0uaW5pdCgpO1xyXG4gICAgfVxyXG5cclxuICAgIGFzeW5jIHJ1bihzdHI6IHN0cmluZykge1xyXG4gICAgICAgIGNvbnN0IHJlcyA9IHN0ci50cmltKCkuc3BsaXQoL1xccysvdSk7XHJcbiAgICAgICAgaWYgKHJlc1swXSA9PT0gXCJcIikgcmV0dXJuO1xyXG5cclxuICAgICAgICBjb25zdCBjbWQgPSByZXNbMF07XHJcbiAgICAgICAgaWYgKHRoaXMucHJvZ3JhbXMuaGFzKGNtZCkpIHtcclxuICAgICAgICAgICAgYXdhaXQgdGhpcy5wcm9ncmFtcy5nZXQoY21kKSEoeyBvdXQ6ICguLi5hcmdzKSA9PiB0aGlzLm1vbml0b3IucHJpbnQoLi4uYXJncyksIG1vbml0b3I6IHRoaXMubW9uaXRvciB9LCByZXMpO1xyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICB0aGlzLm1vbml0b3IucHJpbnQoYFVucmVjb2duaXplZCBjb21tYW5kIFwiJHtjbWR9XCJcXG5gKTtcclxuICAgIH1cclxufVxyXG4iLCJpbXBvcnQgeyBEaXIsIEVudHJ5IH0gZnJvbSBcIi4vZmlsZVwiO1xyXG5cclxuY29uc3QgcHJvbWlzaWZ5ID0gPFQ+KHJlcTogSURCUmVxdWVzdDxUPikgPT4gbmV3IFByb21pc2U8VD4oKHJlcywgcmVqKSA9PiB7XHJcbiAgICByZXEuYWRkRXZlbnRMaXN0ZW5lcihcInN1Y2Nlc3NcIiwgZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgcmVzKHRoaXMucmVzdWx0KTtcclxuICAgIH0pO1xyXG4gICAgcmVxLmFkZEV2ZW50TGlzdGVuZXIoXCJlcnJvclwiLCBmdW5jdGlvbigpIHtcclxuICAgICAgICBhbGVydCh0aGlzLmVycm9yKTtcclxuICAgICAgICByZWoodGhpcy5lcnJvcik7XHJcbiAgICAgICAgLy8gVE9ETzogZXJyb3IgaGFuZGxpbmdcclxuICAgIH0pO1xyXG59KTtcclxuXHJcbmNvbnN0IHBhcnNlID0gKHBhdGg6IHN0cmluZykgPT4ge1xyXG4gICAgcmV0dXJuIHBhdGgudHJpbSgpLnNwbGl0KFwiL1wiKS5maWx0ZXIoKG5hbWUpID0+IG5hbWUgIT09IFwiXCIpO1xyXG59O1xyXG5cclxuZXhwb3J0IGNsYXNzIEZpbGVzeXN0ZW0ge1xyXG4gICAgcHVibGljIHJvb3QhOiBJREJWYWxpZEtleTtcclxuICAgIHB1YmxpYyBkYiE6IElEQkRhdGFiYXNlO1xyXG5cclxuICAgIGFzeW5jIGluaXQoKSB7XHJcbiAgICAgICAgY29uc3QgcmVxdWVzdCA9IHdpbmRvdy5pbmRleGVkREIub3BlbihcImZpbGVzeXN0ZW1cIiwgMSk7XHJcbiAgICAgICAgcmVxdWVzdC5hZGRFdmVudExpc3RlbmVyKFwidXBncmFkZW5lZWRlZFwiLCBhc3luYyBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgY29uc3QgZGIgPSB0aGlzLnJlc3VsdDtcclxuICAgICAgICAgICAgY29uc3QgaW5mbyA9IGRiLmNyZWF0ZU9iamVjdFN0b3JlKFwiaW5mb1wiKTtcclxuICAgICAgICAgICAgY29uc3QgZmlsZXMgPSBkYi5jcmVhdGVPYmplY3RTdG9yZShcImZpbGVzXCIsIHsgYXV0b0luY3JlbWVudDogdHJ1ZSB9KVxyXG5cclxuICAgICAgICAgICAgY29uc3QgcmVxID0gZmlsZXMuYWRkKHtcclxuICAgICAgICAgICAgICAgIHR5cGU6IFwiZGlyXCIsXHJcbiAgICAgICAgICAgICAgICBlbnRyeXM6IHt9LFxyXG4gICAgICAgICAgICB9IHNhdGlzZmllcyBEaXIpO1xyXG4gICAgICAgICAgICBpbmZvLnB1dChhd2FpdCBwcm9taXNpZnkocmVxKSwgXCJyb290XCIpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIHRoaXMuZGIgPSBhd2FpdCBwcm9taXNpZnkocmVxdWVzdCk7XHJcbiAgICAgICAgdGhpcy5yb290ID0gYXdhaXQgcHJvbWlzaWZ5KHRoaXMuZGIudHJhbnNhY3Rpb24oXCJpbmZvXCIpLm9iamVjdFN0b3JlKFwiaW5mb1wiKS5nZXQoXCJyb290XCIpKTtcclxuICAgIH1cclxuXHJcbiAgICBhc3luYyB3YWxrKGJhc2U6IElEQlZhbGlkS2V5LCBuYW1lczogc3RyaW5nW10pIHtcclxuICAgICAgICBmb3IgKGNvbnN0IG5hbWUgb2YgbmFtZXMpIHtcclxuICAgICAgICAgICAgY29uc3QgcmVxID0gdGhpcy5kYi50cmFuc2FjdGlvbihcImZpbGVzXCIpLm9iamVjdFN0b3JlKFwiZmlsZXNcIikuZ2V0KGJhc2UpIGFzIElEQlJlcXVlc3Q8RW50cnk+O1xyXG4gICAgICAgICAgICBjb25zdCBlbnRyeSA9IGF3YWl0IHByb21pc2lmeShyZXEpO1xyXG4gICAgICAgICAgICBpZiAoZW50cnkudHlwZSAhPT0gXCJkaXJcIikgdGhyb3cgXCJub3QgYSBkaXJlY3RvcnlcIjtcclxuICAgICAgICAgICAgaWYgKCEobmFtZSBpbiBlbnRyeS5lbnRyeXMpKSB0aHJvdyBcImRvZXNuJ3QgZXhpc3RcIjtcclxuICAgICAgICAgICAgYmFzZSA9IGVudHJ5LmVudHJ5c1tuYW1lXTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIGJhc2U7XHJcbiAgICB9XHJcblxyXG4gICAgYXN5bmMgbWFrZURpcihwYXRoOiBzdHJpbmcpIHtcclxuICAgICAgICBjb25zdCBuYW1lcyA9IHBhcnNlKHBhdGgpO1xyXG4gICAgICAgIGlmIChuYW1lcy5sZW5ndGggPT09IDApIHRocm93IFwibm8gbmFtZSBzcGVjaWZpZWRcIjtcclxuICAgICAgICBjb25zdCB0YXJnZXQgPSBuYW1lcy5wb3AoKSE7XHJcbiAgICAgICAgY29uc3QgZGlyID0gYXdhaXQgdGhpcy53YWxrKHRoaXMucm9vdCwgbmFtZXMpO1xyXG4gICAgXHJcbiAgICAgICAgY29uc3QgZW50cnkgPSBhd2FpdCBwcm9taXNpZnkodGhpcy5kYi50cmFuc2FjdGlvbihcImZpbGVzXCIpLm9iamVjdFN0b3JlKFwiZmlsZXNcIikuZ2V0KGRpcikgYXMgSURCUmVxdWVzdDxFbnRyeT4pO1xyXG4gICAgICAgIGlmIChlbnRyeS50eXBlICE9PSBcImRpclwiKSB0aHJvdyBcIm5vdCBhIGRpcmVjdG9yeVwiO1xyXG4gICAgICAgIGlmICh0YXJnZXQgaW4gZW50cnkuZW50cnlzKSB0aHJvdyBcIml0ZW0gYWxyZWFkeSBleGlzdHNcIjtcclxuXHJcbiAgICAgICAgY29uc3QgcmVxdWVzdCA9IHRoaXMuZGIudHJhbnNhY3Rpb24oXCJmaWxlc1wiLCBcInJlYWR3cml0ZVwiKS5vYmplY3RTdG9yZShcImZpbGVzXCIpLmFkZCh7XHJcbiAgICAgICAgICAgIHR5cGU6IFwiZGlyXCIsXHJcbiAgICAgICAgICAgIGVudHJ5czoge30sXHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgZW50cnkuZW50cnlzW3RhcmdldF0gPSBhd2FpdCBwcm9taXNpZnkocmVxdWVzdCkgYXMgbnVtYmVyO1xyXG4gICAgICAgIGF3YWl0IHByb21pc2lmeSh0aGlzLmRiLnRyYW5zYWN0aW9uKFwiZmlsZXNcIiwgXCJyZWFkd3JpdGVcIikub2JqZWN0U3RvcmUoXCJmaWxlc1wiKS5wdXQoZW50cnksIGRpcikpO1xyXG4gICAgfVxyXG5cclxuICAgIGFzeW5jIG1ha2VGaWxlKHBhdGg6IHN0cmluZykge1xyXG4gICAgICAgIGNvbnN0IG5hbWVzID0gcGFyc2UocGF0aCk7XHJcbiAgICAgICAgaWYgKG5hbWVzLmxlbmd0aCA9PT0gMCkgdGhyb3cgXCJubyBuYW1lIHNwZWNpZmllZFwiO1xyXG4gICAgICAgIGNvbnN0IHRhcmdldCA9IG5hbWVzLnBvcCgpITtcclxuICAgICAgICBjb25zdCBkaXIgPSBhd2FpdCB0aGlzLndhbGsodGhpcy5yb290LCBuYW1lcyk7XHJcblxyXG4gICAgICAgIGNvbnN0IGVudHJ5ID0gYXdhaXQgcHJvbWlzaWZ5KHRoaXMuZGIudHJhbnNhY3Rpb24oXCJmaWxlc1wiKS5vYmplY3RTdG9yZShcImZpbGVzXCIpLmdldChkaXIpIGFzIElEQlJlcXVlc3Q8RW50cnk+KTtcclxuICAgICAgICBpZiAoZW50cnkudHlwZSAhPT0gXCJkaXJcIikgdGhyb3cgXCJub3QgYSBkaXJlY3RvcnlcIjtcclxuICAgICAgICBpZiAodGFyZ2V0IGluIGVudHJ5LmVudHJ5cykgdGhyb3cgXCJpdGVtIGFscmVhZHkgZXhpc3RzXCI7XHJcblxyXG4gICAgICAgIGNvbnN0IHJlcXVlc3QgPSB0aGlzLmRiLnRyYW5zYWN0aW9uKFwiZmlsZXNcIiwgXCJyZWFkd3JpdGVcIikub2JqZWN0U3RvcmUoXCJmaWxlc1wiKS5hZGQoe1xyXG4gICAgICAgICAgICB0eXBlOiBcImZpbGVcIixcclxuICAgICAgICAgICAgY29udGVudHM6IFwiXCIsXHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgZW50cnkuZW50cnlzW3RhcmdldF0gPSBhd2FpdCBwcm9taXNpZnkocmVxdWVzdCkgYXMgbnVtYmVyO1xyXG4gICAgICAgIGF3YWl0IHByb21pc2lmeSh0aGlzLmRiLnRyYW5zYWN0aW9uKFwiZmlsZXNcIiwgXCJyZWFkd3JpdGVcIikub2JqZWN0U3RvcmUoXCJmaWxlc1wiKS5wdXQoZW50cnksIGRpcikpO1xyXG4gICAgfVxyXG5cclxuICAgIGFzeW5jIHJlYWRGaWxlKHBhdGg6IHN0cmluZykge1xyXG4gICAgICAgIGNvbnN0IG5hbWVzID0gcGFyc2UocGF0aCk7XHJcbiAgICAgICAgY29uc3QgdGFyZ2V0ID0gYXdhaXQgdGhpcy53YWxrKHRoaXMucm9vdCwgbmFtZXMpO1xyXG5cclxuICAgICAgICBjb25zdCBlbnRyeSA9IGF3YWl0IHByb21pc2lmeSh0aGlzLmRiLnRyYW5zYWN0aW9uKFwiZmlsZXNcIikub2JqZWN0U3RvcmUoXCJmaWxlc1wiKS5nZXQodGFyZ2V0KSBhcyBJREJSZXF1ZXN0PEVudHJ5Pik7XHJcbiAgICAgICAgaWYgKGVudHJ5LnR5cGUgIT09IFwiZmlsZVwiKSB0aHJvdyBcIm5vdCBhIGZpbGVcIjtcclxuICAgICAgICByZXR1cm4gZW50cnkuY29udGVudHM7XHJcbiAgICB9XHJcblxyXG4gICAgYXN5bmMgd3JpdGVGaWxlKHBhdGg6IHN0cmluZywgY29udGVudHM6IHN0cmluZykge1xyXG4gICAgICAgIGNvbnN0IG5hbWVzID0gcGFyc2UocGF0aCk7XHJcbiAgICAgICAgaWYgKG5hbWVzLmxlbmd0aCA9PT0gMCkgdGhyb3cgXCJubyBuYW1lIHNwZWNpZmllZFwiO1xyXG4gICAgICAgIGNvbnN0IHRhcmdldCA9IGF3YWl0IHRoaXMud2Fsayh0aGlzLnJvb3QsIG5hbWVzKTtcclxuXHJcbiAgICAgICAgYXdhaXQgcHJvbWlzaWZ5KHRoaXMuZGIudHJhbnNhY3Rpb24oXCJmaWxlc1wiLCBcInJlYWR3cml0ZVwiKS5vYmplY3RTdG9yZShcImZpbGVzXCIpLnB1dCh7XHJcbiAgICAgICAgICAgIHR5cGU6IFwiZmlsZVwiLFxyXG4gICAgICAgICAgICBjb250ZW50cyxcclxuICAgICAgICB9LCB0YXJnZXQpKTtcclxuICAgIH1cclxuXHJcbiAgICBhc3luYyByZWFkRGlyKHBhdGg6IHN0cmluZykge1xyXG4gICAgICAgIGNvbnN0IG5hbWVzID0gcGFyc2UocGF0aCk7XHJcbiAgICAgICAgY29uc3QgdGFyZ2V0ID0gYXdhaXQgdGhpcy53YWxrKHRoaXMucm9vdCwgbmFtZXMpO1xyXG5cclxuICAgICAgICBjb25zdCBlbnRyeSA9IGF3YWl0IHByb21pc2lmeSh0aGlzLmRiLnRyYW5zYWN0aW9uKFwiZmlsZXNcIikub2JqZWN0U3RvcmUoXCJmaWxlc1wiKS5nZXQodGFyZ2V0KSBhcyBJREJSZXF1ZXN0PEVudHJ5Pik7XHJcbiAgICAgICAgaWYgKGVudHJ5LnR5cGUgIT09IFwiZGlyXCIpIHRocm93IFwibm90IGEgZGlyZWN0b3J5XCI7XHJcbiAgICAgICAgcmV0dXJuIGVudHJ5LmVudHJ5cztcclxuICAgIH1cclxuXHJcbiAgICBhc3luYyByZW1vdmUocGF0aDogc3RyaW5nKSB7XHJcbiAgICAgICAgY29uc3QgbmFtZXMgPSBwYXJzZShwYXRoKTtcclxuICAgICAgICBpZiAobmFtZXMubGVuZ3RoID09PSAwKSB0aHJvdyBcIm5vIG5hbWUgc3BlY2lmaWVkXCI7XHJcbiAgICAgICAgY29uc3QgdGFyZ2V0ID0gbmFtZXMucG9wKCkhO1xyXG4gICAgICAgIGNvbnN0IGRpciA9IGF3YWl0IHRoaXMud2Fsayh0aGlzLnJvb3QsIG5hbWVzKTtcclxuXHJcbiAgICAgICAgY29uc3QgZW50cnkgPSBhd2FpdCBwcm9taXNpZnkodGhpcy5kYi50cmFuc2FjdGlvbihcImZpbGVzXCIpLm9iamVjdFN0b3JlKFwiZmlsZXNcIikuZ2V0KGRpcikgYXMgSURCUmVxdWVzdDxFbnRyeT4pO1xyXG4gICAgICAgIGlmIChlbnRyeS50eXBlICE9PSBcImRpclwiKSB0aHJvdyBcIm5vdCBhIGRpcmVjdG9yeVwiO1xyXG4gICAgICAgIGlmICghKHRhcmdldCBpbiBlbnRyeS5lbnRyeXMpKSB0aHJvdyBcIml0ZW0gZG9lc24ndCBleGlzdFwiO1xyXG5cclxuICAgICAgICBkZWxldGUgZW50cnkuZW50cnlzW3RhcmdldF07XHJcbiAgICAgICAgYXdhaXQgcHJvbWlzaWZ5KHRoaXMuZGIudHJhbnNhY3Rpb24oXCJmaWxlc1wiLCBcInJlYWR3cml0ZVwiKS5vYmplY3RTdG9yZShcImZpbGVzXCIpLnB1dChlbnRyeSwgZGlyKSk7XHJcbiAgICAgICAgLy8gVE9ETzogZml4IG1lbW9yeSBsZWFrXHJcbiAgICB9XHJcbn1cclxuIiwiaW1wb3J0IHR5cGUgeyBQcm9ncmFtIH0gZnJvbSBcIi4uL3Byb2dyYW1cIjtcclxuXHJcbmV4cG9ydCBkZWZhdWx0IChhc3luYyAoc3lzLCBhcmd2KSA9PiB7XHJcbiAgICBjb25zdCBodWUgPSBhcmd2WzFdID09PSB1bmRlZmluZWQgPyBNYXRoLnJhbmRvbSgpIDogK2FyZ3ZbMV0vMzYwO1xyXG4gICAgaWYgKCFOdW1iZXIuaXNGaW5pdGUoaHVlKSkge1xyXG4gICAgICAgIHN5cy5vdXQoYEludmFsaWQgaHVlIGFuZ2xlIFwiJHthcmd2WzFdfVwiXFxuYCk7XHJcbiAgICAgICAgcmV0dXJuO1xyXG4gICAgfVxyXG4gICAgc3lzLm1vbml0b3Iucm9vdC5zdHlsZS5zZXRQcm9wZXJ0eShcIi0tc2NyZWVuLWNvbG9yXCIsIGBoc2woJHtodWUgPz8gTWF0aC5yYW5kb20oKX10dXJuIDEwMCUgNTAlKWApO1xyXG59KSBzYXRpc2ZpZXMgUHJvZ3JhbTtcclxuIiwiaW1wb3J0IHR5cGUgeyBQcm9ncmFtIH0gZnJvbSBcIi4uL3Byb2dyYW1cIjtcclxuXHJcbmV4cG9ydCBjb25zdCBta2RpcjogUHJvZ3JhbSA9IGFzeW5jIChzeXMsIGFyZ3YpID0+IHtcclxuICAgIGlmIChhcmd2Lmxlbmd0aCA8IDIpIHtcclxuICAgICAgICBzeXMub3V0KFwibmVlZCBhcmd1bWVudFxcblwiKTtcclxuICAgICAgICByZXR1cm47XHJcbiAgICB9XHJcbiAgICB0cnkge1xyXG4gICAgICAgIGF3YWl0IHN5cy5tb25pdG9yLmNvbXB1dGVyLmZpbGVzeXN0ZW0ubWFrZURpcihhcmd2WzFdKTtcclxuICAgIH0gY2F0Y2ggKGVycikge1xyXG4gICAgICAgIHN5cy5vdXQoYCR7ZXJyfVxcbmApO1xyXG4gICAgICAgIHJldHVybjtcclxuICAgIH1cclxufTtcclxuXHJcbmV4cG9ydCBjb25zdCB0b3VjaDogUHJvZ3JhbSA9IGFzeW5jIChzeXMsIGFyZ3YpID0+IHtcclxuICAgIGlmIChhcmd2Lmxlbmd0aCA8IDIpIHtcclxuICAgICAgICBzeXMub3V0KFwibmVlZCBhcmd1bWVudFxcblwiKTtcclxuICAgICAgICByZXR1cm47XHJcbiAgICB9XHJcbiAgICB0cnkge1xyXG4gICAgICAgIGF3YWl0IHN5cy5tb25pdG9yLmNvbXB1dGVyLmZpbGVzeXN0ZW0ubWFrZUZpbGUoYXJndlsxXSk7XHJcbiAgICB9IGNhdGNoIChlcnIpIHtcclxuICAgICAgICBzeXMub3V0KGAke2Vycn1cXG5gKTtcclxuICAgICAgICByZXR1cm47XHJcbiAgICB9XHJcbn07XHJcblxyXG5leHBvcnQgY29uc3QgY2F0OiBQcm9ncmFtID0gYXN5bmMgKHN5cywgYXJndikgPT4ge1xyXG4gICAgaWYgKGFyZ3YubGVuZ3RoIDwgMikge1xyXG4gICAgICAgIHN5cy5vdXQoXCJuZWVkIGFyZ3VtZW50XFxuXCIpO1xyXG4gICAgICAgIHJldHVybjtcclxuICAgIH1cclxuICAgIHRyeSB7XHJcbiAgICAgICAgc3lzLm91dChhd2FpdCBzeXMubW9uaXRvci5jb21wdXRlci5maWxlc3lzdGVtLnJlYWRGaWxlKGFyZ3ZbMV0pKTtcclxuICAgIH0gY2F0Y2ggKGVycikge1xyXG4gICAgICAgIHN5cy5vdXQoYCR7ZXJyfVxcbmApO1xyXG4gICAgICAgIHJldHVybjtcclxuICAgIH1cclxufTtcclxuXHJcbmV4cG9ydCBjb25zdCB3cml0ZUZpbGU6IFByb2dyYW0gPSBhc3luYyAoc3lzLCBhcmd2KSA9PiB7XHJcbiAgICBpZiAoYXJndi5sZW5ndGggPCAzKSB7XHJcbiAgICAgICAgc3lzLm91dChcIm5lZWQgMiBhcmd1bWVudHNcXG5cIik7XHJcbiAgICAgICAgcmV0dXJuO1xyXG4gICAgfVxyXG4gICAgdHJ5IHtcclxuICAgICAgICBhd2FpdCBzeXMubW9uaXRvci5jb21wdXRlci5maWxlc3lzdGVtLndyaXRlRmlsZShhcmd2WzFdLCBhcmd2WzJdICsgXCJcXG5cIik7XHJcbiAgICB9IGNhdGNoIChlcnIpIHtcclxuICAgICAgICBzeXMub3V0KGAke2Vycn1cXG5gKTtcclxuICAgICAgICByZXR1cm47XHJcbiAgICB9XHJcbn07XHJcblxyXG5jb25zdCBsaXN0aW5nID0gKGVudHJ5czogUmVjb3JkPHN0cmluZywgbnVtYmVyPikgPT4ge1xyXG4gICAgcmV0dXJuIE9iamVjdC5rZXlzKGVudHJ5cykubWFwKHMgPT4gcyArIFwiXFxuXCIpLmpvaW4oXCJcIik7XHJcbn07XHJcblxyXG5leHBvcnQgY29uc3QgbHM6IFByb2dyYW0gPSBhc3luYyAoc3lzLCBhcmd2KSA9PiB7XHJcbiAgICB0cnkge1xyXG4gICAgICAgIHN5cy5vdXQobGlzdGluZyhhd2FpdCBzeXMubW9uaXRvci5jb21wdXRlci5maWxlc3lzdGVtLnJlYWREaXIoYXJndlsxXSA/PyBcIi9cIikpKTtcclxuICAgIH0gY2F0Y2ggKGVycikge1xyXG4gICAgICAgIHN5cy5vdXQoYCR7ZXJyfVxcbmApO1xyXG4gICAgICAgIHJldHVybjtcclxuICAgIH1cclxufTtcclxuXHJcbmV4cG9ydCBjb25zdCBybTogUHJvZ3JhbSA9IGFzeW5jIChzeXMsIGFyZ3YpID0+IHtcclxuICAgIGlmIChhcmd2Lmxlbmd0aCA8IDIpIHtcclxuICAgICAgICBzeXMub3V0KFwibmVlZCBhcmd1bWVudFxcblwiKTtcclxuICAgICAgICByZXR1cm47XHJcbiAgICB9XHJcbiAgICB0cnkge1xyXG4gICAgICAgIGF3YWl0IHN5cy5tb25pdG9yLmNvbXB1dGVyLmZpbGVzeXN0ZW0ucmVtb3ZlKGFyZ3ZbMV0pO1xyXG4gICAgfSBjYXRjaCAoZXJyKSB7XHJcbiAgICAgICAgc3lzLm91dChgJHtlcnJ9XFxuYCk7XHJcbiAgICAgICAgcmV0dXJuO1xyXG4gICAgfVxyXG59O1xyXG4iLCJpbXBvcnQgdHlwZSB7IFByb2dyYW0gfSBmcm9tIFwiLi4vcHJvZ3JhbVwiO1xyXG5cclxuY29uc3QgbWVzc2FnZSA9IGBcXFxyXG5MaXN0IG9mIGNvbW1hbmRzOlxyXG4gICAgaGVscFxyXG4gICAgICAgIERpc3BsYXkgdGhpcyBtZXNzYWdlLlxyXG4gICAgY29sb3IgWzxhbmdsZT5dXHJcbiAgICAgICAgQ2hhbmdlIHRlcm1pbmFsIGNvbG9yLlxyXG4gICAgbWtkaXIgWzxuYW1lPl1cclxuICAgICAgICBDcmVhdGUgYSBkaXJlY3RvcnkuIFBhcmVudCBkaXJlY3RvcnkgbXVzdCBleGlzdC5cclxuICAgIHRvdWNoIFs8bmFtZT5dXHJcbiAgICAgICAgQ3JlYXRlIGFuIGVtcHR5IGZpbGUuIFBhcmVudCBkaXJlY3RvcnkgbXVzdCBleGlzdC5cclxuICAgIGNhdCBbPG5hbWU+XVxyXG4gICAgICAgIFByaW50IHRoZSBjb250ZW50cyBvZiBhIGZpbGUuXHJcbiAgICBscyBbPG5hbWU+XVxyXG4gICAgICAgIFByaW50IHRoZSBlbnRyaWVzIGluIGEgZGlyZWN0b3J5LlxyXG4gICAgcm0gWzxuYW1lPl1cclxuICAgICAgICBEZWxldGUgYW4gZW50cnkgZnJvbSBhIGRpcmVjdG9yeS5cclxuVGhpcyB0ZXJtaW5hbCBpcyB2ZXJ5IHdvcmstaW4tcHJvZ3Jlc3MuXHJcbmBcclxuXHJcbmV4cG9ydCBkZWZhdWx0IChhc3luYyAoc3lzLCBhcmd2KSA9PiB7XHJcbiAgICBzeXMub3V0KG1lc3NhZ2UpO1xyXG59KSBzYXRpc2ZpZXMgUHJvZ3JhbTtcclxuIiwiLypcclxub3JpZ2luYWxseSB1c2VkIGF0IGh0dHBzOi8vZ2l0aHViLmNvbS90b2JzcHItZ2FtZXMvc2hhcGV6LWNvbW11bml0eS1lZGl0aW9uL3B1bGwvMTIvY29tbWl0cy81NjMzMGExNDMzZTgxYTI2MGJlNjY2NDhmOTBkZjc3YzgxNzIzMDhmXHJcbnJlbGljZW5zZWQgYnkgbWUsIHRoZSBvcmlnaW5hbCBhdXRob3JcclxuKi9cclxuXHJcbmZ1bmN0aW9uIGlzRGlzcGxheWVkKG5vZGU6IEpTWC5Ob2RlKTogbm9kZSBpcyBFeGNsdWRlPEpTWC5Ob2RlLCBib29sZWFuIHwgbnVsbCB8IHVuZGVmaW5lZD4ge1xyXG4gICAgcmV0dXJuIHR5cGVvZiBub2RlICE9PSBcImJvb2xlYW5cIiAmJiBub2RlICE9IG51bGw7XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBKU1ggZmFjdG9yeS5cclxuICovXHJcbmZ1bmN0aW9uIGpzeDxUIGV4dGVuZHMga2V5b2YgSlNYLkludHJpbnNpY0VsZW1lbnRzPih0YWc6IFQsIHByb3BzOiBKU1guSW50cmluc2ljRWxlbWVudHNbVF0pOiBIVE1MRWxlbWVudDtcclxuZnVuY3Rpb24ganN4PFUgZXh0ZW5kcyBKU1guUHJvcHM+KHRhZzogSlNYLkNvbXBvbmVudDxVPiwgcHJvcHM6IFUpOiBFbGVtZW50O1xyXG5mdW5jdGlvbiBqc3g8VSBleHRlbmRzIEpTWC5Qcm9wcz4oXHJcbiAgICB0YWc6IGtleW9mIEpTWC5JbnRyaW5zaWNFbGVtZW50cyB8IEpTWC5Db21wb25lbnQ8VT4sXHJcbiAgICBwcm9wczogVVxyXG4pOiBKU1guRWxlbWVudCB7XHJcbiAgICBpZiAodHlwZW9mIHRhZyA9PT0gXCJmdW5jdGlvblwiKSByZXR1cm4gdGFnKHByb3BzKTtcclxuXHJcbiAgICBjb25zdCB7IGNoaWxkcmVuLCAuLi5hdHRycyB9ID0gcHJvcHMgYXMgSlNYLkludHJpbnNpY0VsZW1lbnRzW2tleW9mIEpTWC5JbnRyaW5zaWNFbGVtZW50c107XHJcblxyXG4gICAgY29uc3QgZWxlbWVudCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQodGFnKTtcclxuICAgIE9iamVjdC5lbnRyaWVzKGF0dHJzKS5mb3JFYWNoKChba2V5LCB2YWx1ZV0pID0+IHtcclxuICAgICAgICBzd2l0Y2ggKHR5cGVvZiB2YWx1ZSkge1xyXG4gICAgICAgICAgICBjYXNlIFwiYm9vbGVhblwiOlxyXG4gICAgICAgICAgICAgICAgaWYgKCF2YWx1ZSkgcmV0dXJuO1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIGVsZW1lbnQuc2V0QXR0cmlidXRlKGtleSwgXCJcIik7XHJcbiAgICAgICAgICAgIGNhc2UgXCJudW1iZXJcIjpcclxuICAgICAgICAgICAgY2FzZSBcInN0cmluZ1wiOlxyXG4gICAgICAgICAgICAgICAgcmV0dXJuIGVsZW1lbnQuc2V0QXR0cmlidXRlKGtleSwgYCR7dmFsdWV9YCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoXCJKU1ggZWxlbWVudCBhdHRyaWJ1dGUgYXNzaWduZWQgaW52YWxpZCB0eXBlXCIpO1xyXG4gICAgfSk7XHJcbiAgICBlbGVtZW50LmFwcGVuZCguLi4oW2NoaWxkcmVuXS5mbGF0KEluZmluaXR5KSBhcyBKU1guTm9kZVtdKS5maWx0ZXIoaXNEaXNwbGF5ZWQpKTtcclxuICAgIHJldHVybiBlbGVtZW50O1xyXG59XHJcblxyXG4vLyBmdW5jdGlvbmFsIGNvbXBvbmVudCwgY2FsbGVkIGluZGlyZWN0bHkgYXMgYGpzeChGcmFnbWVudCwgcHJvcHMpYFxyXG4vKipcclxuICogR3JvdXBzIGVsZW1lbnRzIHdpdGhvdXQgaW50cm9kdWNpbmcgYSBwYXJlbnQgZWxlbWVudC5cclxuICovXHJcbmNvbnN0IEZyYWdtZW50ID0gKHByb3BzOiBKU1guUHJvcHMpID0+IHByb3BzLmNoaWxkcmVuIGFzIEpTWC5FbGVtZW50O1xyXG5cclxuLy8ganN4cyBpcyB1c2VkIHdoZW4gdGhlcmUgYXJlIG11bHRpcGxlIGNoaWxkcmVuXHJcbmV4cG9ydCB7IGpzeCwganN4IGFzIGpzeHMsIEZyYWdtZW50IH07XHJcbiIsImltcG9ydCB7IENvbXB1dGVyIH0gZnJvbSBcIi4vY3B1L2NvbXB1dGVyXCI7XHJcbmltcG9ydCB7IHNsZWVwLCBwb2x5ZmlsbFBsYWludGV4dE9ubHkgfSBmcm9tIFwiLi91dGlsc1wiO1xyXG5cclxuY29uc3QgdGV4dDEgPSBgV2VsY29tZSB0byB0aGVcclxuXHJcbuKWiOKWiOKWiOKWiOKWiOKWiOKVl+KWkeKWiOKWiOKWiOKWiOKWiOKWiOKWiOKVl+KWiOKWiOKVl+KWkeKWkeKWiOKWiOKVl+KWkeKWiOKWiOKWiOKWiOKWiOKWiOKVl1xyXG7ilojilojilZTilZDilZDilojilojilZfilojilojilZTilZDilZDilZDilZDilZ3ilojilojilZHilpHilpHilojilojilZHilojilojilZTilZDilZDilZDilZDilZ1cclxu4paI4paI4paI4paI4paI4paI4pWm4pWd4paI4paI4paI4paI4paI4pWX4paR4paR4paI4paI4paI4paI4paI4paI4paI4pWR4pWa4paI4paI4paI4paI4paI4pWX4paRXHJcbuKWiOKWiOKVlOKVkOKVkOKWiOKWiOKVl+KWiOKWiOKVlOKVkOKVkOKVneKWkeKWkeKWiOKWiOKVlOKVkOKVkOKWiOKWiOKVkeKWkeKVmuKVkOKVkOKVkOKWiOKWiOKVl1xyXG7ilojilojilojilojilojilojilabilZ3ilojilojilZHilpHilpHilpHilpHilpHilojilojilZHilpHilpHilojilojilZHilojilojilojilojilojilojilZTilZ1cclxu4pWa4pWQ4pWQ4pWQ4pWQ4pWQ4pWd4paR4pWa4pWQ4pWd4paR4paR4paR4paR4paR4pWa4pWQ4pWd4paR4paR4pWa4pWQ4pWd4pWa4pWQ4pWQ4pWQ4pWQ4pWQ4pWd4paRXHJcblxyXG7ilpHilojilojilojilojilojilZfilpHilpHilojilojilojilojilojilojilZfigIPigIPilpHilojilojilojilojilojilZfilpHilojilojilZfilpHilpHilpHilpHilpHilojilojilZfilpHilpHilpHilojilojilZfilojilojilojilojilojilojilZfilpHilojilojilZdcclxu4paI4paI4pWU4pWQ4pWQ4paI4paI4pWX4paI4paI4pWU4pWQ4pWQ4pWQ4pWQ4pWd4oCD4oCD4paI4paI4pWU4pWQ4pWQ4paI4paI4pWX4paI4paI4pWR4paR4paR4paR4paR4paR4paI4paI4pWR4paR4paR4paR4paI4paI4pWR4paI4paI4pWU4pWQ4pWQ4paI4paI4pWX4paI4paI4pWRXHJcbuKWiOKWiOKVkeKWkeKWkeKVmuKVkOKVneKVmuKWiOKWiOKWiOKWiOKWiOKVl+KWkeKAg+KAg+KWiOKWiOKVkeKWkeKWkeKVmuKVkOKVneKWiOKWiOKVkeKWkeKWkeKWkeKWkeKWkeKWiOKWiOKVkeKWkeKWkeKWkeKWiOKWiOKVkeKWiOKWiOKWiOKWiOKWiOKWiOKVpuKVneKWiOKWiOKVkVxyXG7ilojilojilZHilpHilpHilojilojilZfilpHilZrilZDilZDilZDilojilojilZfigIPigIPilojilojilZHilpHilpHilojilojilZfilojilojilZHilpHilpHilpHilpHilpHilojilojilZHilpHilpHilpHilojilojilZHilojilojilZTilZDilZDilojilojilZfilZrilZDilZ1cclxu4pWa4paI4paI4paI4paI4paI4pWU4pWd4paI4paI4paI4paI4paI4paI4pWU4pWd4oCD4oCD4pWa4paI4paI4paI4paI4paI4pWU4pWd4paI4paI4paI4paI4paI4paI4paI4pWX4pWa4paI4paI4paI4paI4paI4paI4pWU4pWd4paI4paI4paI4paI4paI4paI4pWm4pWd4paI4paI4pWXXHJcbuKWkeKVmuKVkOKVkOKVkOKVkOKVneKWkeKVmuKVkOKVkOKVkOKVkOKVkOKVneKWkeKAg+KAg+KWkeKVmuKVkOKVkOKVkOKVkOKVneKWkeKVmuKVkOKVkOKVkOKVkOKVkOKVkOKVneKWkeKVmuKVkOKVkOKVkOKVkOKVkOKVneKWkeKVmuKVkOKVkOKVkOKVkOKVkOKVneKWkeKVmuKVkOKVnVxyXG5gO1xyXG5cclxuY29uc3QgdGV4dDFzID0gYFdlbGNvbWUgdG8gdGhlXHJcblxyXG7ilojiloTiloQg4paI4paA4paAIOKWiOKWkeKWiCDilojiloBcclxu4paI4paE4paIIOKWiOKWgOKWkSDilojiloDilogg4paE4paIXHJcblxyXG7ilojiloDiloAg4paI4paAICDilojiloDiloAg4paI4paR4paRIOKWiOKWkeKWiCDilojiloTiloQg4paIXHJcbuKWiOKWhOKWhCDiloTiloggIOKWiOKWhOKWhCDilojiloTiloQg4paI4paE4paIIOKWiOKWhOKWiCDiloRcclxuYDtcclxuXHJcbmNvbnN0IHRleHQyID0gYFxyXG5SdW4gXCJoZWxwXCIgb24gdGhpcyB0ZXJtaW5hbFxyXG5hbmQvb3IgY2xpY2sgb24gdGhlIHBhcGVyIHRvIGxvb2sgZG93biFcclxuXHJcbj4gYDtcclxuXHJcbmV4cG9ydCBkZWZhdWx0IGNsYXNzIE1vbml0b3Ige1xyXG4gICAgcHVibGljIHJvb3Q6IEhUTUxFbGVtZW50O1xyXG4gICAgcHVibGljIHNjcmVlbjogSFRNTEVsZW1lbnQ7XHJcbiAgICBwdWJsaWMgY29udGVudDogSFRNTEVsZW1lbnQ7XHJcbiAgICBwdWJsaWMgb3V0cHV0OiBIVE1MRWxlbWVudDtcclxuICAgIHB1YmxpYyBpbnB1dDogSFRNTEVsZW1lbnQ7XHJcbiAgICBwdWJsaWMgY29tcHV0ZXI6IENvbXB1dGVyO1xyXG5cclxuICAgIGNvbnN0cnVjdG9yKHJvb3Q6IEhUTUxFbGVtZW50KSB7XHJcbiAgICAgICAgdGhpcy5yb290ID0gcm9vdDtcclxuICAgICAgICB0aGlzLnNjcmVlbiA9IHJvb3QuZ2V0RWxlbWVudHNCeUNsYXNzTmFtZShcInNjcmVlblwiKVswXSBhcyBIVE1MRWxlbWVudDtcclxuICAgICAgICB0aGlzLmNvbnRlbnQgPSByb290LmdldEVsZW1lbnRzQnlDbGFzc05hbWUoXCJjb250ZW50XCIpWzBdIGFzIEhUTUxFbGVtZW50O1xyXG4gICAgICAgIHRoaXMub3V0cHV0ID0gcm9vdC5nZXRFbGVtZW50c0J5Q2xhc3NOYW1lKFwib3V0cHV0XCIpWzBdIGFzIEhUTUxFbGVtZW50O1xyXG4gICAgICAgIHRoaXMuaW5wdXQgPSByb290LmdldEVsZW1lbnRzQnlDbGFzc05hbWUoXCJpbnB1dFwiKVswXSBhcyBIVE1MRWxlbWVudDtcclxuICAgICAgICB0aGlzLmNvbXB1dGVyID0gbmV3IENvbXB1dGVyKHRoaXMpO1xyXG5cclxuICAgICAgICBjb25zdCBzZWxmID0gdGhpcztcclxuICAgICAgICBwb2x5ZmlsbFBsYWludGV4dE9ubHkodGhpcy5pbnB1dCk7XHJcbiAgICAgICAgdGhpcy5yb290LmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCBmdW5jdGlvbihlKSB7XHJcbiAgICAgICAgICAgIGlmICh3aW5kb3cuZ2V0U2VsZWN0aW9uKCkhLmlzQ29sbGFwc2VkKSBzZWxmLmlucHV0LmZvY3VzKCk7XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgdGhpcy5pbnB1dC5hZGRFdmVudExpc3RlbmVyKFwiZm9jdXNcIiwgZnVuY3Rpb24oZSkge1xyXG4gICAgICAgICAgICB3aW5kb3cuZ2V0U2VsZWN0aW9uKCkhLnNlbGVjdEFsbENoaWxkcmVuKHRoaXMpO1xyXG4gICAgICAgICAgICB3aW5kb3cuZ2V0U2VsZWN0aW9uKCkhLmNvbGxhcHNlVG9FbmQoKTtcclxuICAgICAgICB9KTtcclxuICAgICAgICB0aGlzLmlucHV0LmFkZEV2ZW50TGlzdGVuZXIoXCJrZXlkb3duXCIsIGFzeW5jIGZ1bmN0aW9uKGUpIHtcclxuICAgICAgICAgICAgaWYgKGUua2V5ICE9PSBcIkVudGVyXCIpIHJldHVybjtcclxuICAgICAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xyXG4gICAgICAgICAgICBzZWxmLnByaW50KHRoaXMudGV4dENvbnRlbnQgKyBcIlxcblwiKTtcclxuICAgICAgICAgICAgY29uc3Qgc3RyID0gdGhpcy50ZXh0Q29udGVudCE7XHJcbiAgICAgICAgICAgIHRoaXMudGV4dENvbnRlbnQgPSBcIlwiO1xyXG4gICAgICAgICAgICBhd2FpdCBzZWxmLmNvbXB1dGVyLnJ1bihzdHIpO1xyXG4gICAgICAgICAgICBzZWxmLnByaW50KFwiPiBcIik7XHJcbiAgICAgICAgICAgIHRoaXMuY2xhc3NMaXN0LmFkZChcImVtcHR5XCIpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIHRoaXMuaW5wdXQuYWRkRXZlbnRMaXN0ZW5lcihcImlucHV0XCIsIGZ1bmN0aW9uKGUpIHtcclxuICAgICAgICAgICAgaWYgKHRoaXMudGV4dENvbnRlbnQhLmxlbmd0aCA9PT0gMCkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5jbGFzc0xpc3QuYWRkKFwiZW1wdHlcIik7XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmNsYXNzTGlzdC5yZW1vdmUoXCJlbXB0eVwiKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG5cclxuICAgIHByaW50KHN0cjogc3RyaW5nKSB7XHJcbiAgICAgICAgdGhpcy5vdXRwdXQuaW5zZXJ0QWRqYWNlbnRUZXh0KFwiYmVmb3JlZW5kXCIsIHN0cik7XHJcbiAgICAgICAgdGhpcy5jb250ZW50LnNjcm9sbFRvcCA9IHRoaXMuY29udGVudC5zY3JvbGxIZWlnaHQ7XHJcbiAgICB9XHJcblxyXG4gICAgYXN5bmMgYm9vdCgpIHtcclxuICAgICAgICBhd2FpdCB0aGlzLmNvbXB1dGVyLmluaXQoKTtcclxuICAgICAgICBhd2FpdCBzbGVlcCg4MDApO1xyXG4gICAgICAgIGNvbnN0IHNpemUgPSBwYXJzZUZsb2F0KHdpbmRvdy5nZXRDb21wdXRlZFN0eWxlKGRvY3VtZW50LmRvY3VtZW50RWxlbWVudCkuZm9udFNpemUpO1xyXG4gICAgICAgIHRoaXMucHJpbnQoc2l6ZSA8IDc2ID8gdGV4dDFzIDogdGV4dDEpO1xyXG4gICAgICAgIGF3YWl0IHNsZWVwKDEzMDApO1xyXG4gICAgICAgIHRoaXMucHJpbnQodGV4dDIpO1xyXG4gICAgfVxyXG59XHJcbiIsImltcG9ydCB7IG1ha2VTdHlsZSB9IGZyb20gXCIuLi91dGlsc1wiO1xyXG5cclxuY29uc3QgdGhpY2sgPSAxO1xyXG5cclxuY29uc3QgbWFrZUxlZyA9ICh7IHgsIHksIGhlaWdodCB9OiB7IHg6IG51bWJlciwgeTogbnVtYmVyLCBoZWlnaHQ6IG51bWJlciB9KSA9PiB7XHJcbiAgICByZXR1cm4gPGRpdiBjbGFzcz1cImdyb3VwXCIgc3R5bGU9e21ha2VTdHlsZSh7IHBvczogYHRyYW5zbGF0ZTNkKCR7eH1yZW0sMCwke3l9cmVtKWB9KX0+XHJcbiAgICAgICAgPGRpdiBjbGFzcz1cIm9iamVjdFwiIHN0eWxlPXttYWtlU3R5bGUoeyBjb2xvcjogXCIjMjYxYTBkXCIsIHdpZHRoOiB0aGljaywgaGVpZ2h0OiBoZWlnaHQtdGhpY2ssIHBvczogYHRyYW5zbGF0ZVgoJHt0aGljay8yfXJlbSkgcm90YXRlWSg5MGRlZylgfSl9PjwvZGl2PlxyXG4gICAgICAgIDxkaXYgY2xhc3M9XCJvYmplY3RcIiBzdHlsZT17bWFrZVN0eWxlKHsgY29sb3I6IFwiIzI2MWEwZFwiLCB3aWR0aDogdGhpY2ssIGhlaWdodDogaGVpZ2h0LXRoaWNrLCBwb3M6IGB0cmFuc2xhdGVaKCR7dGhpY2svMn1yZW0pYH0pfT48L2Rpdj5cclxuICAgICAgICA8ZGl2IGNsYXNzPVwib2JqZWN0XCIgc3R5bGU9e21ha2VTdHlsZSh7IGNvbG9yOiBcIiMyNjFhMGRcIiwgd2lkdGg6IHRoaWNrLCBoZWlnaHQ6IGhlaWdodC10aGljaywgcG9zOiBgdHJhbnNsYXRlWCgkey10aGljay8yfXJlbSkgcm90YXRlWSgtOTBkZWcpYH0pfT48L2Rpdj5cclxuICAgICAgICA8ZGl2IGNsYXNzPVwib2JqZWN0XCIgc3R5bGU9e21ha2VTdHlsZSh7IGNvbG9yOiBcIiMyNjFhMGRcIiwgd2lkdGg6IHRoaWNrLCBoZWlnaHQ6IGhlaWdodC10aGljaywgcG9zOiBgdHJhbnNsYXRlWigkey10aGljay8yfXJlbSkgcm90YXRlWSgxODBkZWcpYH0pfT48L2Rpdj5cclxuICAgIDwvZGl2PjtcclxufTtcclxuXHJcbmV4cG9ydCBjb25zdCBtYWtlVGFibGUgPSAoeyB3aWR0aCwgZGVwdGgsIGhlaWdodCB9OiB7IHdpZHRoOiBudW1iZXIsIGRlcHRoOiBudW1iZXIsIGhlaWdodDogbnVtYmVyIH0pID0+IHtcclxuICAgIHJldHVybiA8ZGl2IGNsYXNzPVwiZ3JvdXBcIiBzdHlsZT17bWFrZVN0eWxlKHsgcG9zOiBcInRyYW5zbGF0ZTNkKDAsMCwwKVwifSl9PlxyXG4gICAgICAgIDxkaXYgY2xhc3M9XCJncm91cFwiIHN0eWxlPXttYWtlU3R5bGUoeyBwb3M6IGB0cmFuc2xhdGVZKCR7KC1oZWlnaHQrdGhpY2spLzJ9cmVtKWB9KX0+XHJcbiAgICAgICAgICAgIHttYWtlTGVnKHsgeDogd2lkdGgvMi10aGljayoyLCB5OiBkZXB0aC8yLXRoaWNrKjIsIGhlaWdodCB9KX1cclxuICAgICAgICAgICAge21ha2VMZWcoeyB4OiAtd2lkdGgvMit0aGljayoyLCB5OiBkZXB0aC8yLXRoaWNrKjIsIGhlaWdodCB9KX1cclxuICAgICAgICAgICAge21ha2VMZWcoeyB4OiAtd2lkdGgvMit0aGljayoyLCB5OiAtZGVwdGgvMit0aGljayoyLCBoZWlnaHQgfSl9XHJcbiAgICAgICAgICAgIHttYWtlTGVnKHsgeDogd2lkdGgvMi10aGljayoyLCB5OiAtZGVwdGgvMit0aGljayoyLCBoZWlnaHQgfSl9XHJcbiAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgPGRpdiBjbGFzcz1cImdyb3VwXCIgc3R5bGU9e21ha2VTdHlsZSh7IHBvczogYHRyYW5zbGF0ZVkoJHstaGVpZ2h0K3RoaWNrLzJ9cmVtKWAgfSl9PlxyXG4gICAgICAgICAgICA8ZGl2IGNsYXNzPVwib2JqZWN0XCIgc3R5bGU9e21ha2VTdHlsZSh7IGNvbG9yOiBcIiM1ZTNkMTlcIiwgd2lkdGgsIGhlaWdodDogZGVwdGgsIHBvczogYHRyYW5zbGF0ZVkoJHstdGhpY2svMn1yZW0pIHJvdGF0ZVgoOTBkZWcpYH0pfSAvPlxyXG4gICAgICAgICAgICA8ZGl2IGNsYXNzPVwib2JqZWN0XCIgc3R5bGU9e21ha2VTdHlsZSh7IGNvbG9yOiBcIiMyNjFhMGRcIiwgd2lkdGgsIGhlaWdodDogZGVwdGgsIHBvczogYHRyYW5zbGF0ZVkoJHt0aGljay8yfXJlbSkgcm90YXRlWCg5MGRlZylgfSl9IC8+XHJcbiAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJvYmplY3RcIiBzdHlsZT17bWFrZVN0eWxlKHsgY29sb3I6IFwiIzQ5MzExN1wiLCB3aWR0aCwgaGVpZ2h0OiB0aGljaywgcG9zOiBgdHJhbnNsYXRlWigke2RlcHRoLzJ9cmVtKWB9KX0gLz5cclxuICAgICAgICAgICAgPGRpdiBjbGFzcz1cIm9iamVjdFwiIHN0eWxlPXttYWtlU3R5bGUoeyBjb2xvcjogXCIjNDkzMTE3XCIsIHdpZHRoLCBoZWlnaHQ6IHRoaWNrLCBwb3M6IGByb3RhdGVZKDE4MGRlZykgdHJhbnNsYXRlWigke2RlcHRoLzJ9cmVtKWB9KX0gLz5cclxuICAgICAgICAgICAgPGRpdiBjbGFzcz1cIm9iamVjdFwiIHN0eWxlPXttYWtlU3R5bGUoeyBjb2xvcjogXCIjNDkzMTE3XCIsIHdpZHRoOiBkZXB0aCwgaGVpZ2h0OiB0aGljaywgcG9zOiBgcm90YXRlWSg5MGRlZykgdHJhbnNsYXRlWigke3dpZHRoLzJ9cmVtKWB9KX0gLz5cclxuICAgICAgICAgICAgPGRpdiBjbGFzcz1cIm9iamVjdFwiIHN0eWxlPXttYWtlU3R5bGUoeyBjb2xvcjogXCIjNDkzMTE3XCIsIHdpZHRoOiBkZXB0aCwgaGVpZ2h0OiB0aGljaywgcG9zOiBgcm90YXRlWSgtOTBkZWcpIHRyYW5zbGF0ZVooJHt3aWR0aC8yfXJlbSlgfSl9IC8+XHJcbiAgICAgICAgPC9kaXY+XHJcbiAgICA8L2Rpdj47XHJcbn07XHJcbiIsImV4cG9ydCBjb25zdCBzbGVlcCA9IChtczogbnVtYmVyKSA9PiBuZXcgUHJvbWlzZSgocmVzKSA9PiB7XHJcbiAgICBzZXRJbnRlcnZhbChyZXMsIG1zKTtcclxufSk7XHJcblxyXG5jb25zdCB0eXBlID0gKGVsZW06IEhUTUxFbGVtZW50LCB0ZXh0OiBzdHJpbmcpID0+IHtcclxuICAgIGNvbnN0IHNlbCA9IHdpbmRvdy5nZXRTZWxlY3Rpb24oKSE7XHJcbiAgICBjb25zdCBjb250ZW50ID0gZWxlbS50ZXh0Q29udGVudCE7XHJcbiAgICBjb25zdCBbc3RhcnQsIGVuZF0gPSBbXHJcbiAgICAgICAgc2VsLmFuY2hvck9mZnNldCAqIChzZWwuYW5jaG9yTm9kZSA9PT0gZWxlbSA/IGNvbnRlbnQubGVuZ3RoIDogMSksXHJcbiAgICAgICAgc2VsLmZvY3VzT2Zmc2V0ICogKHNlbC5mb2N1c05vZGUgPT09IGVsZW0gPyBjb250ZW50Lmxlbmd0aCA6IDEpLFxyXG4gICAgXS5zb3J0KChhLGIpID0+IGEgLSBiKTtcclxuICAgIGVsZW0udGV4dENvbnRlbnQgPSBjb250ZW50LnNsaWNlKDAsIHN0YXJ0KSArIHRleHQgKyBjb250ZW50LnNsaWNlKGVuZCk7XHJcblxyXG4gICAgc2VsLnJlbW92ZUFsbFJhbmdlcygpO1xyXG4gICAgY29uc3QgcmFuZ2UgPSBkb2N1bWVudC5jcmVhdGVSYW5nZSgpO1xyXG4gICAgcmFuZ2Uuc2V0U3RhcnQoZWxlbS5jaGlsZE5vZGVzWzBdLCBzdGFydCArIHRleHQubGVuZ3RoKTtcclxuICAgIHJhbmdlLnNldEVuZChlbGVtLmNoaWxkTm9kZXNbMF0sIHN0YXJ0ICsgdGV4dC5sZW5ndGgpO1xyXG4gICAgc2VsLmFkZFJhbmdlKHJhbmdlKTtcclxuXHJcbiAgICBlbGVtLmRpc3BhdGNoRXZlbnQobmV3IEV2ZW50KFwiaW5wdXRcIikpO1xyXG59O1xyXG5cclxuLyoqXHJcbiAqIEZvciBGaXJlZm94LlxyXG4gKiBCYXNlZCBvbiBodHRwczovL3N0YWNrb3ZlcmZsb3cuY29tL2EvNjQwMDE4MzlcclxuICovXHJcbmV4cG9ydCBjb25zdCBwb2x5ZmlsbFBsYWludGV4dE9ubHkgPSAoZWxlbTogSFRNTEVsZW1lbnQpID0+IHtcclxuICAgIGlmIChlbGVtLmNvbnRlbnRFZGl0YWJsZSA9PT0gXCJwbGFpbnRleHQtb25seVwiKSByZXR1cm47XHJcblxyXG4gICAgZWxlbS5jb250ZW50RWRpdGFibGUgPSBcInRydWVcIjtcclxuICAgIGVsZW0uYWRkRXZlbnRMaXN0ZW5lcihcImtleWRvd25cIiwgZnVuY3Rpb24oZSkge1xyXG4gICAgICAgIGlmIChlLmtleSAhPT0gXCJFbnRlclwiKSByZXR1cm47XHJcbiAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xyXG4gICAgfSk7XHJcbiAgICBlbGVtLmFkZEV2ZW50TGlzdGVuZXIoXCJwYXN0ZVwiLCBmdW5jdGlvbihlKSB7XHJcbiAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xyXG4gICAgICAgIHR5cGUodGhpcywgZS5jbGlwYm9hcmREYXRhIS5nZXREYXRhKFwidGV4dC9wbGFpblwiKSk7XHJcbiAgICB9KTtcclxuICAgIC8vIGZpeGVzIEZpcmVmb3ggaW5zZXJ0aW5nIGEgPGJyPlxyXG4gICAgZWxlbS5hZGRFdmVudExpc3RlbmVyKFwiaW5wdXRcIiwgZnVuY3Rpb24oZSkge1xyXG4gICAgICAgIGlmICh0aGlzLmNoaWxkcmVuLmxlbmd0aCA9PT0gMCkgcmV0dXJuO1xyXG4gICAgICAgIHRoaXMudGV4dENvbnRlbnQgPSBcIlwiO1xyXG4gICAgfSk7XHJcbiAgICBpZiAoZWxlbS5hdXRvZm9jdXMpIHtcclxuICAgICAgICBlbGVtLmZvY3VzKCk7XHJcbiAgICB9XHJcbn07XHJcblxyXG5leHBvcnQgY29uc3QgbWFrZVN0eWxlID0gKHsgY29sb3IgPSBcInRyYW5zcGFyZW50XCIsIHdpZHRoID0gMCwgaGVpZ2h0ID0gMCwgcG9zLCBjZW50ZXIgPSB0cnVlIH06IHsgY29sb3I/OiBzdHJpbmcsIHdpZHRoPzogbnVtYmVyLCBoZWlnaHQ/OiBudW1iZXIsIHBvczogc3RyaW5nLCBjZW50ZXI/OiBib29sZWFuIH0pID0+IHtcclxuICAgIHJldHVybiBgXHJcbiAgICAgICAgYmFja2dyb3VuZC1jb2xvcjogJHtjb2xvcn07XHJcbiAgICAgICAgd2lkdGg6ICR7d2lkdGh9cmVtO1xyXG4gICAgICAgIGhlaWdodDogJHtoZWlnaHR9cmVtO1xyXG4gICAgICAgIHRyYW5zZm9ybTogJHtjZW50ZXIgPyBcInRyYW5zbGF0ZSgtNTAlLC01MCUpXCIgOiBcIlwifSAke3Bvc31gO1xyXG59O1xyXG4iLCJleHBvcnQgZGVmYXVsdCBjbGFzcyBXb3JsZCB7XHJcbiAgICBwdWJsaWMgcm9vdDogSFRNTEVsZW1lbnQ7XHJcbiAgICBwdWJsaWMgc2VsZWN0ZWQ6IEhUTUxFbGVtZW50IHwgdW5kZWZpbmVkO1xyXG4gICAgcHVibGljIGRlZmF1bHRUcmFuc2Zvcm06IHN0cmluZztcclxuXHJcbiAgICBjb25zdHJ1Y3Rvcihyb290OiBIVE1MRWxlbWVudCwgb2JqZWN0czogeyBlbGVtOiBIVE1MRWxlbWVudCwgdHJhbnNmb3JtPzogc3RyaW5nIH1bXSkge1xyXG4gICAgICAgIHRoaXMucm9vdCA9IHJvb3Q7XHJcbiAgICAgICAgY29uc3Qgc2VsZiA9IHRoaXM7XHJcbiAgICAgICAgZm9yIChjb25zdCB7IGVsZW0sIHRyYW5zZm9ybSB9IG9mIG9iamVjdHMpIHtcclxuICAgICAgICAgICAgdGhpcy5yb290LmFwcGVuZENoaWxkKGVsZW0pO1xyXG4gICAgICAgICAgICBpZiAodHJhbnNmb3JtID09IG51bGwpIGNvbnRpbnVlO1xyXG4gICAgICAgICAgICBlbGVtLnN0eWxlLnBvaW50ZXJFdmVudHMgPSBcImF1dG9cIjtcclxuICAgICAgICAgICAgZWxlbS5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgZnVuY3Rpb24oZSkge1xyXG4gICAgICAgICAgICAgICAgaWYgKHRoaXMgPT09IHNlbGYuc2VsZWN0ZWQpIHJldHVybjtcclxuICAgICAgICAgICAgICAgIGlmIChzZWxmLnNlbGVjdGVkICE9IG51bGwpIHNlbGYuc2VsZWN0ZWQuY2xhc3NMaXN0LnJlbW92ZShcInNlbGVjdGVkXCIpO1xyXG4gICAgICAgICAgICAgICAgc2VsZi5zZWxlY3RlZCA9IHRoaXM7XHJcbiAgICAgICAgICAgICAgICBzZWxmLnNlbGVjdGVkLmNsYXNzTGlzdC5hZGQoXCJzZWxlY3RlZFwiKTtcclxuICAgICAgICAgICAgICAgIHNlbGYucm9vdC5zdHlsZS50cmFuc2Zvcm0gPSB0cmFuc2Zvcm07XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH1cclxuICAgICAgICB0aGlzLmRlZmF1bHRUcmFuc2Zvcm0gPSB0aGlzLnJvb3Quc3R5bGUudHJhbnNmb3JtO1xyXG4gICAgICAgIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoXCJrZXlkb3duXCIsIGZ1bmN0aW9uKGUpIHtcclxuICAgICAgICAgICAgaWYgKGUua2V5ICE9IFwiRXNjYXBlXCIpIHJldHVybjtcclxuICAgICAgICAgICAgZS5zdG9wUHJvcGFnYXRpb24oKTtcclxuICAgICAgICAgICAgaWYgKHNlbGYuc2VsZWN0ZWQgIT0gbnVsbCkgc2VsZi5zZWxlY3RlZC5jbGFzc0xpc3QucmVtb3ZlKFwic2VsZWN0ZWRcIik7XHJcbiAgICAgICAgICAgIHNlbGYuc2VsZWN0ZWQgPSB1bmRlZmluZWQ7XHJcbiAgICAgICAgICAgIHNlbGYucm9vdC5zdHlsZS50cmFuc2Zvcm0gPSBzZWxmLmRlZmF1bHRUcmFuc2Zvcm07XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcbn1cclxuIiwiLy8gVGhlIG1vZHVsZSBjYWNoZVxudmFyIF9fd2VicGFja19tb2R1bGVfY2FjaGVfXyA9IHt9O1xuXG4vLyBUaGUgcmVxdWlyZSBmdW5jdGlvblxuZnVuY3Rpb24gX193ZWJwYWNrX3JlcXVpcmVfXyhtb2R1bGVJZCkge1xuXHQvLyBDaGVjayBpZiBtb2R1bGUgaXMgaW4gY2FjaGVcblx0dmFyIGNhY2hlZE1vZHVsZSA9IF9fd2VicGFja19tb2R1bGVfY2FjaGVfX1ttb2R1bGVJZF07XG5cdGlmIChjYWNoZWRNb2R1bGUgIT09IHVuZGVmaW5lZCkge1xuXHRcdHJldHVybiBjYWNoZWRNb2R1bGUuZXhwb3J0cztcblx0fVxuXHQvLyBDcmVhdGUgYSBuZXcgbW9kdWxlIChhbmQgcHV0IGl0IGludG8gdGhlIGNhY2hlKVxuXHR2YXIgbW9kdWxlID0gX193ZWJwYWNrX21vZHVsZV9jYWNoZV9fW21vZHVsZUlkXSA9IHtcblx0XHQvLyBubyBtb2R1bGUuaWQgbmVlZGVkXG5cdFx0Ly8gbm8gbW9kdWxlLmxvYWRlZCBuZWVkZWRcblx0XHRleHBvcnRzOiB7fVxuXHR9O1xuXG5cdC8vIEV4ZWN1dGUgdGhlIG1vZHVsZSBmdW5jdGlvblxuXHRfX3dlYnBhY2tfbW9kdWxlc19fW21vZHVsZUlkXShtb2R1bGUsIG1vZHVsZS5leHBvcnRzLCBfX3dlYnBhY2tfcmVxdWlyZV9fKTtcblxuXHQvLyBSZXR1cm4gdGhlIGV4cG9ydHMgb2YgdGhlIG1vZHVsZVxuXHRyZXR1cm4gbW9kdWxlLmV4cG9ydHM7XG59XG5cbiIsIi8vIGRlZmluZSBnZXR0ZXIgZnVuY3Rpb25zIGZvciBoYXJtb255IGV4cG9ydHNcbl9fd2VicGFja19yZXF1aXJlX18uZCA9IChleHBvcnRzLCBkZWZpbml0aW9uKSA9PiB7XG5cdGZvcih2YXIga2V5IGluIGRlZmluaXRpb24pIHtcblx0XHRpZihfX3dlYnBhY2tfcmVxdWlyZV9fLm8oZGVmaW5pdGlvbiwga2V5KSAmJiAhX193ZWJwYWNrX3JlcXVpcmVfXy5vKGV4cG9ydHMsIGtleSkpIHtcblx0XHRcdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBrZXksIHsgZW51bWVyYWJsZTogdHJ1ZSwgZ2V0OiBkZWZpbml0aW9uW2tleV0gfSk7XG5cdFx0fVxuXHR9XG59OyIsIl9fd2VicGFja19yZXF1aXJlX18ubyA9IChvYmosIHByb3ApID0+IChPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwob2JqLCBwcm9wKSkiLCIvLyBkZWZpbmUgX19lc01vZHVsZSBvbiBleHBvcnRzXG5fX3dlYnBhY2tfcmVxdWlyZV9fLnIgPSAoZXhwb3J0cykgPT4ge1xuXHRpZih0eXBlb2YgU3ltYm9sICE9PSAndW5kZWZpbmVkJyAmJiBTeW1ib2wudG9TdHJpbmdUYWcpIHtcblx0XHRPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgU3ltYm9sLnRvU3RyaW5nVGFnLCB7IHZhbHVlOiAnTW9kdWxlJyB9KTtcblx0fVxuXHRPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgJ19fZXNNb2R1bGUnLCB7IHZhbHVlOiB0cnVlIH0pO1xufTsiLCJpbXBvcnQgTW9uaXRvciBmcm9tIFwiLi9tb25pdG9yXCI7XHJcbmltcG9ydCBXb3JsZCBmcm9tIFwiLi93b3JsZFwiO1xyXG5pbXBvcnQgeyBtYWtlVGFibGUgfSBmcm9tIFwiLi9vYmplY3RzL3RhYmxlXCI7XHJcblxyXG5jb25zdCBjb21wID0gPGRpdiBpZD1cImNvbXBcIiBjbGFzcz1cImNvbXB1dGVyIG9iamVjdFwiPlxyXG4gICAgPGRpdiBjbGFzcz1cInNjcmVlblwiPlxyXG4gICAgICAgIDxkaXYgY2xhc3M9XCJjb250ZW50XCI+XHJcbiAgICAgICAgICAgIDxwcmUgY2xhc3M9XCJvdXRwdXRcIj48L3ByZT48cHJlIGF1dG9mb2N1cyBjbGFzcz1cImlucHV0IGVtcHR5XCIgY29udGVudGVkaXRhYmxlPVwicGxhaW50ZXh0LW9ubHlcIiBzcGVsbGNoZWNrPVwiZmFsc2VcIj48L3ByZT5cclxuICAgICAgICA8L2Rpdj5cclxuICAgIDwvZGl2PlxyXG48L2Rpdj47XHJcblxyXG5jb25zdCBwYXBlciA9IDxkaXYgY2xhc3M9XCJwYXBlciBvYmplY3RcIj5cclxuICAgIDxkaXYgY2xhc3M9XCJzY3JvbGxcIj5cclxuICAgICAgICA8aDE+Q0xVQiBXRUJTSVRFIE1BTlVBTDxiciAvPmFuZDxiciAvPkNBS0UgRElTUEVOU0FSWTwvaDE+XHJcbiAgICAgICAgPHA+XHJcbiAgICAgICAgICAgIENsaWNrIG9uIHN0dWZmIHRvIGxvb2sgYXQgaXQuXHJcbiAgICAgICAgICAgIFlvdSBwcm9iYWJseSBmaWd1cmVkIHRoYXQgb25lIG91dCBhbHJlYWR5LFxyXG4gICAgICAgICAgICBidXQgZGlkIHlvdSBrbm93IHlvdSBjYW4gcHJlc3MgPGtiZD5Fc2M8L2tiZD4gdG8gem9vbSBiYWNrIG91dD8/P1xyXG4gICAgICAgIDwvcD5cclxuICAgICAgICA8cD5cclxuICAgICAgICAgICAgVGhlIHRlcm1pbmFsJ3MgZmlsZXN5c3RlbSByZXF1aXJlcyBJbmRleGVkREIgcGVybWlzc2lvbnMuXHJcbiAgICAgICAgPC9wPlxyXG4gICAgICAgIDxwPlxyXG4gICAgICAgICAgICBHb29kIGx1Y2shXHJcbiAgICAgICAgPC9wPlxyXG4gICAgICAgIDxoMj5BYm91dCB0aGUgY2x1YjwvaDI+XHJcbiAgICAgICAgPHA+XHJcbiAgICAgICAgICAgIExvcmVtIGlwc3VtIGRvbG9yIHNpdCBhbWV0LFxyXG4gICAgICAgICAgICBjb25zZWN0ZXR1ciBhZGlwaXNjaW5nIGVsaXQsXHJcbiAgICAgICAgICAgIHNlZCBkbyBlaXVzbW9kIHRlbXBvciBpbmNpZGlkdW50IHV0IGxhYm9yZSBldCBkb2xvcmUgbWFnbmEgYWxpcXVhLlxyXG4gICAgICAgICAgICBVdCBlbmltIGFkIG1pbmltIHZlbmlhbSxcclxuICAgICAgICAgICAgcXVpcyBub3N0cnVkIGV4ZXJjaXRhdGlvbiB1bGxhbWNvIGxhYm9yaXMgbmlzaSB1dCBhbGlxdWlwIGV4IGVhIGNvbW1vZG8gY29uc2VxdWF0LlxyXG4gICAgICAgICAgICBEdWlzIGF1dGUgaXJ1cmUgZG9sb3IgaW4gcmVwcmVoZW5kZXJpdCBpbiB2b2x1cHRhdGUgdmVsaXQgZXNzZSBjaWxsdW0gZG9sb3JlIGV1IGZ1Z2lhdCBudWxsYSBwYXJpYXR1ci5cclxuICAgICAgICAgICAgRXhjZXB0ZXVyIHNpbnQgb2NjYWVjYXQgY3VwaWRhdGF0IG5vbiBwcm9pZGVudCxcclxuICAgICAgICAgICAgc3VudCBpbiBjdWxwYSBxdWkgb2ZmaWNpYSBkZXNlcnVudCBtb2xsaXQgYW5pbSBpZCBlc3QgbGFib3J1bS5cclxuICAgICAgICA8L3A+XHJcbiAgICAgICAgPHA+XHJcbiAgICAgICAgT2ZmaWNlcnM6XHJcbiAgICAgICAgICAgIDx1bD5cclxuICAgICAgICAgICAgICAgIDxsaT48Yj5QcmVzaWRlbnQ6PC9iPiBKb2U8L2xpPlxyXG4gICAgICAgICAgICAgICAgPGxpPjxiPlZpY2UgUHJlc2lkZW50OjwvYj4gQXVzdGluPC9saT5cclxuICAgICAgICAgICAgICAgIDxsaT48Yj5TZWNyZXRhcnk6PC9iPiBUaG9tYXM8L2xpPlxyXG4gICAgICAgICAgICAgICAgPGxpPjxiPk91dHJlYWNoIERpcmVjdG9yOjwvYj4gWGluZGk8L2xpPlxyXG4gICAgICAgICAgICAgICAgPGxpPjxiPlRlY2ggTGVhZDo8L2I+IEpvbmF0aGFuPC9saT5cclxuICAgICAgICAgICAgICAgIDxsaT48Yj5Db250cmlidXRpbmcgTWVtYmVyczo8L2I+IEVkZW4sIE9zY2FyPC9saT5cclxuICAgICAgICAgICAgPC91bD5cclxuICAgICAgICA8L3A+XHJcbiAgICAgICAgPGgyPkFib3V0IHRoaXMgc2l0ZTwvaDI+XHJcbiAgICAgICAgPHA+XHJcbiAgICAgICAgICAgIFRoaXMgaXMgYSBwcm90b3R5cGUuXHJcbiAgICAgICAgICAgIE1heWJlIGl0IHJlYWxseSBpcyBjb29sZXIgdGhhbiBhIHBsYWluIG9sZCAyRCBzaXRlLFxyXG4gICAgICAgICAgICBvciBtYXliZSBpdCBpc24ndCBhbmQgd2UnbGwgd29yayBvbiBzb21ldGhpbmcgZWxzZS5cclxuICAgICAgICA8L3A+XHJcbiAgICAgICAgPHA+XHJcbiAgICAgICAgICAgIEV2ZXJ5dGhpbmcgaGVyZSBpcyBIVE1ML0NTUy9KUywgd2l0aCBubyBjbGllbnQtc2lkZSBsaWJyYXJpZXMhXHJcbiAgICAgICAgICAgIChPbmx5IFR5cGVTY3JpcHQgYW5kIHdlYnBhY2sgYXJlIHVzZWQgZm9yIGRldmVsb3BtZW50LilcclxuICAgICAgICAgICAgTWF5YmUgSSBzaG91bGQgcmVzZWFyY2ggbGlicmFyaWVzIG1vcmUuXHJcbiAgICAgICAgICAgIEkgc3RpbGwgY2FuJ3QgYmVsaWV2ZSB3ZWIgYnJvd3NlcnMgc3VwcG9ydCByZWFsbHkgZGVjZW50IGJhc2ljIDNEISEhXHJcbiAgICAgICAgPC9wPlxyXG4gICAgICAgIDxwPlxyXG4gICAgICAgICAgICBCeSB0aGUgd2F5LCB0cnkgem9vbWluZyBpbiBhbmQgb3V0LCBvciByZXNpemluZyB5b3VyIGJyb3dzZXIgd2luZG93LlxyXG4gICAgICAgICAgICBBY2Nlc3NpYmlsaXR5ISFcclxuICAgICAgICAgICAgSW4gZmFjdCwgdGhlIHRlcm1pbmFsIHN1cHBvcnRzIHNlbGVjdGlvbnMgYW5kIGNvcHktcGFzdGluZ1xyXG4gICAgICAgICAgICB2aWEgYSBmZXcgc2hpbXMgb24gYSBcImNvbnRlbnRlZGl0YWJsZVwiIGVsZW1lbnQuXHJcbiAgICAgICAgICAgIEFjdHVhbGx5IHlvdSBjYW4gc2VsZWN0IGFueSB0ZXh0IG9uIHRoaXMgc2l0ZS5cclxuICAgICAgICAgICAgRXhjZXB0IHRoZSBibGlua2luZyBjdXJzb3IgY2hhcmFjdGVyLiBDb29sIGVmZmVjdCwgaHVoP1xyXG4gICAgICAgIDwvcD5cclxuICAgICAgICA8cD5cclxuICAgICAgICAgICAgVGhpcyBzaXRlJ3Mgc291cmNlIGNvZGUgaXMgYXZhaWxhYmxlIDxhIHRhcmdldD1cIl9ibGFua1wiIHJlbD1cIm5vcmVmZXJyZXJcIiBocmVmPVwiaHR0cHM6Ly9naXRodWIuY29tL0JGSFMtT3Blbi9zaXRlXCI+aGVyZTwvYT4uXHJcbiAgICAgICAgICAgIEl0J3MgbGljZW5zZWQgdW5kZXIgdGhlIElTQyBMaWNlbnNlLFxyXG4gICAgICAgICAgICB3aGljaCBhY2NvcmRpbmcgdG8gV2lraXBlZGlhIGlzIChob3BlZnVsbHkpIGp1c3QgdGhlIE1JVCBMaWNlbnNlIGJ1dCBtb3JlIGNvbmNpc2UuXHJcbiAgICAgICAgPC9wPlxyXG4gICAgICAgIDxwPlxyXG4gICAgICAgICAgICBIYXZlIGZ1biFcclxuICAgICAgICA8L3A+XHJcbiAgICAgICAgPHA+XHJcbiAgICAgICAgICAgIC1BdXN0aW5cclxuICAgICAgICA8L3A+XHJcbiAgICA8L2Rpdj5cclxuPC9kaXY+O1xyXG5cclxuY29uc3Qgd29ybGQgPSBuZXcgV29ybGQoZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJ3b3JsZFwiKSEsIFtcclxuICAgIHtcclxuICAgICAgICBlbGVtOiBtYWtlVGFibGUoeyB3aWR0aDogNSoxMiwgZGVwdGg6IDIqMTIsIGhlaWdodDogMi41KjEyIH0pLFxyXG4gICAgfSxcclxuICAgIHtcclxuICAgICAgICBlbGVtOiBjb21wLFxyXG4gICAgICAgIHRyYW5zZm9ybTogXCJyb3RhdGVYKC0xMGRlZykgcm90YXRlWSgtNWRlZykgdHJhbnNsYXRlM2QoM3JlbSwzNXJlbSwwcmVtKVwiLFxyXG4gICAgfSxcclxuICAgIHtcclxuICAgICAgICBlbGVtOiBwYXBlcixcclxuICAgICAgICB0cmFuc2Zvcm06IFwicm90YXRlWCgtODBkZWcpIHJvdGF0ZVkoNWRlZykgdHJhbnNsYXRlM2QoLTVyZW0sMjhyZW0sLTVyZW0pXCIsXHJcbiAgICB9LFxyXG5dKTtcclxuXHJcbmNvbnN0IG1vbml0b3IgPSBuZXcgTW9uaXRvcihjb21wKTtcclxubW9uaXRvci5ib290KCk7XHJcbiJdLCJuYW1lcyI6W10sInNvdXJjZVJvb3QiOiIifQ==