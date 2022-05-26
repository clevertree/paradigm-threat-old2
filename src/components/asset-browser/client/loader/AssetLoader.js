import React from "react";
import {resolveAssetURL} from "../util/ClientUtil.js";
import AssetBrowserContext from "../context/AssetBrowserContext.js";

let updateAssetsCallback = null
export default class AssetLoader extends React.Component {
    render() {
        return (
            <AssetBrowserContext.Consumer>{({updateAssets, loaded}) => {
                updateAssetsCallback = updateAssets;
                reloadAssets();
            }}
            </AssetBrowserContext.Consumer>
        );
    }
}

let assetsAsyncCall = null

async function reloadAssets() {
    if (!assetsAsyncCall)
        assetsAsyncCall = new Promise(async (resolve, reject) => {
            let timeout = 60 * 60 * 1000;
            const assetURL = resolveAssetURL(process.env.REACT_APP_ASSET_ENDPOINT);
            try {
                const response = await fetch(assetURL + '?query={assets}');
                const {data: {assets}, errors} = await response.json();
                if (errors)
                    console.error(errors);
                if (!assets)
                    throw new Error("Invalid asset data: " + assetURL);
                console.log("Assets loaded: ", assets);
                updateAssetsCallback(assets);
            } catch (error) {
                const errorMsg = <>
                    Failed to load{' '}
                    <a href={assetURL}>{assetURL}</a>
                    <br/>
                    <pre>{error.stack}</pre>
                    <div>Check to see if the server is running on port {process.env.REACT_APP_SERVER_PORT}</div>
                </>;
                console.error(error);
                timeout = 60 * 1000;
                updateAssetsCallback(null, errorMsg);
            }
            setTimeout(() => {
                assetsAsyncCall = null;
                console.log("Refreshing assets");
                reloadAssets();
            }, timeout);
            resolve();
        });
    return await assetsAsyncCall;
}

AssetLoader.reloadAssets = reloadAssets;