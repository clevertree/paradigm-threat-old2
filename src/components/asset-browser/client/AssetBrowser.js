import * as React from "react";
import Markdown from 'markdown-to-jsx';
import PropTypes from "prop-types";
import MarkdownContentLoader from "../../markdown/MarkdownContentLoader.js";
import AssetIterator from "../util/AssetIterator.js";


export default class AssetBrowser extends React.Component {
    /** Property validation **/
    static propTypes = {
        defaultTemplate: PropTypes.string.isRequired,
        location: PropTypes.object.isRequired
    };

    constructor(props) {
        super(props);
        console.log('AssetBrowser', props);
        this.state = {
            assets: null,
            loaded: false
        }
        this.overrides = {
            children: (props) => this.renderChildren(props),
        }
    }

    componentDidMount() {
        // console.log("Loading content: ", this.props.file);
        this.loadContent().then();
    }

    async loadContent() {
        const assetURL = new URL(process.env.REACT_APP_ASSET_ENDPOINT, process.env.REACT_APP_SERVER_PUBLIC_URL || window.location.origin);
        const response = await fetch(assetURL + '');
        const assets = await response.json()
        this.setState({assets, loaded: true});
        console.log("Assets loaded: ", assets);
    }

    render() {
        const { defaultTemplate} = this.props;
        return (
            <MarkdownContentLoader
                overrides={this.overrides}
                file={defaultTemplate} />
        );
    }

    renderChildren() {
        const { assets, loaded } = this.state;
        if(!loaded)
            return "Loading...";
        const iterator = new AssetIterator(assets);
        console.log(this.props.location.pathname, assets);
        const fileList = iterator.listFiles(this.props.location.pathname)
        return JSON.stringify(fileList);
    }
}
