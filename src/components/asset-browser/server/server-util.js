import {resolve} from "path";
import {getConfig} from "./server.js";
import fs from "fs";
const { readdir } = fs.promises;

export async function* getFiles(dir) {
    const {assetIgnore} = getConfig();
    const dirents = await readdir(dir, {withFileTypes: true});
    for (const dirent of dirents) {
        const res = resolve(dir, dirent.name);
        if (dirent.isDirectory()) {
            if (assetIgnore.indexOf(dirent.name) === -1) {
                yield* getFiles(res);
            }
        } else {
            yield res;
        }
    }
}


export async function* getDirectories(dir) {
    const {assetIgnore} = getConfig();
    const dirents = await readdir(dir, { withFileTypes: true });
    for (const dirent of dirents) {
        const res = resolve(dir, dirent.name);
        if (dirent.isDirectory()) {
            if(assetIgnore.indexOf(dirent.name) === -1) {
                yield res;
                yield* getDirectories(res);
            }
        }
    }
}