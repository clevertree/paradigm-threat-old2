import * as React from "react";
import PropTypes from "prop-types";
import MarkdownAsset from "./asset-types/markdown/MarkdownAsset.js";
import AssetIterator from "../util/AssetIterator.js";
import AssetLoader from "./loader/AssetLoader.js";
import AssetBrowserContext from "./context/AssetBrowserContext.js";
import AssetRefresher from "./loader/AssetRefresher.js";
import AssetRenderer from "./asset-types/asset-renderer/AssetRenderer.js";
import {setUnusedAssets} from "./asset-types/markdown/markdownOptions.js";

import DefaultTemplate from "../template/default.template.md";
import "../template/default.theme.scss";
import {FILE_DEFAULT_TEMPLATE, FILE_DEFAULT_THEME, PATH_SITE} from "../constants.js";
import {pathJoin, resolveAssetURL} from "./util/ClientUtil.js";
import StyleSheetAsset from "./asset-types/link/StyleSheetAsset.js";

export default class AssetBrowser extends React.Component {
    /** Property validation **/
    static propTypes = {
        // defaultTemplate: PropTypes.string.isRequired,
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
            refreshHash: null,
        }
        this.overrides = {
            templateContent: (props) => this.renderChildren(props),
        }
    }

    componentDidMount() {
        // console.log("Loading content: ", this.props.file);
        this.loadContent().then();
    }

    async loadContent(force = false) {
        const assets = await new AssetLoader().loadAssets(force)
        this.setState({assets, loaded: true});
        // console.log("Assets loaded: ", assets);
    }

    updateRefreshHash(refreshHash) {
        if (refreshHash !== this.state.refreshHash) {
            this.setState({refreshHash})
            this.loadContent(true).then();
        }
    }

    getTemplatePath(pathname, iterator) {
        let templatePath = iterator.tryFile(pathJoin(pathname, FILE_DEFAULT_TEMPLATE))
            || iterator.tryFile(pathJoin(PATH_SITE, FILE_DEFAULT_TEMPLATE));
        if (templatePath)
            return resolveAssetURL(templatePath);
        return DefaultTemplate;
    }

    getSiteThemePath(iterator) {
        let scssPath = iterator.tryFile(pathJoin(PATH_SITE, FILE_DEFAULT_THEME));
        if (scssPath)
            return resolveAssetURL(scssPath)
        return null;
    }

    render() {
        const {assets, loaded} = this.state;
        if (!loaded)
            return "Loading...";
        const iterator = new AssetIterator(assets);
        let templatePath = this.getTemplatePath(this.props.pathname, iterator)
        let themePath = this.getSiteThemePath(iterator)

        return <AssetBrowserContext.Provider value={{
            browser: this,
            ...this.props,
            ...this.state,
            iterator
        }}>
            <>
                {themePath ? <StyleSheetAsset href={themePath}/> : null}
                <AssetRefresher/>
                <MarkdownAsset
                    wrapper={React.Fragment}
                    overrides={this.overrides}
                    file={templatePath}/>
            </>
        </AssetBrowserContext.Provider>;
    }

    renderChildren() {
        const {assets} = this.state;
        const iterator = new AssetIterator(assets);
        const fileList = iterator.listFiles(this.props.pathname);

        const indexMDPath = fileList.find(filePath => filePath.endsWith('index.md'))
        if (indexMDPath)
            return this.renderIndexPage(indexMDPath, fileList)
        return this.renderAssetPage(fileList)
    }

    renderIndexPage(indexMDPath, fileList) {
        const filteredFileList = fileList.filter(file => !file.endsWith('.md'))
        setUnusedAssets(filteredFileList);
        return <article className={"index"}>
            <MarkdownAsset file={indexMDPath}/>
        </article>;
    }

    renderAssetPage(fileList) {
        return <AssetRenderer>{fileList}</AssetRenderer>;
    }
}

