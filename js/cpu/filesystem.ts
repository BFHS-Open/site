import { Dir, Entry } from "./file";

const promisify = <T>(req: IDBRequest<T>) => new Promise<T>((res, rej) => {
    req.addEventListener("success", function() {
        res(this.result);
    });
    req.addEventListener("error", function() {
        alert(this.error);
        rej(this.error);
        // TODO: error handling
    });
});

const parse = (path: string) => {
    return path.trim().split("/").filter((name) => name !== "");
};

export class Filesystem {
    public root!: IDBValidKey;
    public db!: IDBDatabase;

    async init() {
        const request = window.indexedDB.open("filesystem", 1);
        request.addEventListener("upgradeneeded", async function() {
            const db = this.result;
            const info = db.createObjectStore("info");
            const files = db.createObjectStore("files", { autoIncrement: true })

            const req = files.add({
                type: "dir",
                entrys: {},
            } satisfies Dir);
            info.put(await promisify(req), "root");
        });
        this.db = await promisify(request);
        this.root = await promisify(this.db.transaction("info").objectStore("info").get("root"));
    }

    async walk(base: IDBValidKey, names: string[]) {
        for (const name of names) {
            const req = this.db.transaction("files").objectStore("files").get(base) as IDBRequest<Entry>;
            const entry = await promisify(req);
            if (entry.type !== "dir") throw "not a directory";
            if (!(name in entry.entrys)) throw "doesn't exist";
            base = entry.entrys[name];
        }
        return base;
    }

    async makeDir(path: string) {
        const names = parse(path);
        if (names.length === 0) throw "no name specified";
        const target = names.pop()!;
        const dir = await this.walk(this.root, names);
    
        const entry = await promisify(this.db.transaction("files").objectStore("files").get(dir) as IDBRequest<Entry>);
        if (entry.type !== "dir") throw "not a directory";
        if (target in entry.entrys) throw "item already exists";

        const request = this.db.transaction("files", "readwrite").objectStore("files").add({
            type: "dir",
            entrys: {},
        });
        entry.entrys[target] = await promisify(request) as number;
        await promisify(this.db.transaction("files", "readwrite").objectStore("files").put(entry, dir));
    }

    async makeFile(path: string) {
        const names = parse(path);
        if (names.length === 0) throw "no name specified";
        const target = names.pop()!;
        const dir = await this.walk(this.root, names);

        const entry = await promisify(this.db.transaction("files").objectStore("files").get(dir) as IDBRequest<Entry>);
        if (entry.type !== "dir") throw "not a directory";
        if (target in entry.entrys) throw "item already exists";

        const request = this.db.transaction("files", "readwrite").objectStore("files").add({
            type: "file",
            contents: "",
        });
        entry.entrys[target] = await promisify(request) as number;
        await promisify(this.db.transaction("files", "readwrite").objectStore("files").put(entry, dir));
    }

    async readFile(path: string) {
        const names = parse(path);
        const target = await this.walk(this.root, names);

        const entry = await promisify(this.db.transaction("files").objectStore("files").get(target) as IDBRequest<Entry>);
        if (entry.type !== "file") throw "not a file";
        return entry.contents;
    }

    async writeFile(path: string, contents: string) {
        const names = parse(path);
        if (names.length === 0) throw "no name specified";
        const target = await this.walk(this.root, names);

        await promisify(this.db.transaction("files", "readwrite").objectStore("files").put({
            type: "file",
            contents,
        }, target));
    }

    async readDir(path: string) {
        const names = parse(path);
        const target = await this.walk(this.root, names);

        const entry = await promisify(this.db.transaction("files").objectStore("files").get(target) as IDBRequest<Entry>);
        if (entry.type !== "dir") throw "not a directory";
        return entry.entrys;
    }

    async remove(path: string) {
        const names = parse(path);
        if (names.length === 0) throw "no name specified";
        const target = names.pop()!;
        const dir = await this.walk(this.root, names);

        const entry = await promisify(this.db.transaction("files").objectStore("files").get(dir) as IDBRequest<Entry>);
        if (entry.type !== "dir") throw "not a directory";
        if (!(target in entry.entrys)) throw "item doesn't exist";

        delete entry.entrys[target];
        await promisify(this.db.transaction("files", "readwrite").objectStore("files").put(entry, dir));
        // TODO: fix memory leak
    }
}
