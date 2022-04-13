let assetAsyncObj = null;
export default class AssetLoader {

    loadAssets(force = false) {
        if (assetAsyncObj && !force)
            return assetAsyncObj;
        return assetAsyncObj = loadAssets();
    }
}
async function loadAssets(force = false) {
    const assetURL = new URL(process.env.REACT_APP_ASSET_ENDPOINT, process.env.REACT_APP_ASSET_PUBLIC_URL || window.location.origin);
    const response = await fetch(assetURL + '');
    assetAsyncObj = await response.json()
    console.log("Assets loaded: ", assetAsyncObj);
    return assetAsyncObj;
}