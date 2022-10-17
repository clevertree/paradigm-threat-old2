import React from "react";
import PropTypes from "prop-types";

import "./ImageAsset.scss";
import Markdown from "markdown-to-jsx";
import {getMarkdownOptions} from "../markdown/markdownOptions.js";
import AssetBrowserContext from "../../context/AssetBrowserContext.js";

class ImageAsset extends React.Component {
    static ASSET_CLASS = 'asset image';
    /** Property validation **/
    static propTypes = {
        src: PropTypes.string.isRequired,
        i: PropTypes.number
    };


    constructor(props) {
        super(props);

        this.state = {
            fullscreen: false,
            originalRefreshHash: this.props.refreshHash
        }
        const markdownOptions = getMarkdownOptions();
        this.options = {
            ...markdownOptions,
            wrapper: 'div',
            forceWrapper: true,
            overrides: props.overrides,
        }
        this.cb = {
            onClick: e => this.onClick(e),
            closeFullscreen: e => this.closeFullscreen(e),
            stopPropagation: e => e.stopPropagation()
        }
    }

    render() {
        let {src, alt, title, className, refreshHash, ...extraProps} = this.props;

        alt = alt || src.split('/').pop();
        const altSL = alt.replace(/\n/g, " ")
        title = title || altSL;
        className = ImageAsset.ASSET_CLASS + (className ? ' ' + className : '')
        let finalSrc = src;
        if (refreshHash && refreshHash !== this.state.originalRefreshHash)
            finalSrc += '?refreshHash=' + refreshHash;
        return [
            <img
                {...extraProps}
                key="image"
                className={className}
                src={finalSrc}
                alt={alt}
                title={title || altSL}
                onClick={this.cb.onClick}
            />,
            this.state.fullscreen ? <div
                key="asset-image-fullscreen"
                className="asset-image-fullscreen"
                onClick={this.cb.onClick}
            >
                <img
                    {...extraProps}
                    src={finalSrc}
                    alt={alt}
                />
                {alt ? <div className={'alt-text'}>
                    <Markdown onClick={this.cb.stopPropagation}
                              options={this.options}>{alt.replace(/\\n/g, "\n")}</Markdown>
                    <a onClick={this.cb.stopPropagation} href={finalSrc} className="source" target="_blank"
                       rel="noreferrer">Source
                        File</a>
                </div> : null}
                <div className="close">&#10006;</div>
            </div> : null
        ];
    }


    onClick(e) {
        if (this.props['data-no-fullscreen'])
            return;
        // if (e.target.nodeName.toLowerCase() === 'a')
        //     return;
        // if (this.props.href) {
        //     let url = new URL(this.props.href);
        //     console.log(url, document.location.origin);
        //     if (url.origin === document.location.origin) {
        //         document.location.href = url+'';
        //     } else {
        //         window.open(url, "_blank");
        //     }
        // } else {
        const fullscreen = !this.state.fullscreen;
        activeImages.forEach(activeImage => activeImage.closeFullscreen());
        if (fullscreen) {
            activeImages = [this];
            this.setState({fullscreen});
        }
        // console.log('activeImages', activeImages, fullscreen);
        // }
    }

    closeFullscreen() {
        this.setState({fullscreen: false})
    }
}


let activeImages = [];


export default class ImageAssetWrapper extends React.Component {
    render() {
        return <AssetBrowserContext.Consumer>
            {({refreshHash}) => {
                return <ImageAsset {...this.props} refreshHash={refreshHash}>
                    {this.props.children}
                </ImageAsset>;
            }}
        </AssetBrowserContext.Consumer>;
    }
}