import * as React from "react";
import Markdown from 'markdown-to-jsx';
import PropTypes from "prop-types";

import "./MarkdownAsset.css"
import ImageAsset from "../image/ImageAsset.js";

import MetaAsset from "../meta/MetaAsset.js";
import NavAsset from "../nav/NavAsset.js";
import AssetBrowserContext from "../../AssetBrowserContext.js";

const customTags = {};

/**
 * Callback for adding two numbers.
 *
 * @callback tagCallback
 * @param {string} tagName - Tag Name.
 * @param {object} props - Tag Props.
 * @param {any} children - Tag Children.
 */

/**
 *
 * @param tagName
 * @param {tagCallback} tagCallback - A callback to run.
 */
export function registerTag(tagName, tagCallback) {
    customTags[tagName] = tagCallback;
}

class MarkdownAsset extends React.Component {
    /** Property validation **/
    static propTypes = {
        file: PropTypes.string.isRequired,
    };

    static defaultProps = {
        className: "markdown-body"
    }


    constructor(props) {
        super(props);
        this.state = {
            content: null,
            loaded: false
        }
        this.options = {
            wrapper: React.Fragment,
            createElement: this.renderTag.bind(this),
            overrides: props.overrides
        }
        this.refreshHash = null;
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        if (prevProps.file !== this.props.file) {
            this.setState({content: null, loaded: false});
            console.log("Reloading content: ", this.props.file);
            this.loadContent().then();
        }
        if (prevProps.refreshHash !== this.props.refreshHash) {
            console.log("Refreshing content: ", this.props.file, prevProps.refreshHash);
            this.loadContent().then();
        }
    }

    componentDidMount() {
        // console.log("Loading content: ", this.props.file);
        this.loadContent().then();
    }

    async loadContent() {
        const filePath = this.props.file;
        const response = await fetch(filePath);
        const content = await response.text()
        this.setState({content, loaded: true});
    }

    render() {
        return (
            <Markdown options={this.options}>
                {this.state.content ? this.state.content : "Loading Markdown page: " + this.props.file}
            </Markdown>
        );
    }

    renderTag(tagName, props, children) {
        let finalProps = {...props};
        if(props.class) {
            finalProps.className = finalProps.class;
            delete finalProps.class;
        }
        if(props.src) {
            finalProps.src = new URL(finalProps.src, process.env.REACT_APP_ASSET_PUBLIC_URL || window.location.origin) + '';
        }

        if(customTags[tagName])
            return customTags[tagName](tagName, finalProps, children);

        // console.log('renderTag', tagName, finalProps, children)
        return React.createElement(tagName, finalProps, children);
    }
}
registerTag('img', (tagName, props, children) => <ImageAsset {...props}>{children}</ImageAsset>)
registerTag('meta', (tagName, props, children) => <MetaAsset {...props}>{children}</MetaAsset>)
registerTag('nav', (tagName, props, children) => <NavAsset {...props}>{children}</NavAsset>)

export default class MarkdownAssetWrapper extends React.Component {
    render() {
        return <AssetBrowserContext.Consumer>
            {({refreshHash}) => {
                return <MarkdownAsset {...this.props} refreshHash={refreshHash} >
                    {this.props.children}
                </MarkdownAsset>;
            }}
        </AssetBrowserContext.Consumer>;
    }
}