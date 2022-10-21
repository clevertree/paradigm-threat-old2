import React from "react";
import AssetBrowserContext from "../../context/AssetBrowserContext.js";

export default class StyleSheetAsset extends React.Component {
    render() {
        const {href} = this.props;
        if (href.endsWith('.scss'))
            return this.renderCSS();
        if (href.endsWith('.css'))
            return this.renderCSS();
        console.error("Invalid stylesheet: " + href);
    }

    renderCSS() {
        const {href} = this.props;
        // const linkTag = document.head.querySelector(`link[href='${href}']`)
        //     || document.createElement('link');
        // linkTag.setAttribute('href', href)
        // linkTag.setAttribute('rel', 'stylesheet')
        // document.head.append(linkTag);
        return <AssetBrowserContext.Consumer>
            {(assetBrowser) => {
                const refreshHash = assetBrowser.getRefreshHash();
                return <link rel='stylesheet' href={href + '?' + refreshHash} data-refresh={refreshHash}/>;
            }}
        </AssetBrowserContext.Consumer>;
    }
}

