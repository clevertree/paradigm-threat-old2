import React from "react";
import PropTypes from "prop-types";

import "./AssetList.css";

export default class AssetList extends React.Component {
    /** Property validation **/
    static propTypes = {
        children: PropTypes.any.isRequired,
    };

    render() {
        let className = 'asset-list';
        if(this.props.className)
            className += ' ' + this.props.className;

        return (
            <div className={className}>
                {this.props.children}
            </div>
        );
    }
}


