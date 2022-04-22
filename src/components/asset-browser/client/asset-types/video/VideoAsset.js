import React from "react";
import PropTypes from "prop-types";

import "./VideoAsset.css";

export default class VideoAsset extends React.Component {
    /** Property validation **/
    static propTypes = {
        src: PropTypes.string.isRequired,
    };

    constructor(props) {
        super(props);
        this.className = 'asset video youtube';
        if (this.props.className)
            this.className += ' ' + this.props.className;
    }

    render() {
        if (this.parseYoutubeURL(this.props.src))
            return this.renderYoutube();
        // let i = this.props.i || 0;
        return (
            <div className={this.className}>
                <video controls>
                    <source {...this.props} type="video/mp4"/>
                    Your browser does not support the video tag.
                </video>
            </div>
        );
    }

    renderYoutube() {
        const src = 'https://www.youtube.com/embed/' + this.parseYoutubeURL(this.props.src);
        const title = 'Youtube';
        return (
            <div className={this.className + ' youtube'}>
                <iframe title={title} {...this.props} src={src}>
                </iframe>
            </div>
        );

    }


    parseYoutubeURL(url) {
        var regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/;
        var match = url.match(regExp);
        return (match && match[7].length === 11) ? match[7] : false;
    }
}