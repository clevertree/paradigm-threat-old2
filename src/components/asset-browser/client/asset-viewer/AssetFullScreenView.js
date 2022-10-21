import * as React from "react";
import PropTypes from "prop-types";
import Markdown from "markdown-to-jsx";
import "./AssetFullScreenView.scss"

export default class AssetFullScreenView extends React.Component {
    /** Property validation **/
    static propTypes = {
        src: PropTypes.string.isRequired,
        alt: PropTypes.string.isRequired,
        assetBrowser: PropTypes.object.isRequired,
        assetInstance: PropTypes.object.isRequired,
        children: PropTypes.any.isRequired,
    };

    static defaultProps = {}

    static markdownOptions = {
        wrapper: React.Fragment,

    }

    constructor(props) {
        super(props);
        this.lastDirection = 'none';

        let touchstartX = 0
        let touchendX = 0
        this.cb = {
            stopPropagation: e => e.stopPropagation(),
            renderNextAsset: e => {
                e.stopPropagation();
                this.renderNextAsset()
            },
            renderPreviousAsset: e => {
                e.stopPropagation();
                this.renderPreviousAsset()
            },
            onKeyUp: e => {
                switch (e.key) {
                    case 'Enter':
                    case 'Backspace':
                    case 'Escape':
                        this.props.assetBrowser.closeFullScreen()
                        break;
                    default:
                        break;
                    case 'ArrowRight':
                        this.renderPreviousAsset()
                        break;
                    case 'ArrowLeft':
                        this.renderNextAsset()
                        break;

                }
            },
            onTouchStart: e => {
                touchstartX = e.changedTouches[0].screenX
            },
            onTouchEnd: e => {
                touchendX = e.changedTouches[0].screenX
                if (touchendX < touchstartX)
                    this.renderNextAsset();
                else if (touchendX > touchstartX)
                    this.renderPreviousAsset();
            }
        }
    }


    render() {
        const {src, alt, assetBrowser, children} = this.props;
        return <div
            key="asset-image-fullscreen"
            className={`asset-image-fullscreen animation-${this.lastDirection}`}
            onClick={() => assetBrowser.closeFullScreen()}
            onKeyUp={this.cb.onKeyUp}
            tabIndex={1}
            onTouchStart={this.cb.onTouchStart}
            onTouchEnd={this.cb.onTouchEnd}
            ref={ref => {
                ref && ref.focus();
            }}
        >
            {children}
            {alt ? <div className={'alt-text'}>
                <Markdown onClick={this.cb.stopPropagation}
                          options={AssetFullScreenView.markdownOptions}>{alt.replace(/\\n/g, "\n")}</Markdown>
                <a onClick={this.cb.stopPropagation} href={src} className="source" target="_blank"
                   rel="noreferrer">Source File</a>
            </div> : null}
            <div className="close">&#10006;</div>
            <div className="previous" onClick={this.cb.renderPreviousAsset}>&#8656;</div>
            <div className="next" onClick={this.cb.renderNextAsset}>&#8658;</div>

        </div>
    }

    renderNextAsset() {
        this.lastDirection = 'left';
        const {assetBrowser, assetInstance} = this.props;
        const assets = assetBrowser.getRenderedAssets();
        const i = assets.indexOf(assetInstance);
        const nextAsset = assets[i + 1] || assets[0];
        // assetBrowser.closeFullScreen();
        nextAsset.openInFullScreen();
    }

    renderPreviousAsset() {
        this.lastDirection = 'right';
        const {assetBrowser, assetInstance} = this.props;
        const assets = assetBrowser.getRenderedAssets();
        const i = assets.indexOf(assetInstance);
        const lastAsset = assets[i - 1] || assets[assets.length - 1];
        // assetBrowser.closeFullScreen();
        lastAsset.openInFullScreen();
    }
}