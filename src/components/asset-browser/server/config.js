import path from "path";
import {KEY_DIRS, KEY_FILES} from "../constants.js";

const assetList = {
    [KEY_FILES]: [],
    [KEY_DIRS]: {},
};


export default function getConfig() {
    let {
        REACT_APP_ASSET_PATH: assetPath,
        REACT_APP_ASSET_URL: assetURL,
        REACT_APP_ASSET_IGNORE: assetIgnore,
        REACT_APP_ASSET_MATCH: assetMatch
    } = process.env;
    assetPath = path.resolve(process.cwd(), assetPath);
    assetIgnore = assetIgnore.split(';');
    assetMatch = assetMatch.split(';');

    return {assetList, assetPath, assetURL, assetIgnore, assetMatch};
}