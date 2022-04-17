import React from "react";


/** Dev Update **/
import touchValue from "../../server/touch.js"
import AssetBrowserContext from "../context/AssetBrowserContext.js";
let lastTouch, timeout;
export default class AssetRefresher extends React.Component {
    render() {
        return <AssetBrowserContext.Consumer>
            {({browser}) => {
                if(browser && lastTouch !== touchValue) {
                    lastTouch = touchValue;
                    clearTimeout(timeout);
                    timeout = setTimeout(() => browser.updateRefreshHash(touchValue), 200);
                }
            }}
        </AssetBrowserContext.Consumer>;
    }
}
