import React from "react";


/** Dev Update **/
import touchValue from "../../../../.touch.js"
import AssetBrowserContext from "../context/AssetBrowserContext.js";

let lastTouch, timeout;
export default class AssetRefresher extends React.Component {
    render() {
        return <AssetBrowserContext.Consumer>
            {({updateRefreshHash}) => {
                if (lastTouch !== touchValue) {
                    lastTouch = touchValue;
                    clearTimeout(timeout);
                    timeout = setTimeout(() => updateRefreshHash(touchValue), 200);
                }
            }}
        </AssetBrowserContext.Consumer>;
    }
}
