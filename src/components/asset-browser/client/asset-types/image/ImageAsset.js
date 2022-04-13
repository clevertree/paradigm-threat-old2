import React from "react";
import PropTypes from "prop-types";

import "./ImageAsset.css";

export default class ImageAsset extends React.Component {
    /** Property validation **/
    static propTypes = {
        src: PropTypes.string.isRequired,
        i: PropTypes.number
    };

    constructor(props) {
        super(props);

        this.state = {
            fullscreen: false,
        }
        this.cb = {
            onClick: e => this.onClick(e),
            closeFullscreen: e => this.closeFullscreen(e)
        }
    }

    render() {
        // let i = this.props.i || 0;
        let className = 'asset-image asset';
        if(this.props.className)
            className += ' ' + this.props.className;
        // if(this.state.fullscreen)
        //     className += ' fullscreen';
        // className += [' even', ' odd'][i % 2];
        // if(i % 4 === 0)
        //     className += ' clear';
        const altText = this.props.alt || this.props.src.split('/').pop();

        return [
            <img
                key="image"
                className={className}
                src={this.props.src}
                alt={altText}
                onClick={this.cb.onClick}
            />,
            this.state.fullscreen ? <div
                key="asset-image-fullscreen"
                className="asset-image-fullscreen"
                onClick={this.cb.closeFullscreen}
            >
                <img
                    src={this.props.src}
                    alt={altText}
                    onClick={this.cb.closeFullscreen}
                />,
            </div> : null
        ];
    }


    onClick(e) {
        if(this.props.href) {
            let url = new URL(this.props.href);
            console.log(url, document.location.origin);
            if(url.origin === document.location.origin) {
                document.location.href = url;
            } else {
                window.open(url, "_blank");
            }
        } else {
            const fullscreen = !this.state.fullscreen;
            activeImages.forEach(activeImage => activeImage.closeFullscreen());
            if(fullscreen) {
                activeImages = [this];
            }
            this.setState({fullscreen});
            console.log('activeImages', activeImages, fullscreen);
        }
    }

    closeFullscreen() {
        this.setState({fullscreen: false})
    }
}


let activeImages = [];