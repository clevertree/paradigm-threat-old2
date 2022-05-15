import fs from "fs";
import path, {dirname} from "path";
import {JSDOM} from "jsdom";
import {fileURLToPath} from 'url';
import {getDirectories, getFiles} from "./server-util.js";
import {KEY_DIRS, KEY_FILES} from "../constants.js";
import getConfig from "./config.js";
import setupAPI from "./api.js";


export function setup(app) {

    let BUILD_PATH = path.resolve(process.cwd(), process.env.REACT_APP_ASSET_BUILD);
    if (!fs.existsSync(BUILD_PATH))
        throw new Error("dist folder not found: " + BUILD_PATH)
    const {assetPath} = getConfig();

    // Asset Files
    // app.use(express.static(BUILD_PATH));
    // app.use(express.static(assetPath));

    // Asset APIs
    setupAPI(app);

    app.use((req, res) => {
        const {headers: {accept}, path} = req;
        const isHTMLRequest = accept && (accept.includes('html'));
        if (isHTMLRequest && path.toLowerCase().endsWith('.md')) {
            console.log('Serving HTML for Markdown file', path, accept);
            return serveIndex(req, res);
        }
        if(tryFile(req, res))
            return;
        if (!isHTMLRequest) {
            console.log('404', path, accept);
            return res.status(404).send("");
        }
        serveIndex(req, res);
    });

    generateAssetList().then(() => {
        watchAssetList().then();
    })

    function tryFile(req, res) {
        const relativePath = decodeURI(req.path);
        let filePaths = [
            path.join(BUILD_PATH, relativePath),
            path.join(assetPath, relativePath),
            ];
        for(const filePath of filePaths) {
            if (fs.existsSync(filePath)) {
                if (!fs.lstatSync(filePath).isDirectory()) {
                   res.sendFile(filePath);
                   return true;
                }
            }
        }
        return false;
    }
    function serveIndex(req, res) {
        const BUILD_INDEX_PATH = path.resolve(BUILD_PATH, 'index.html');

        console.log('Serving Index', req.path, req.headers.accept);
        let indexHTML = fs.readFileSync(BUILD_INDEX_PATH, 'utf8');

        const pathIndexMD = path.resolve(assetPath + req.path, 'index.md');
        if (fs.existsSync(pathIndexMD)) {
            const markdownHTML = fs.readFileSync(pathIndexMD, 'utf8');

            const MarkdownDOM = new JSDOM(markdownHTML);
            const metaList = [...MarkdownDOM.window.document.head.querySelectorAll('meta, title')];

            const DOM = new JSDOM(indexHTML);
            for (let metaTag of metaList) {
                const name = (metaTag.getAttribute('name') || metaTag.getAttribute('property')) + '';
                switch (name.toLowerCase()) {
                    case 'title':
                        let title = DOM.window.document.querySelector('title') ||
                            DOM.window.document.createElement('title');
                        title.innerHTML = metaTag.getAttribute('content')
                        DOM.window.document.head.prepend(title);
                        break;
                    case 'og:image':
                        const src = metaTag.getAttribute('content');
                        if (!src.toLowerCase().startsWith('http')) {
                            const origin = process.env.REACT_APP_ASSET_PUBLIC_ORIGIN || req.headers.origin || ('http://' + req.headers.host);
                            metaTag.content = new URL(src, new URL(req.path, origin)) + '';
                        }
                        DOM.window.document.head.appendChild(metaTag);
                        break;
                    default:
                        DOM.window.document.head.appendChild(metaTag);
                        break;
                }
            }

            indexHTML = DOM.serialize();
            console.log(`${metaList.length} Meta tags updated: `, req.path, pathIndexMD);
        }
        res.send(indexHTML);
    }

}

function updateTouchFile() {
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = dirname(__filename);
    const touchFilePath = dirname(dirname(dirname(__dirname))) + '/.touch.js';
    fs.writeFileSync(touchFilePath,
        `const Touch = ${new Date().getTime()};`
        + `export default Touch;`);
    console.log('Updated touch file', touchFilePath)
}

export async function generateAssetList() {
    const {assetList, assetPath, assetMatch, resetAssets} = getConfig();
    resetAssets();
    for await (const filePath of getFiles(assetPath)) {
        let relativeFilePath = filePath.replace(assetPath, '').replace(/\\/g, '/').substring(1);
        const fileSplit = relativeFilePath.split('/');
        const fileName = fileSplit[fileSplit.length - 1].toLowerCase();
        let matched = false;
        for (const match of assetMatch) {
            if (fileName.endsWith(match))
                matched = true;
        }
        if (!matched)
            continue;

        let pointer = assetList;
        for (let i = 0; i < fileSplit.length; i++) {
            const fileFrag = fileSplit[i];
            if (i === fileSplit.length - 1) {
                pointer[KEY_FILES].push(fileFrag)
                break;
            }
            if (!pointer[KEY_DIRS])
                pointer[KEY_DIRS] = {};
            if (!pointer[KEY_DIRS][fileFrag])
                pointer[KEY_DIRS][fileFrag] = {[KEY_FILES]: []};
            pointer = pointer[KEY_DIRS][fileFrag];
        }
    }
    console.log("Asset list updated: ", JSON.stringify(assetList).length)

    updateTouchFile();
}

let watchTimeout = null;

export async function watchAssetList() {
    const {assetPath} = getConfig();
    console.log("Watching ", assetPath);

    function watch(fileDirectory) {
        // console.log("Watching ", fileDirectory);
        // eslint-disable-next-line no-loop-func
        fs.watch(fileDirectory, function (event, filename) {
            clearTimeout(watchTimeout);
            watchTimeout = setTimeout(function () {
                console.log("File updated: ", fileDirectory + '/' + filename);
                generateAssetList()
            }, 500);
        });
    }

    watch(assetPath)
    for await (const fileDirectory of getDirectories(assetPath)) {
        watch(fileDirectory)
    }

}


