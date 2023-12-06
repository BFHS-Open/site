import { Computer } from "./cpu/computer";
import { sleep, polyfillPlaintextOnly } from "./utils";

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
    public root: HTMLElement;
    public screen: HTMLElement;
    public content: HTMLElement;
    public output: HTMLElement;
    public input: HTMLElement;
    public computer: Computer;

    constructor(root: HTMLElement) {
        this.root = root;
        this.screen = root.getElementsByClassName("screen")[0] as HTMLElement;
        this.content = root.getElementsByClassName("content")[0] as HTMLElement;
        this.output = root.getElementsByClassName("output")[0] as HTMLElement;
        this.input = root.getElementsByClassName("input")[0] as HTMLElement;
        this.computer = new Computer(this);

        const self = this;
        polyfillPlaintextOnly(this.input);
        this.root.addEventListener("click", function(e) {
            if (window.getSelection()!.isCollapsed) self.input.focus();
        });
        this.input.addEventListener("focus", function(e) {
            window.getSelection()!.selectAllChildren(this);
            window.getSelection()!.collapseToEnd();
        });
        this.input.addEventListener("keydown", async function(e) {
            if (e.key !== "Enter") return;
            e.preventDefault();
            self.print(this.textContent + "\n");
            const str = this.textContent!;
            this.textContent = "";
            await self.computer.run(str);
            self.print("> ");
            this.classList.add("empty");
        });
        this.input.addEventListener("input", function(e) {
            if (this.textContent!.length === 0) {
                this.classList.add("empty");
            } else {
                this.classList.remove("empty");
            }
        });
    }

    print(str: string) {
        this.output.insertAdjacentText("beforeend", str);
        this.content.scrollTop = this.content.scrollHeight;
    }

    async boot() {
        await this.computer.init();
        await sleep(800);
        const size = parseFloat(window.getComputedStyle(document.documentElement).fontSize);
        this.print(size < 76 ? text1s : text1);
        await sleep(1300);
        this.print(text2);
    }
}
