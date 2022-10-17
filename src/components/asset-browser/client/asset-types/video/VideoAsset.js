import React from "react";
import PropTypes from "prop-types";

import "./VideoAsset.css";
import ErrorBoundary from "../../error/ErrorBoundary.js";

export default class VideoAsset extends React.Component {
    static ASSET_CLASS = 'asset video';
    /** Property validation **/
    static propTypes = {
        src: PropTypes.string.isRequired,
    };

    constructor(props) {
        super(props);
    }

    render() {
        if (this.parseYoutubeURL(this.props.src))
            return this.renderYoutube();
        // let i = this.props.i || 0;
        let {src, alt, title, className, refreshHash, ...extraProps} = this.props;
        alt = alt || src.split('/').pop();
        const altSL = alt.replace(/\n/g, " ")
        title = title || altSL;
        className = VideoAsset.ASSET_CLASS + (className ? ' ' + className : '')
        return <ErrorBoundary assetName="Video Asset">
            <video controls title={title} className={className}>
                <source src={src}  {...extraProps} children={null} type="video/mp4"/>
                <meta itemProp="description" content={alt}/>
            </video>
        </ErrorBoundary>;
    }

    renderYoutube() {
        let {src, alt, title, className, refreshHash, ...extraProps} = this.props;
        src = 'https://www.youtube.com/embed/' + this.parseYoutubeURL(src);
        title = title || 'Youtube';
        className = VideoAsset.ASSET_CLASS + (className ? ' ' + className : '')
        return (
            <iframe title={title} className={className} src={src} {...extraProps} />
        );

    }


    parseYoutubeURL(url) {
        var regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/;
        var match = url.match(regExp);
        return (match && match[7].length === 11) ? match[7] : false;
    }
}