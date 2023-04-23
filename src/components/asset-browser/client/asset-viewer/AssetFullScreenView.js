import * as React from "react";
import PropTypes from "prop-types";
import "./AssetFullScreenView.scss"

export default class AssetFullScreenView extends React.Component {
    /** Property validation **/
    static propTypes = {
        src: PropTypes.string.isRequired,
        // alt: PropTypes.string.isRequired,
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
                this.renderNextMediaAsset()
            },
            renderPreviousAsset: e => {
                e.stopPropagation();
                this.renderPreviousMediaAsset()
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
                        this.renderNextMediaAsset()
                        break;
                    case 'ArrowLeft':
                        this.renderPreviousMediaAsset()
                        break;

                }
            },
            onTouchStart: e => {
                touchstartX = e.changedTouches[0].screenX
            },
            onTouchEnd: e => {
                touchendX = e.changedTouches[0].screenX
                if (touchendX < touchstartX)
                    this.renderNextMediaAsset();
                else if (touchendX > touchstartX)
                    this.renderPreviousMediaAsset();
            }
        }
    }


    render() {
        const {assetBrowser, children, src} = this.props;
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
            <a onClick={this.cb.stopPropagation} href={src} className="source" target="_blank"
               rel="noreferrer">Source File: {src}</a>
            {/*{alt ? <div className={'alt-text'}>*/}
            {/*    <Markdown onClick={this.cb.stopPropagation}*/}
            {/*              options={AssetFullScreenView.markdownOptions}>{alt.replace(/\\n/g, "\n")}</Markdown>*/}
            {/*</div> : null}*/}
            <div className="close">&#10006;</div>
            <div className="previous" onClick={this.cb.renderPreviousAsset}>&#8656;</div>
            <div className="next" onClick={this.cb.renderNextAsset}>&#8658;</div>

        </div>
    }

    async renderNextMediaAsset() {
        this.lastDirection = 'left';
        const {assetBrowser, src} = this.props;
        const assets = assetBrowser.getRenderedAssets();
        const assetList = Object.keys(assets).filter(assetFile => !assetFile.toLowerCase().endsWith('.md'));
        const i = assetList.indexOf(src);
        const nextAssetSrc = assetList[i + 1] || assetList[0];
        // assetBrowser.closeFullScreen();
        await assets[nextAssetSrc].openInFullScreen();
    }

    async renderPreviousMediaAsset() {
        this.lastDirection = 'right';
        const {assetBrowser, src} = this.props;
        const assets = assetBrowser.getRenderedAssets();
        const assetList = Object.keys(assets).filter(assetFile => !assetFile.toLowerCase().endsWith('.md'));
        const i = assetList.indexOf(src);
        const lastAssetSrc = assetList[i - 1] || assetList[assetList.length - 1];
        // assetBrowser.closeFullScreen();
        await assets[lastAssetSrc].openInFullScreen();
    }
}