import {resolveAssetURL} from "../util/ClientUtil.js";

let assetAsyncObj = loadAssets();
export default class AssetLoader {
    async loadAssets(force = false) {
        if (force)
            assetAsyncObj = loadAssets(force);
        return assetAsyncObj;
    }
}

async function loadAssets(force = false) {
    const assetURL = resolveAssetURL(process.env.REACT_APP_ASSET_ENDPOINT);
    const response = await fetch(assetURL + '?query={assets}');
    const {data: {assets}, errors} = await response.json();
    if (errors)
        console.error(errors);
    if (!assets)
        throw new Error("Invalid asset data: " + assetURL)
    assetAsyncObj = assets;
    // console.log("Assets loaded: ", assetAsyncObj, force);
    return assetAsyncObj;
}

setInterval(async () => {
    const assets = await loadAssets(true)
    console.log("Assets refreshed: ", assets);
}, 60 * 60 * 1000)
