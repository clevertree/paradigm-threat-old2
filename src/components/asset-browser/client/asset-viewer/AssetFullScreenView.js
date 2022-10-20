import * as React from "react";
import PropTypes from "prop-types";
import Markdown from "markdown-to-jsx";
import "./AssetFullScreenView.scss"

export default class AssetFullScreenView extends React.Component {
    /** Property validation **/
    static propTypes = {
        src: PropTypes.string.isRequired,
        alt: PropTypes.string.isRequired,
        onClose: PropTypes.func.isRequired,
        children: PropTypes.any.isRequired,
    };

    static defaultProps = {}

    constructor(props) {
        super(props);

        this.cb = {
            stopPropagation: e => e.stopPropagation(),
        }
    }


    render() {
        const {src, alt, onClose, children} = this.props;
        return <div
            key="asset-image-fullscreen"
            className="asset-image-fullscreen"
            onClick={onClose}
        >
            {children}
            {alt ? <div className={'alt-text'}>
                <Markdown onClick={this.cb.stopPropagation}
                          options={this.options}>{alt.replace(/\\n/g, "\n")}</Markdown>
                <br/>
                <a onClick={this.cb.stopPropagation} href={src} className="source" target="_blank"
                   rel="noreferrer">Source File</a>
            </div> : null}
            <div className="close">&#10006;</div>
        </div>
    }
}