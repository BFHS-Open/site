export type Dir = {
    type: "dir",
    entrys: Record<string, number>,
}
export type File = {
    type: "file",
    contents: string,
}
export type Entry = Dir | File;
