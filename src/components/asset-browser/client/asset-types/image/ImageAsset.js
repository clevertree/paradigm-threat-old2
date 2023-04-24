import React, {useContext} from "react";
import PropTypes from "prop-types";

import AssetBrowserContext from "../../context/AssetBrowserContext.js";
import ErrorBoundary from "../../error/ErrorBoundary.js";
import Markdown from "markdown-to-jsx";
import "./ImageAsset.scss"
import MarkdownAsset from "../markdown/MarkdownAsset.js"
import {resolveAssetPath} from "../../util/ClientUtil.js";

class ImageAsset extends React.Component {
    static ASSET_CLASS = 'asset image';
    /** Property validation **/
    static propTypes = {
        src: PropTypes.string,
        assetBrowser: PropTypes.object.isRequired
        // i: PropTypes.number
    };


    constructor(props) {
        super(props);

        this.state = {
            originalRefreshHash: this.props.assetBrowser.refreshHash,
            caption: null
        }
        this.ref = {
            img: React.createRef()
        }
        this.cb = {
            onClick: e => {
                if (this.isAsset()) {
                    this.openInFullScreen();
                }
            },
            // onPopState: e => {
            //     this.checkForFullScreenHash();
            // }
        }
    }

    getAltString() {
        let {src, alt} = this.props;
        return alt || resolveAssetPath(src).replace(/\.[^./]*$/, '').replace(/[_/-]+/g, ' ').trim();
    }

    getTitleString() {
        let {title} = this.props;
        return title || this.getAltString();
    }

    isAsset() {
        return (!['false', false].includes(this.props['asset']));
    }

    componentDidMount() {
        let {assetBrowser, src} = this.props;
        if (assetBrowser && this.isAsset()) {
            assetBrowser.addRenderedAsset(src, this);
            // this.checkForMDCaption(assetBrowser).then();
        }
    }

    componentWillUnmount() {
        let {assetBrowser, src} = this.props;
        if (assetBrowser && this.isAsset()) {
            assetBrowser.removeRenderedAsset(src);
        }
    }

    async openInFullScreen() {
        let {assetBrowser, src} = this.props;
        assetBrowser.showFullScreenAsset(this, this.render(false), src, this.getAltString());
        setTimeout(() => {
            this.ref.img.current.scrollIntoView({block: "start", behavior: 'smooth'})
        }, 500)
    }

    render(local = true) {
        let {src, caption, className, assetBrowser, originalSrc, asset, ...extraProps} = this.props;
        className = ImageAsset.ASSET_CLASS + (className && local ? ' ' + className : '')

        const contentImage = <img
            key={src}
            alt={this.getAltString()}
            title={this.getTitleString()}
            src={src}
            onClick={this.cb.onClick}
            ref={local ? this.ref.img : null}
            {...extraProps}
        />

        if (['false', false].includes(asset)) {
            return contentImage;
        }

        const captionMDPath = assetBrowser.getMDCaptionPath(src);

        const mdProps = {
            options: {
                wrapper: 'div',
                forceWrapper: true
            }
        }

        return <div
            key={src}
            className={className}
        >
            {contentImage}
            <div className="text-container">
                {captionMDPath
                    ? <MarkdownAsset src={captionMDPath} {...mdProps}/>
                    : (caption && <Markdown {...mdProps}>
                        {caption.replace(/\\n/g, "\n")}
                    </Markdown>)}
            </div>
        </div>

    }

}


export default function ImageAssetWrapper(props) {
    const assetBrowser = useContext(AssetBrowserContext)
    return <ErrorBoundary assetName="Image Asset">
        <ImageAsset {...props} assetBrowser={assetBrowser}/>
    </ErrorBoundary>;
}