import React from "react";
import PropTypes from "prop-types";

import "./VideoAsset.css";
import ErrorBoundary from "../../error/ErrorBoundary.js";

export default class VideoAsset extends React.Component {
    /** Property validation **/
    static propTypes = {
        src: PropTypes.string.isRequired,
    };

    constructor(props) {
        super(props);
        this.className = 'asset video';
        if (this.props.className)
            this.className += ' ' + this.props.className;
    }

    render() {
        if (this.parseYoutubeURL(this.props.src))
            return this.renderYoutube();
        // let i = this.props.i || 0;
        let className = this.className + ' youtube';
        if (this.props.className)
            className += ' ' + this.props.className;
        return <ErrorBoundary assetName="Video Asset">
            <video controls className={className}>
                <source {...this.props} children={null} type="video/mp4"/>
                Your browser does not support the video tag.
            </video>
        </ErrorBoundary>;
    }

    renderYoutube() {
        const src = 'https://www.youtube.com/embed/' + this.parseYoutubeURL(this.props.src);
        const title = 'Youtube';
        let className = this.className + ' youtube';
        if (this.props.className)
            className += ' ' + this.props.className;
        return (
            <iframe title={title} {...this.props} className={className} src={src}>
            </iframe>
        );

    }


    parseYoutubeURL(url) {
        var regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/;
        var match = url.match(regExp);
        return (match && match[7].length === 11) ? match[7] : false;
    }
}