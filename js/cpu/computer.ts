import type Monitor from "../monitor.js";
import type { Program } from "./program.js";
import help from "./programs/help.js";
import color from "./programs/color.js";

export class Computer {
    public monitor: Monitor;
    public programs: Map<string, Program>;

    constructor(monitor: Monitor) {
        this.monitor = monitor;
        this.programs = new Map(Object.entries({
            help,
            color,
        }));
    }

    async run(str: string) {
        const res = str.trim().split(/\s+/u);
        if (res[0] === "") return;

        const cmd = res[0];
        if (this.programs.has(cmd)) {
            this.programs.get(cmd)!({ out: (...args) => this.monitor.print(...args), monitor: this.monitor }, res);
            return;
        }

        this.monitor.print(`Unrecognized command "${cmd}"\n`);
    }
}
