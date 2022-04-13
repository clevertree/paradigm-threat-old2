import React from "react";
import PropTypes from "prop-types";

import "./VideoAsset.css";

export default class VideoAsset extends React.Component {
    /** Property validation **/
    static propTypes = {
        src: PropTypes.string.isRequired,
    };

    render() {
        if(this.parseYoutubeURL(this.props.src))
            return this.renderYoutube();
        // let i = this.props.i || 0;
        let className = 'asset-video asset-image';
        // className += [' even', ' odd'][i % 2];
        return (
            <div className={className}>
                <video controls>
                    <source {...this.props} type="video/mp4" />
                    Your browser does not support the video tag.
                </video>
            </div>
        );
    }

    renderYoutube() {
        let className = 'asset-video asset-image youtube';
        // className += [' even', ' odd'][i % 2];
        const src = 'https://www.youtube.com/embed/' + this.parseYoutubeURL(this.props.src);
        const title = 'Youtube';
        return (
            <div className={className}>
                <iframe title={title} {...this.props} src={src}>
                </iframe>
            </div>
        );

    }


    parseYoutubeURL(url) {
        var regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/;
        var match = url.match(regExp);
        return (match && match[7].length===11)? match[7] : false;
    }
}