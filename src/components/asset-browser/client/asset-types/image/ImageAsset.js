import React from "react";
import PropTypes from "prop-types";

import {getMarkdownOptions} from "../markdown/markdownOptions.js";
import AssetBrowserContext from "../../context/AssetBrowserContext.js";


class ImageAsset extends React.Component {
    static ASSET_CLASS = 'asset image';
    /** Property validation **/
    static propTypes = {
        src: PropTypes.string.isRequired,
        assetBrowser: PropTypes.object.isRequired
        // i: PropTypes.number
    };


    constructor(props) {
        super(props);

        this.state = {
            originalRefreshHash: this.props.assetBrowser.refreshHash
        }
        const markdownOptions = getMarkdownOptions();
        this.options = {
            ...markdownOptions,
            wrapper: 'div',
            forceWrapper: true,
            overrides: props.overrides,
        }
        this.cb = {
            onClick: e => {
                this.renderFullScreenAsset();
            },
            onPopState: e => {
                this.checkForFullScreenHash();
            }
        }
    }

    componentDidMount() {
        window.addEventListener('popstate', this.cb.onPopState);
        this.checkForFullScreenHash();
    }

    componentWillUnmount() {
        window.removeEventListener('popstate', this.cb.onPopState);
    }

    checkForFullScreenHash() {
        const {src, originalSrc} = this.props;
        const {searchParams} = (new URL(document.location));
        const viewAsset = searchParams.get('viewAsset');
        if (viewAsset) {
            if (src === viewAsset || originalSrc === viewAsset) {
                console.log(src);
                this.renderFullScreenAsset();
            }
        }

        // const assetSrc = window.history?.state?.viewAssetFullscreen;
        // if (search.startsWith('?viewAsset=')) {
        // }

    }

    renderFullScreenAsset() {
        let {title, src, originalSrc, assetBrowser, alt} = this.props;
        const shortSrc = originalSrc || src;
        alt = alt || src.split('/').pop();
        const altSL = alt.replace(/\n/g, " ")
        title = title || altSL;
        const fullscreenContent = <img
            key="fullscreen-image"
            className="fullscreen-image"
            src={src}
            alt={alt}
            title={title || altSL}
        />
        assetBrowser.showFullScreenAsset(fullscreenContent, shortSrc, alt);
    }

    render() {
        let {src, alt, title, className, assetBrowser, originalSrc, ...extraProps} = this.props;
        const {refreshHash} = assetBrowser;

        alt = alt || src.split('/').pop();
        const altSL = alt.replace(/\n/g, " ")
        title = title || altSL;
        className = ImageAsset.ASSET_CLASS + (className ? ' ' + className : '')
        let finalSrc = src;
        if (refreshHash && refreshHash !== this.state.originalRefreshHash)
            finalSrc += '?refreshHash=' + refreshHash;
        return <img
            {...extraProps}
            key="image"
            className={className}
            src={finalSrc}
            alt={alt}
            title={title || altSL}
            onClick={this.cb.onClick}
        />

    }

}


export default class ImageAssetWrapper extends React.Component {
    render() {
        return <AssetBrowserContext.Consumer>
            {(assetBrowser) => {
                return <ImageAsset {...this.props} assetBrowser={assetBrowser}>
                    {this.props.children}
                </ImageAsset>;
            }}
        </AssetBrowserContext.Consumer>;
    }
}