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
            loaded: false
        }
        this.refreshHash = null;
    }
    

    componentDidUpdate(prevProps, prevState, snapshot) {
        if (prevProps.file !== this.props.file) {
            this.setState({content: null, loaded: false});
            console.log("Reloading content: ", this.props.file);
            setTimeout(() => {
                this.loadContent().then();
            }, 1000)
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
        const {file} = this.props;
        const path = file.substring(0, file.lastIndexOf("/") + 1);
        const markdownOptions = getMarkdownOptions(path);
        const options = {
            ...markdownOptions,
            overrides: this.props.overrides,
        }
        return (
            <Markdown options={options}>
                {this.state.loaded ? this.state.content : "Loading Markdown page: " + this.props.file}
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