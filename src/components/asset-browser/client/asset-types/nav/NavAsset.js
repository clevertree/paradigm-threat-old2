import React from "react";
import PropTypes from "prop-types";
import AssetBrowserContext from "../../AssetBrowserContext.js"

export default class NavAsset extends React.Component {
    /** Property validation **/
    static propTypes = {
        src: PropTypes.string.isRequired,
    };

    render() {
        return <AssetBrowserContext.Consumer>
            {assetBrowserState => (
                <nav>
                    {this.props.children}
                    {this.renderGeneratedLinks(assetBrowserState)}
                </nav>
            )}
        </AssetBrowserContext.Consumer>
            ;
    }

    renderGeneratedLinks({iterator, pathname, loaded}) {
        let generate = this.props['data-generate-links'] || this.props['generate-links'];
        if (!generate || !loaded)
            return null;

        const fileList = iterator.listDirectories(pathname)
        return fileList.map(file => <a href={getAbsoluteURL(pathname, file)}>{file}</a>)
    }

}

function getAbsoluteURL(pathname, file) {
    if(pathname[0] === '/')
        pathname = pathname.substring(1);
    return pathname + '/' + file;
}