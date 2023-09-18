const world = document.getElementsByClassName("world")[0];

const comp = document.getElementById("main");

const content = comp.getElementsByClassName("content")[0];

const cli = comp.getElementsByClassName("cli")[0];

const input = comp.getElementsByClassName("input")[0];

// https://stackoverflow.com/a/64001839
if (input.contentEditable !== "plaintext-only") {
    const type = (elem, text) => {
        const sel = window.getSelection();
        const content = elem.textContent;
        const start = Math.min(sel.focusOffset, sel.anchorOffset);
        const end = Math.max(sel.focusOffset, sel. anchorOffset);
        elem.textContent = content.slice(0, start) + text + (content.slice(end) || "\n");

        sel.removeAllRanges();
        const range = document.createRange();
        range.setStart(elem.childNodes[0], start + text.length);
        range.setEnd(elem.childNodes[0], start + text.length);
        sel.addRange(range);

        elem.dispatchEvent(new Event("input"));
    };

    input.contentEditable = "true";
    input.addEventListener("paste", (e) => {
        e.preventDefault();
        type(input, e.clipboardData.getData("text/plain"));
    });
    input.addEventListener("input", (e) => {
        if (input.children.length === 0) return;
        input.textContent = "";
    });
}

let selectId = comp;

comp.addEventListener("click", (e) => {
    if (window.getSelection().isCollapsed) input.focus();
    if (comp == selectId) return;
    selectId.classList.remove("selected");
    selectId = comp;
    comp.classList.add("selected");
    world.style.transform = "translateZ(10rem) rotateX(0) translateZ(-10rem)";
});

input.addEventListener("focus", (e) => {
    window.getSelection().selectAllChildren(input);
    window.getSelection().collapseToEnd();
});

const run = (str) => {
    const res = str.trim().split(/\s+/u);
    if (res[0] === "") return "";
    const cmd = res[0];
    if (cmd == "help") {
        return `WIP sorry :(\nTry "color [deg]"!\n`
    } else if (cmd == "color") {
        const hue = res[1] === undefined ? Math.random() : +res[1]/360;
        if (!Number.isFinite(hue)) return `Invalid hue angle "${res[1]}"\n`;
        comp.style.setProperty("--screen-color", `hsl(${hue ?? Math.random()}turn 100% 50%)`);
        return "";
    }
    return `Unrecognized command "${cmd}"\n`;
};

input.addEventListener("keydown", (e) => {
    if (e.keyCode != 13) return;
    e.preventDefault();
    cli.insertAdjacentText("beforeend", input.textContent + "\n" + run(input.textContent) + "> ");
    input.textContent = "";
    content.scrollTop = content.scrollHeight;
    input.classList.add("empty");
});

input.addEventListener("input", (e) => {
    if (input.textContent.length === 0) {
        input.classList.add("empty");
    } else {
        input.classList.remove("empty");
    }
});

const paper = document.getElementsByClassName("paper")[0];

paper.addEventListener("click", (e) => {
    if (paper == selectId) return;
    selectId.classList.remove("selected");
    selectId = paper;
    paper.classList.add("selected");
    world.style.transform = "translateZ(4rem) rotateX(-70deg) translateZ(-10rem)";
});

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

█▀▀ █▀   █▀▀ █░░ █░█ █▄▄ █
█▄▄ ▄█   █▄▄ █▄▄ █▄█ █▄█ ▄
`;

const text2 = `
Run "help" on this awful terminal
or click on the paper to look down!

> `;

const sleep = (ms) => new Promise((res) => {
    setInterval(res, ms);
});

const init = async () => {
    await sleep(800);
    const size = parseFloat(window.getComputedStyle(document.documentElement).fontSize);
    console.log(size);
    cli.insertAdjacentText("beforeend", size < 71 ? text1s : text1);
    await sleep(1300);
    cli.insertAdjacentText("beforeend", text2);
};

init();
