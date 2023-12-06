import type { Program } from "../program.js";

export const mkdir: Program = async (sys, argv) => {
    if (argv.length < 2) {
        sys.out("need argument\n");
        return;
    }
    try {
        await sys.monitor.computer.filesystem.makeDir(argv[1]);
    } catch (err) {
        sys.out(`${err}\n`);
        return;
    }
};

export const touch: Program = async (sys, argv) => {
    if (argv.length < 2) {
        sys.out("need argument\n");
        return;
    }
    try {
        await sys.monitor.computer.filesystem.makeFile(argv[1]);
    } catch (err) {
        sys.out(`${err}\n`);
        return;
    }
};

export const cat: Program = async (sys, argv) => {
    if (argv.length < 2) {
        sys.out("need argument\n");
        return;
    }
    try {
        sys.out(await sys.monitor.computer.filesystem.readFile(argv[1]));
    } catch (err) {
        sys.out(`${err}\n`);
        return;
    }
};

export const writeFile: Program = async (sys, argv) => {
    if (argv.length < 3) {
        sys.out("need 2 arguments\n");
        return;
    }
    try {
        await sys.monitor.computer.filesystem.writeFile(argv[1], argv[2] + "\n");
    } catch (err) {
        sys.out(`${err}\n`);
        return;
    }
};

const listing = (entrys: Record<string, number>) => {
    return Object.keys(entrys).map(s => s + "\n").join("");
};

export const ls: Program = async (sys, argv) => {
    try {
        sys.out(listing(await sys.monitor.computer.filesystem.readDir(argv[1] ?? "/")));
    } catch (err) {
        sys.out(`${err}\n`);
        return;
    }
};
