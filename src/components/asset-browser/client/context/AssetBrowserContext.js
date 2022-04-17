import React from "react";

const AssetBrowserContext = React.createContext({browser: null, loaded: false, refreshHash: null});
export default AssetBrowserContext;