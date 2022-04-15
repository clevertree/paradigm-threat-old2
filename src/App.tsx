import React from "react";
import NavWrapper from "./components/nav-wrapper/NavWrapper.js";
import AssetBrowser from "./components/asset-browser/client/AssetBrowser";

import './App.css';

/** Page Sections **/
import PageTemplate from "./pages/site/template.md";
import "./pages/site/theme/ThemeDefault.scss"

/** Register custom tags **/
import "./components/registerTags.js";

class App extends React.Component {
  render() {
    return (
        <NavWrapper>
            <AssetBrowser defaultTemplate={PageTemplate} />
        </NavWrapper>
    );
  }
}

export default App;
