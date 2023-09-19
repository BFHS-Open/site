import { sleep, polyfillPlaintextOnly } from "./utils.js";

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

export default class Monitor {
    /**
     * @param {HTMLElement} root
     */
    constructor(root) {
        this.root = root;
        this.screen = root.getElementsByClassName("screen")[0];
        this.content = root.getElementsByClassName("content")[0];
        this.output = root.getElementsByClassName("output")[0];
        this.input = root.getElementsByClassName("input")[0];

        const self = this;
        polyfillPlaintextOnly(this.input);
        this.root.addEventListener("click", function(e) {
            if (window.getSelection().isCollapsed) self.input.focus();
        });
        this.input.addEventListener("focus", function(e) {
            window.getSelection().selectAllChildren(this);
            window.getSelection().collapseToEnd();
        });
        this.input.addEventListener("keydown", async function(e) {
            if (e.key !== "Enter") return;
            e.preventDefault();
            self.output.insertAdjacentText("beforeend", this.textContent + "\n" + self.run(this.textContent) + "> ");
            this.textContent = "";
            self.content.scrollTop = self.content.scrollHeight;
            this.classList.add("empty");
        });
        this.input.addEventListener("input", function(e) {
            if (this.textContent.length === 0) {
                this.classList.add("empty");
            } else {
                this.classList.remove("empty");
            }
        });
    }

    /**
     * @param {string} str 
     * @returns {string}
     */
    run(str) {
        const res = str.trim().split(/\s+/u);
        if (res[0] === "") return "";
        const cmd = res[0];
        if (cmd == "help") {
            return `WIP sorry :(\nTry "color [deg]"!\n`
        } else if (cmd == "color") {
            const hue = res[1] === undefined ? Math.random() : +res[1]/360;
            if (!Number.isFinite(hue)) return `Invalid hue angle "${res[1]}"\n`;
            this.root.style.setProperty("--screen-color", `hsl(${hue ?? Math.random()}turn 100% 50%)`);
            return "";
        }
        return `Unrecognized command "${cmd}"\n`;
    }

    async boot() {
        await sleep(800);
        const size = parseFloat(window.getComputedStyle(document.documentElement).fontSize);
        this.output.insertAdjacentText("beforeend", size < 76 ? text1s : text1);
        await sleep(1300);
        this.output.insertAdjacentText("beforeend", text2);
    }
}
