import help from "./programs/help.js";
import color from "./programs/color.js";
import { mkdir, touch, cat, writeFile, ls } from "./programs/fs.js";
import { Filesystem } from "./filesystem.js";
export class Computer {
    monitor;
    programs;
    filesystem;
    constructor(monitor) {
        this.monitor = monitor;
        this.programs = new Map(Object.entries({
            help,
            color,
            mkdir,
            touch,
            cat,
            "write-file": writeFile,
            ls,
        }));
        this.filesystem = new Filesystem();
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
//# sourceMappingURL=computer.js.map