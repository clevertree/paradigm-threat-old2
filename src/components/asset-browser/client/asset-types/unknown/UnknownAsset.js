import React from "react";
import PropTypes from "prop-types";

export default class UnknownAsset extends React.Component {
    /** Property validation **/
    static propTypes = {
        src: PropTypes.string,
    };

    constructor(props) {
        super(props);
        this.state = {
            content: null,
            loaded: false
        }
    }

    render() {
        let className = 'asset-unknown asset';
        if (this.props.className)
            className += ' ' + this.props.className;
        return (
            <div className={className}>
                <a className="title" href={this.props.src}>Unknown Asset: {this.props.src.split('/').pop()}</a>
            </div>
        );
    }
}

