import React from "react";

export default class MetaAsset extends React.Component {
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

