import {KEY_DIRS, KEY_FILES} from "../constants.js";
import {resolveAssetURL} from "../client/util/ClientUtil.js";


export default class AssetIterator {
    constructor(assets) {
        if (!assets)
            throw new Error("Invalid assets")
        this.assets = assets;
    }

    pathExists(path) {
        return !!this.getPointer(path, false);
    }

    listFiles(path) {
        if (path[0] === '/')
            path = path.substring(1);
        const pointer = this.getPointer(path);
        return pointer[KEY_FILES].map(file => resolveAssetURL(path + '/' + file));
    }

    listDirectories(path, orThrow = true) {
        const pointer = this.getPointer(path, orThrow);
        if (!pointer || !pointer[KEY_DIRS])
            return [];
        return Object.keys(pointer[KEY_DIRS]);
    }


    getPointer(directoryPath, orThrow = true) {
        if (directoryPath[0] === '/') directoryPath = directoryPath.substring(1);
        const pathSplit = directoryPath.split('/');
        let pointer = this.assets;
        for (let pathFrag of pathSplit) {
            if (!pathFrag)
                continue;
            if (!pointer || !pointer[KEY_DIRS] || !pointer[KEY_DIRS][pathFrag]) {
                if (orThrow)
                    throw new Error(`Path not found: ${directoryPath}`);
                return null;
            }
            pointer = pointer[KEY_DIRS][pathFrag]
        }

        return pointer;
    }

    tryFile(filepath) {
        const directoryPath = filepath.substring(0, filepath.lastIndexOf("/") + 1);
        const filename = filepath.split('/').pop();
        const pointer = this.getPointer(directoryPath, false);
        if (!pointer)
            return null;

        if (pointer[KEY_FILES].indexOf(filename) !== -1)
            return filepath;
        return null;
    }

    searchByKeywords(keywords) {
        keywords = keywords.map(keyword => keyword.toLowerCase())
        const fileList = [];
        search(this.assets, '');
        return fileList;

        function search(pointer, directoryPath) {
            const lcDirectoryPath = directoryPath.toLowerCase()
            for (const file of pointer[KEY_FILES]) {
                const assetURL = resolveAssetURL(directoryPath + '/' + file);

                const lcFile = file.toLowerCase();
                if (lcFile.endsWith('.md'))
                    continue;
                for (const keyword of keywords) {
                    if (lcDirectoryPath.includes(keyword) || lcFile.includes(keyword)) {
                        fileList.push(assetURL)
                        break;
                    }
                }
            }
            if (pointer[KEY_DIRS]) {
                for (const subDirectory of Object.keys(pointer[KEY_DIRS])) {
                    const subPointer = pointer[KEY_DIRS][subDirectory]
                    search(subPointer, directoryPath + '/' + subDirectory)
                }
            }
        }
    }

    searchByFile(filter) {
        const fileList = [];
        search(this.assets, '');
        return fileList;

        function search(pointer, directoryPath) {
            for (const file of pointer[KEY_FILES]) {
                const assetURL = directoryPath + '/' + file;

                if (typeof filter === 'function' ? filter(file) : file.includes(filter))
                    fileList.push(assetURL)
            }
            if (pointer[KEY_DIRS]) {
                for (const subDirectory of Object.keys(pointer[KEY_DIRS])) {
                    const subPointer = pointer[KEY_DIRS][subDirectory]
                    search(subPointer, directoryPath + '/' + subDirectory)
                }
            }
        }
    }
}