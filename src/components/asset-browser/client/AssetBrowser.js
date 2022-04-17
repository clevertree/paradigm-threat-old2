import * as React from "react";
import PropTypes from "prop-types";
import MarkdownAsset from "./asset-types/markdown/MarkdownAsset.js";
import AssetIterator from "../util/AssetIterator.js";
import AssetLoader from "./loader/AssetLoader.js";
import AssetBrowserContext from "./context/AssetBrowserContext.js";
import AssetRefresher from "./loader/AssetRefresher.js";
import AssetRenderer from "./asset-types/asset-renderer/AssetRenderer.js";

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
            loaded: false,
            refreshHash: null
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
        const assets = await new AssetLoader().loadAssets()
        this.setState({assets, loaded: true});
        // console.log("Assets loaded: ", assets);
    }

    updateRefreshHash(refreshHash) {
        this.setState({refreshHash})
    }

    render() {
        const {defaultTemplate} = this.props;
        return <AssetBrowserContext.Provider value={{
            browser: this,
            ...this.props,
            ...this.state,
            iterator: new AssetIterator(this.state.assets)
        }}>
            <>
                <AssetRefresher/>
                <MarkdownAsset
                    overrides={this.overrides}
                    file={defaultTemplate}/>
            </>
        </AssetBrowserContext.Provider>;
    }

    renderChildren() {
        const {assets, loaded} = this.state;
        if (!loaded)
            return "Loading...";
        const iterator = new AssetIterator(assets);
        // console.log(this.props.pathname, assets);
        const fileList = iterator.listFiles(this.props.pathname);

        const indexMDPath = fileList.find(filePath => filePath.endsWith('index.md'))
        if (indexMDPath)
            return <MarkdownAsset file={indexMDPath} />;
        return <AssetRenderer>{fileList}</AssetRenderer>;
    }
}

