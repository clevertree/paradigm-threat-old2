import React from "react";
import PropTypes from "prop-types";

import "./VideoAsset.scss";
import ErrorBoundary from "../../error/ErrorBoundary.js";
import {resolveAssetPath} from "../../util/ClientUtil.js";

export default class VideoAsset extends React.Component {
    static ASSET_CLASS = 'asset video';
    /** Property validation **/
    static propTypes = {
        src: PropTypes.string.isRequired,
    };

    // constructor(props) {
    //     super(props);
    // }

    render() {
        if (this.parseYoutubeURL(this.props.src))
            return this.renderYoutube();
        // let i = this.props.i || 0;
        let {src, alt, caption, title, className, refreshHash, originalSrc, ...extraProps} = this.props;
        if (!alt)
            alt = resolveAssetPath(src).replace(/\.[^.]*$/, '').replace(/[_/-]+/g, ' ').trim();
        if (!title)
            title = alt;
        className = VideoAsset.ASSET_CLASS + (className ? ' ' + className : '')
        return <ErrorBoundary assetName="Video Asset">
            <div title={title} className={className}>
                <video controls>
                    <source src={src}  {...extraProps} children={null} type="video/mp4"/>
                    <meta itemProp="description" content={alt}/>
                </video>

                <div
                    className='text-container'
                >
                    {alt.replace(/\\n/g, "\n")}
                </div>
            </div>
        </ErrorBoundary>;
    }

    renderYoutube() {
        let {src, alt, title, className, refreshHash, originalSrc, ...extraProps} = this.props;
        src = 'https://www.youtube.com/embed/' + this.parseYoutubeURL(src);
        title = title || 'Youtube';
        className = VideoAsset.ASSET_CLASS + (className ? ' ' + className : '')
        return (
            <div title={title} className={className}>
                <iframe src={src} title={title} {...extraProps} />
            </div>
        );

    }


    parseYoutubeURL(url) {
        var regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/;
        var match = url.match(regExp);
        return (match && match[7].length === 11) ? match[7] : false;
    }
}