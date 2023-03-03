import React from "react";
import PropTypes from "prop-types";

import {getMarkdownOptions} from "../markdown/markdownOptions.js";
import AssetBrowserContext from "../../context/AssetBrowserContext.js";
import ErrorBoundary from "../../error/ErrorBoundary.js";
import Markdown, {compiler} from "markdown-to-jsx";


class ImageAsset extends React.Component {
    static ASSET_CLASS = 'asset image';
    /** Property validation **/
    static propTypes = {
        src: PropTypes.oneOfType([
            PropTypes.string,
            PropTypes.bool
        ]).isRequired,
        assetBrowser: PropTypes.object.isRequired
        // i: PropTypes.number
    };


    constructor(props) {
        super(props);

        this.state = {
            originalRefreshHash: this.props.assetBrowser.refreshHash,
            altContent: null
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
        this.loadAltSource().then();
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

    async openInFullScreen() {
        let {title, src, assetBrowser} = this.props;
        const altContent = (await this.loadAltSource()) || this.getAltContent();
        const altString = stripMarkup(altContent)
        const fullscreenContent = <img
            key={src}
            className="fullscreen-image"
            src={src}
            alt={altString}
            title={title || altString.replace(/\n/g, " ")}
        />
        assetBrowser.showFullScreenAsset(this, fullscreenContent, src, altContent);
        this.ref.img.current.scrollIntoView({block: "start", behavior: 'smooth'})
    }

    getAltContent() {
        const {altContent} = this.state;
        if (typeof altContent === "string")
            return altContent;
        let {alt, src} = this.props;
        if (typeof alt !== "string" || !alt)
            return src.split('/').pop();
        return alt;
    }

    render() {
        let {src, alt, title, className, assetBrowser, originalSrc, ...extraProps} = this.props;
        const refreshHash = assetBrowser.getRefreshHash();

        const altContent = this.getAltContent();
        className = ImageAsset.ASSET_CLASS + (className ? ' ' + className : '')
        let finalSrc = src;
        if (refreshHash && refreshHash !== this.state.originalRefreshHash)
            finalSrc += '?refreshHash=' + refreshHash;

        const altString = stripMarkup(altContent)

        return <img
            {...extraProps}
            key="image"
            className={className}
            src={finalSrc}
            alt={altString}
            title={title || altString.replace(/\n/g, " ")}
            onClick={this.cb.onClick}
            ref={this.ref.img}
        />

    }

    async loadAltSource() {
        let {src, alt} = this.props;
        let {altContent} = this.state;
        if (!altContent) {
            if (alt === true) {
                let pos = src.lastIndexOf(".");
                const altSrc = src.substring(0, pos < 0 ? src.length : pos) + ".md";
                altContent = new Promise(async (resolve, reject) => {
                    const response = await fetch(altSrc);
                    const altContent = await response.text()
                    this.setState({altContent})
                    resolve();
                })
                this.setState({altContent})
            }
        }
        return altContent;
    }
}


function stripMarkup(markdownContent) {
    const contentList = compiler(markdownContent, {wrapper: null});

    function strip(contentList) {
        let string = '';
        for (const content of contentList) {
            let contentString = content;
            if (typeof content !== "string") {
                if (typeof content !== "object" || !content.props.children)
                    throw new Error("Invalid object");
                contentString = strip(content.props.children)
            }
            string += (string ? " " : "") + contentString.trim();
        }
        return string.trim();
    }

    return strip(contentList);
}


export default class ImageAssetWrapper extends React.Component {
    render() {
        return <ErrorBoundary>
            <AssetBrowserContext.Consumer>
                {(assetBrowser) => {
                    return <ImageAsset {...this.props} assetBrowser={assetBrowser}>
                        {this.props.children}
                    </ImageAsset>;
                }}
            </AssetBrowserContext.Consumer>
        </ErrorBoundary>;
    }
}