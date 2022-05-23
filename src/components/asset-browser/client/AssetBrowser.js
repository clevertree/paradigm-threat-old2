import * as React from "react";
import PropTypes from "prop-types";
import MarkdownAsset from "./asset-types/markdown/MarkdownAsset.js";
import AssetIterator from "../util/AssetIterator.js";
import AssetLoader from "./loader/AssetLoader.js";
import AssetBrowserContext from "./context/AssetBrowserContext.js";
import AssetRefresher from "./loader/AssetRefresher.js";
import AssetRenderer from "./asset-types/asset-renderer/AssetRenderer.js";
import {setUnusedAssets} from "./asset-types/markdown/markdownOptions.js";
import {pathJoin, resolveAssetURL} from "./util/ClientUtil.js";
import {FILE_DEFAULT_TEMPLATE, FILE_DEFAULT_THEME, FILE_SEARCH_PAGE, PATH_SITE} from "../constants.js";

import StyleSheetAsset from "./asset-types/link/StyleSheetAsset.js";
import ErrorBoundary from "./error/ErrorBoundary.js";
import AssetSearch from "./search/AssetSearch.js";

// Default Theme
import "../template/default.theme.scss";

// Default Templates
import DefaultTemplate from "../template/default.template.md";
import DefaultSearchPage from "../template/search.page.md";

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
        this.protected = {
            updateAssets: (assets, error) => {
                this.setState({assets, error, loaded: true});
                if (assets) {
                    runOnceScrollToHashID(); // TODO: refactor
                }
            },
            updateRefreshHash: (refreshHash) => {
                if (refreshHash !== this.state.refreshHash) {
                    this.setState({refreshHash})
                    AssetLoader.reloadAssets();
                }
            }
        }
    }

    componentDidMount() {
        // this.loadContent().then();
    }

    // async loadContent(force = false) {
    //     try {
    //         const assets = await new AssetLoader().loadAssets(force)
    //         this.setState({assets, loaded: true});
    //         console.log("Assets loaded: ", assets);
    // } catch (error) {
    //     console.error('Error fetching assets: ', error);
    //     this.setState({loaded: true, error});
    // }
    // }

    render() {
        return <AssetBrowserContext.Provider value={{
            ...this.protected,
            ...this.props,
            ...this.state,
            getIterator: () => new AssetIterator(this.state.assets)
        }}>
            {this.renderContent()}
        </AssetBrowserContext.Provider>;
    }

    renderContent() {
        const {assets, loaded, error} = this.state;
        if (error)
            return error.stack || error || '';
        if (!loaded)
            return <>
                <AssetLoader/>
                Loading...
            </>
        const iterator = new AssetIterator(assets);
        let templatePath = this.getTemplatePath(this.props.pathname, iterator)
        let themePath = this.getSiteThemePath(iterator)

        return <>
            {themePath ? <StyleSheetAsset href={themePath}/> : null}
            <AssetRefresher/>
            <MarkdownAsset
                wrapper={React.Fragment}
                overrides={this.overrides}
                file={templatePath}/>
        </>
    }

    renderChildren() {
        const {assets} = this.state;
        const iterator = new AssetIterator(assets);
        const {pathname} = this.props;
        if (iterator.fileExists(pathname))
            return this.renderIndexPage(resolveAssetURL(pathname));
        if (!iterator.pathExists(pathname))
            return this.renderSearchPage(pathname);
        try {
            const fileList = iterator.listFiles(pathname);
            const indexMDPath = fileList.find(filePath => filePath.endsWith('index.md'))
            if (indexMDPath)
                return this.renderIndexPage(indexMDPath, fileList)
            return this.renderDirectoryPage(fileList)
        } catch (e) {
            return this.renderErrorPage(e);
        }
    }

    renderIndexPage(indexMDPath, fileList = []) {
        const filteredFileList = fileList.filter(file => !file.endsWith('index.md'))
        setUnusedAssets(filteredFileList);
        return <article className={"index"}>
            <MarkdownAsset file={indexMDPath}/>
        </article>;
    }

    renderSearchPage(pathname) {
        const {assets} = this.state;
        const iterator = new AssetIterator(assets);
        const keywords = pathname.split(/[/?#]/g).filter(k => k);
        let searchPagePath = this.getSearchPagePath(iterator)

        return <article className={"search"}>
            <MarkdownAsset file={searchPagePath}/>
            <ErrorBoundary assetName={"Search"}>
                <AssetSearch iterator={iterator} keywords={keywords}/>
            </ErrorBoundary>
        </article>;
    }

    renderDirectoryPage(fileList) {
        return <article className={"directory asset-spread"}>
            <ErrorBoundary assetName={"Directory"}>
                <AssetRenderer>{fileList}</AssetRenderer>
            </ErrorBoundary>
        </article>;
    }

    renderErrorPage(error) {
        return <article className={"error"}>
            <pre className={"error"}>{error.stack}</pre>
        </article>;
    }


    // Known paths

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

    getSearchPagePath(iterator) {
        let searchPage = iterator.tryFile(pathJoin(PATH_SITE, FILE_SEARCH_PAGE));
        if (searchPage)
            return resolveAssetURL(searchPage);
        return DefaultSearchPage;
    }

}

let scrollToHashTimeout = null;

function runOnceScrollToHashID() {
    scrollToHashTimeout = scrollToHashTimeout || setTimeout(() => {
        const {hash} = document.location;
        if (hash) {
            const headerElm = document.querySelector(hash);
            // console.log('hash', hash, headerElm);
            if (headerElm) {
                headerElm.scrollIntoView({block: "start", behavior: 'smooth'})
                headerElm.classList.add('highlighted')
                setTimeout(() => {
                    headerElm.scrollIntoView({block: "start", behavior: 'smooth'})
                }, 500)
            }
        }
    }, 500)
}

