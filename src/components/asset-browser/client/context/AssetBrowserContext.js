import React from "react";

const AssetBrowserContext = React.createContext({
    browser: null,
    loaded: false,
    iterator: null,
    assets: null,
    refreshHash: null
});
export default AssetBrowserContext;