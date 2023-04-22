import {
    KEY_DIRS,
    KEY_FILES,
} from "../constants.js";
import {resolveAssetURL} from "../client/util/ClientUtil.js";


export default class AssetIterator {
    constructor(assets) {
        if (!assets)
            throw new Error("Invalid assets")
        this.assets = assets;
    }

    getAssetStats() {
        const associatedMDFiles = {};
        const stats = {
            associatedMDFiles
        };
        const process = (path, pointer) => {
            const files = pointer[KEY_FILES] || [];
            const dirs = pointer[KEY_DIRS] || [];
            for (let mdFilePos = 0; mdFilePos < files.length; mdFilePos++) {
                const mdFile = files[mdFilePos];
                const mdFileLC = mdFile.toLowerCase();
                if (mdFileLC.endsWith('.md')) {
                    const mdFileLCNE = mdFileLC.substring(0, mdFileLC.length - 2);
                    for (let assetFilePos = 0; assetFilePos < files.length; assetFilePos++) {
                        const assetFile = files[assetFilePos];
                        const assetFileLC = assetFile.toLowerCase();
                        if (assetFileLC.startsWith(mdFileLCNE) && !assetFileLC.endsWith('.md')) {
                            associatedMDFiles[`${path}/${assetFile}`] = `${path}/${mdFile}`;
                        }
                    }
                }
            }
            for (const dirPath of Object.keys(dirs)) {
                process(`${path}/${dirPath}`, dirs[dirPath])
            }
        }
        process('', this.assets);
        console.log('stats', stats);
        return stats;
    }

    pathExists(path) {
        return !!this.getPointer(path, false);
    }

    fileExists(path) {
        const pathSplit = path.split('/');
        const fileName = pathSplit.pop();
        const directoryPath = pathSplit.join('/');
        const pointer = this.getPointer(directoryPath, false);
        if (!pointer)
            return false;
        return pointer[KEY_FILES].includes(fileName);
    }

    listFiles(path, orThrow = true) {
        if (path[0] === '/')
            path = path.substring(1);
        const pointer = this.getPointer(path, orThrow);
        if (!pointer[KEY_FILES])
            return [];
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
        keywords = keywords.filter(k => k)
            .map(keyword => new RegExp(keyword, "i"));
        const fileList = [];
        search(this.assets, '');
        return fileList;

        function search(pointer, directoryPath) {
            // const lcDirectoryPath = directoryPath.toLowerCase()
            for (const file of pointer[KEY_FILES]) {
                const assetURL = resolveAssetURL(directoryPath + '/' + file);
                const formattedFileName = file.replace(/[_-]+/g, ' ');
                let notFound = false;
                for (const keyword of keywords) {
                    if (!keyword.test(directoryPath) && !keyword.test(formattedFileName)) {
                        notFound = true;
                        break;
                    }
                }
                if (notFound)
                    continue;
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

    searchByFile(filter) {
        const fileList = [];
        search(this.assets, '');
        return fileList;

        function search(pointer, directoryPath) {
            for (const file of pointer[KEY_FILES]) {
                const assetURL = directoryPath + '/' + file;

                if (typeof filter === 'function' ? filter(file) : file.includes(filter)) {
                    fileList.push(assetURL)
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

}