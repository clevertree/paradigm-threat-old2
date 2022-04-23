import React from "react";
import NavWrapper from "./components/nav-wrapper/NavWrapper.js";
import AssetBrowser from "./components/asset-browser/client/AssetBrowser";

import './App.css';

/** Register custom tags **/
import "./components/registerTags.js";

class App extends React.Component {
  render() {
    return (
        <NavWrapper>
            <AssetBrowser />
        </NavWrapper>
    );
  }
}

export default App;
