import React from "react";
import PropTypes from "prop-types";

export default class UnknownAsset extends React.Component {
    /** Property validation **/
    static propTypes = {
        src: PropTypes.string.isRequired,
    };

    render() {
        return (
            <div className="image-asset">
                <img src={this.props.src} alt={this.props.src.split('/').pop()}/>
            </div>
        );
    }
}

