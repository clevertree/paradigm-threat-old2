import React from "react";
import {BrowserRouter} from "react-router-dom";
import NavWrapper from "./components/nav/NavWrapper";
import AssetBrowser from "./components/asset-browser/client/AssetBrowser";

import './App.css';

/** Page Sections **/
import PageTemplate from "./pages/site/template.md";

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
