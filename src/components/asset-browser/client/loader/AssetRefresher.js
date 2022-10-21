import React from "react";


/** Dev Update **/
import touchValue from "../../../../.touch.js"
import AssetBrowserContext from "../context/AssetBrowserContext.js";

let lastTouch, timeout;
export default class AssetRefresher extends React.Component {
    render() {
        return <AssetBrowserContext.Consumer>
            {(assetBrowser) => {
                if (lastTouch !== touchValue) {

                    lastTouch = touchValue;
                    clearTimeout(timeout);
                    timeout = setTimeout(() => assetBrowser.updateRefreshHash(touchValue), 200);
                }
            }}
        </AssetBrowserContext.Consumer>;
    }
}
