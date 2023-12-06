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
export class Filesystem {
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
}
//# sourceMappingURL=filesystem.js.map