import type Monitor from "../monitor";

export type System = {
    out: (str: string) => void;
    monitor: Monitor;
};

export type Program = (sys: System, argv: string[]) => Promise<void>;
