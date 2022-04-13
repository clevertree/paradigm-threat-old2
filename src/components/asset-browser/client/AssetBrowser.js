import * as React from "react";
import PropTypes from "prop-types";
import MarkdownAsset from "./assetTypes/markdown/MarkdownAsset.js";
import AssetIterator from "../util/AssetIterator.js";
import AssetRenderer from "./AssetRenderer.js";


export default class AssetBrowser extends React.Component {
    /** Property validation **/
    static propTypes = {
        defaultTemplate: PropTypes.string.isRequired,
        pathname: PropTypes.string.isRequired
    };

    static defaultProps = {
        pathname: ""
    }

    constructor(props) {
        super(props);
        // console.log('AssetBrowser', props);
        this.state = {
            assets: null,
            loaded: false
        }
        this.overrides = {
            templateContent: (props) => this.renderChildren(props),
        }
    }

    componentDidMount() {
        // console.log("Loading content: ", this.props.file);
        this.loadContent().then();
    }

    async loadContent() {
        const assetURL = new URL(process.env.REACT_APP_ASSET_ENDPOINT, process.env.REACT_APP_ASSET_PUBLIC_URL || window.location.origin);
        const response = await fetch(assetURL + '');
        const assets = await response.json()
        this.setState({assets, loaded: true});
        console.log("Assets loaded: ", assets);
    }

    render() {
        const { defaultTemplate} = this.props;
        return (
            <MarkdownAsset
                overrides={this.overrides}
                file={defaultTemplate} />
        );
    }

    renderChildren() {
        const { assets, loaded } = this.state;
        if(!loaded)
            return "Loading...";
        const iterator = new AssetIterator(assets);
        // console.log(this.props.pathname, assets);
        const fileList = iterator.listFiles(this.props.pathname)
        return <AssetRenderer fileList={fileList} pathname={this.props.pathname} />;
    }
}

