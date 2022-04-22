import * as React from "react";
import Markdown from 'markdown-to-jsx';
import PropTypes from "prop-types";

import "./MarkdownAsset.scss"
import AssetBrowserContext from "../../context/AssetBrowserContext.js";
import {getMarkdownOptions} from "./markdownOptions.js";


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
            loaded: false,
            pathname: null
        }
        this.refreshHash = null;
    }


    componentDidUpdate(prevProps, prevState, snapshot) {
        if (prevProps.file !== this.props.file) {
            this.setState({content: null, loaded: false});
            // console.log("Changing content: ", this.props.file);
            this.loadContent().then();
        }
        if (prevProps.refreshHash && (prevProps.refreshHash !== this.props.refreshHash)) {
            console.log("Refreshing content: ", this.props.file, prevProps.refreshHash);
            this.loadContent().then();
        }
    }

    componentDidMount() {
        // console.log("Loading content: ", this.props.file);
        this.loadContent().then();
    }

    async loadContent() {
        const {file} = this.props;
        const response = await fetch(file);
        const content = await response.text()
        this.setState({
            content,
            loaded: true,
            pathname: file.substring(0, file.lastIndexOf("/") + 1)
        });
    }

    render() {

        const {loaded, pathname} = this.state;
        if (!loaded)
            return "Loading: " + this.props.file;
        const markdownOptions = getMarkdownOptions(pathname);
        const options = {
            ...markdownOptions,
            overrides: this.props.overrides,
        }
        return (
            <Markdown options={options}>
                {this.state.content}
            </Markdown>
        );
    }
}

export default class MarkdownAssetWrapper extends React.Component {
    render() {
        return <AssetBrowserContext.Consumer>
            {({refreshHash}) => {
                return <MarkdownAsset {...this.props} refreshHash={refreshHash}>
                    {this.props.children}
                </MarkdownAsset>;
            }}
        </AssetBrowserContext.Consumer>;
    }
}