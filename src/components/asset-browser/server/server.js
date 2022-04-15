import fs from "fs";
import path from "path";
import express from "express";
import {JSDOM} from "jsdom";
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import {getDirectories, getFiles} from "./server-util.js";
import {KEY_FILES, KEY_DIRS} from "../constants.js";

const assetList = {
    [KEY_FILES]: [],
    [KEY_DIRS]: {},
};

function handleAPI(req, res) {
    res.json(assetList);
}

export function setup(app, BUILD_PATH) {
    const { assetPath } = getConfig();
    const BUILD_INDEX_PATH = path.resolve(BUILD_PATH, 'index.html');

    app.use(express.static(BUILD_PATH));
    app.use(express.static(assetPath));
    app.all(process.env.REACT_APP_ASSET_ENDPOINT, handleAPI);

    app.use((req, res) => {
        console.log('404', req.path);
        let indexHTML = fs.readFileSync(BUILD_INDEX_PATH, 'utf8');

        const pathIndexMD = path.resolve(assetPath + req.path, 'index.md');
        if(fs.existsSync(pathIndexMD)) {
            const markdownHTML = fs.readFileSync(pathIndexMD, 'utf8');

            const MDDOM = new JSDOM(markdownHTML);
            const metaList = MDDOM.window.document.head.querySelectorAll('meta, title');

            const DOM = new JSDOM(indexHTML);
            for(let metaTag of metaList) {
                if((metaTag.getAttribute('name')||'').toLowerCase() === 'title') {
                    let title = DOM.window.document.querySelector('title') ||
                        DOM.window.document.createElement('title');
                    title.innerHTML = metaTag.getAttribute('content')
                    DOM.window.document.head.prepend(title);
                }
                DOM.window.document.head.appendChild(metaTag);
            }

            indexHTML = DOM.serialize();
            console.log('Meta tags updated: ', req.path, pathIndexMD);
        }
        res.send(indexHTML);
    });

    generateAssetList().then(() => {
        watchAssetList().then();
    })


}


function updateTouchFile() {
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = dirname(__filename);
    const touchFilePath = __dirname + '/touch.js';
    fs.writeFileSync(touchFilePath,
    `const Touch = ${new Date().getTime()};`
    + `export default Touch;`);
    console.log('Updated touch file', touchFilePath)
}

export async function generateAssetList() {
    const { assetPath, assetMatch } = getConfig();
    assetList[KEY_FILES] = [];
    assetList[KEY_DIRS] = {};
    for await (const filePath of getFiles(assetPath)) {
        let relativeFilePath = filePath.replace(assetPath, '').replace(/\\/g, '/').substring(1);
        const fileSplit = relativeFilePath.split('/');
        const fileName = fileSplit[fileSplit.length-1].toLowerCase();
        let matched = false;
        for(const match of assetMatch) {
            if(fileName.endsWith(match))
                matched = true;
        }
        if(!matched)
            continue;

        let pointer = assetList;
        for(let i=0; i<fileSplit.length; i++) {
            const fileFrag = fileSplit[i];
            if(i === fileSplit.length - 1) {
                pointer[KEY_FILES].push(fileFrag)
                break;
            }
            if(!pointer[KEY_DIRS])
                pointer[KEY_DIRS] = {};
            if(!pointer[KEY_DIRS][fileFrag])
                pointer[KEY_DIRS][fileFrag] = {[KEY_FILES]:[]};
            pointer = pointer[KEY_DIRS][fileFrag];
        }
    }
    console.log("Asset list updated: ", JSON.stringify(assetList).length)

    updateTouchFile();
}

let watchTimeout = null;
export async function watchAssetList() {
    const { assetPath } = getConfig();
    console.log("Watching ", assetPath);

    for await (const fileDirectory of getDirectories(assetPath)) {
        // console.log("Watching ", fileDirectory);
        // eslint-disable-next-line no-loop-func
        fs.watch(fileDirectory,function (event, filename) {
            clearTimeout(watchTimeout);
            watchTimeout = setTimeout(function() {
                console.log("File updated: ", fileDirectory + '/' + filename);
                generateAssetList()
            }, 500);
        });
    }

}

export function getConfig() {
    let {
        REACT_APP_ASSET_PATH: assetPath,
        REACT_APP_ASSET_URL: assetURL,
        REACT_APP_ASSET_IGNORE: assetIgnore,
        REACT_APP_ASSET_MATCH: assetMatch
    } = process.env;
    assetPath = path.resolve(process.cwd(), assetPath);
    assetIgnore = assetIgnore.split(';');
    assetMatch = assetMatch.split(';');

    return {assetPath, assetURL, assetIgnore, assetMatch};
}


