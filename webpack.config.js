import url from "url";
import path from "path";
import process from "process";

process.chdir(path.dirname(url.fileURLToPath(import.meta.url)));

/** @type {import("webpack").Configuration} */
export default {
    mode: "development",
    entry: path.resolve("./js/main.tsx"),
    devtool: "inline-source-map",
    resolve: {
        extensions: [".tsx", ".ts", "..."],
        alias: {
            "root": path.resolve("./js"),
        },
    },
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                loader: "ts-loader",
                options: {
                    compilerOptions: {
                        noEmit: false,
                    },
                },
            },
        ],
    },
    output: {
        filename: "bundle.js",
        path: path.resolve("./build/"),
    },
    watch: true,
};
