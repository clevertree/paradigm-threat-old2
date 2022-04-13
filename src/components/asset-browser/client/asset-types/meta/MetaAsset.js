import React from "react";
import PropTypes from "prop-types";

export default class MetaAsset extends React.Component {
    /** Property validation **/
    static propTypes = {
        src: PropTypes.string.isRequired,
    };

    render() {
        let keyName = 'name';
        if(this.props.property)
            keyName = 'property';
        let name = this.props[keyName];
        switch(name) {
            case 'title':
                document.title = this.props.content;
                break;
            default:
                const metaTag = document.head.querySelector(`meta[${keyName}='${name}']`)
                    || document.createElement('meta');
                metaTag.setAttribute(keyName, this.props.content)
                document.head.append(metaTag);
                break;
        }
        return null;
    }
}

