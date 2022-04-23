import {KEY_DIRS, KEY_FILES} from "../constants.js";
import {resolveAssetURL} from "../client/util/ClientUtil.js";


export default class AssetIterator {
    constructor(assets) {
        if (!assets)
            throw new Error("Invalid assets")
        this.assets = assets;
    }

    listFiles(path) {
        if (path[0] === '/')
            path = path.substring(1);
        const pointer = this.getPointer(path);
        return pointer[KEY_FILES].map(file => resolveAssetURL(path + '/' + file));
    }

    listDirectories(path) {
        const pointer = this.getPointer(path);
        if (!pointer[KEY_DIRS])
            return [];
        return Object.keys(pointer[KEY_DIRS]);
    }


    getPointer(path, orThrow = true) {
        if (path[0] === '/') path = path.substring(1);
        const pathSplit = path.split('/');
        let pointer = this.assets;
        for (let pathFrag of pathSplit) {
            if (!pathFrag)
                continue;
            if (!pointer || !pointer[KEY_DIRS] || !pointer[KEY_DIRS][pathFrag]) {
                if (orThrow)
                    throw new Error(`Path fragment not found: ${pathFrag} path=${path}`);
                return null;
            }
            pointer = pointer[KEY_DIRS][pathFrag]
        }

        return pointer;
    }

    tryFile(filepath) {
        const dir = filepath.substring(0, filepath.lastIndexOf("/") + 1);
        const filename = filepath.split('/').pop();
        const pointer = this.getPointer(dir, false);
        if (!pointer)
            return null;

        if (pointer[KEY_FILES].indexOf(filename) !== -1)
            return filepath;
        return null;
    }
}