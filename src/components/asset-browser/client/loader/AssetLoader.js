import {resolveAssetURL} from "../util/ClientUtil.js";

let assetAsyncObj = null;
export default class AssetLoader {

    loadAssets(force = false) {
        if (assetAsyncObj && !force)
            return assetAsyncObj;
        return assetAsyncObj = loadAssets();
    }
}
async function loadAssets(force = false) {
    const assetURL = resolveAssetURL(process.env.REACT_APP_ASSET_ENDPOINT);
    const response = await fetch(assetURL + '?query={assets}');
    const {data: { assets }, errors} = await response.json();
    if(errors)
        console.error(errors);
    if(!assets)
        throw new Error("Invalid asset data: " + assetURL)
    assetAsyncObj = assets;
    console.log("Assets loaded: ", assetAsyncObj);
    return assetAsyncObj;
}