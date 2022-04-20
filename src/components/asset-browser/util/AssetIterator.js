import {KEY_FILES, KEY_DIRS} from "../constants.js";
import {resolveAssetURL} from "../client/util/ClientUtil.js";


export default class AssetIterator {
    constructor(assets) {
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
        if(!pointer[KEY_DIRS])
            return [];
        return Object.keys(pointer[KEY_DIRS]);
    }


    getPointer(path) {
        if(path[0] === '/') path = path.substring(1);
        const pathSplit = path.split('/');
        let pointer = this.assets;
        for(let pathFrag of pathSplit) {
            if(!pathFrag)
                continue;
            if(!pointer[KEY_DIRS] || !pointer[KEY_DIRS][pathFrag])
                throw new Error(`Path fragment not found: ${pathFrag} path=${path}`);

            pointer = pointer[KEY_DIRS][pathFrag]
        }

        return pointer;
    }
}