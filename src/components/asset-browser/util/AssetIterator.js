import {KEY_FILES, KEY_DIRS} from "../constants.js";


export default class AssetIterator {
    constructor(assets) {
        this.assets = assets;
    }

    listFiles(path) {
        const pointer = this.getPointer(path);
        return pointer[KEY_FILES];
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
            if(!pointer[KEY_DIRS][pathFrag]) {
                console.error("Path fragment not found: ", pathFrag, pointer[KEY_DIRS], path);
                return null;
            }

            pointer = pointer[KEY_DIRS][pathFrag]
        }

        return pointer;
    }
}