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
        this.ref = {
            img: React.createRef()
        }
        this.cb = {
            onClick: e => {
                if (!this.props['data-no-fullscreen']) {
                    this.openInFullScreen();
                }
            },
            // onPopState: e => {
            //     this.checkForFullScreenHash();
            // }
        }
    }


    componentDidMount() {
        let {assetBrowser} = this.props;
        assetBrowser.addRenderedAsset(this);
    }

    componentWillUnmount() {
        let {assetBrowser} = this.props;
        assetBrowser.removeRenderedAsset(this);
    }

    checkForFullScreenHash(matchSrc) {
        const {src, originalSrc} = this.props;
        if (src === matchSrc || originalSrc === matchSrc) {
            this.openInFullScreen();
            return true;
        }
        return false;
    }

    openInFullScreen() {
        let {title, src, assetBrowser, alt} = this.props;
        alt = alt || src.split('/').pop();
        const altSL = alt.replace(/\n/g, " ")
        title = title || altSL;
        const fullscreenContent = <img
            key={src}
            className="fullscreen-image"
            src={src}
            alt={alt}
            title={title || altSL}
        />
        assetBrowser.showFullScreenAsset(this, fullscreenContent, src, alt);
        this.ref.img.current.scrollIntoView({block: "start", behavior: 'smooth'})
    }

    render() {
        let {src, alt, title, className, assetBrowser, originalSrc, ...extraProps} = this.props;
        const refreshHash = assetBrowser.getRefreshHash();

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
            ref={this.ref.img}
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