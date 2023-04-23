import * as React from "react";
import PropTypes from "prop-types";
import MarkdownAsset from "./asset-types/markdown/MarkdownAsset.js";
import AssetIterator from "../util/AssetIterator.js";
import AssetLoader from "./loader/AssetLoader.js";
import AssetBrowserContext from "./context/AssetBrowserContext.js";
import AssetRefresher from "./loader/AssetRefresher.js";
import AssetRenderer from "./asset-types/asset-renderer/AssetRenderer.js";
import {setUnusedAssets} from "./asset-types/markdown/markdownOptions.js";
import {pathJoin, resolveAssetPath, resolveAssetURL, scrollIntoViewPersistent} from "./util/ClientUtil.js";
import {FILE_DEFAULT_TEMPLATE, FILE_DEFAULT_THEME, FILE_SEARCH_PAGE, PATH_SITE} from "../constants.js";

import StyleSheetAsset from "./asset-types/link/StyleSheetAsset.js";
import ErrorBoundary from "./error/ErrorBoundary.js";
import AssetSearch from "./search/AssetSearch.js";

// Default Theme
import "../template/default.theme.scss";

// Default Templates
import DefaultTemplate from "../template/default.template.md";
import DefaultSearchPage from "../template/search.page.md";
import AssetFullScreenView from "./asset-viewer/AssetFullScreenView.js";

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
        this.state = {
            assets: null,
            assetStats: {
                associatedMDFiles: {}
            },
            assetIterator: null,
            loaded: false,
            refreshHash: null,
            assetContentFullScreen: null
        }
        if (props.assets) {
            this.state.assets = props.assets;
            this.state.assetIterator = new AssetIterator(props.assets)
            this.state.assetStats = this.state.assetIterator.getAssetStats();
        }
        this.overrides = {
            templateContent: (props) => this.renderChildren(props),
        }
        this.renderedAssets = {};
        this.cb = {
            onPopState: () => {
                const {searchParams} = (new URL(document.location));
                const viewAsset = searchParams.get('viewAsset');
                if (viewAsset) {
                    for (const src of Object.keys(this.renderedAssets)) {
                        if (viewAsset === src) {
                            this.renderedAssets[src].openInFullScreen()
                            return;
                        }
                    }
                }
                this.setState({assetContentFullScreen: null});
            },
            // closeFullScreen: e => this.closeFullScreen(),
            stopPropagation: e => e.stopPropagation(),
            onMarkdownLoad: () => {
                this.cb.onPopState()
                this.checkForHashScrollPosition();
            },
        }
    }

    componentDidMount() {
        if (!this.state.loaded && !this.state.refreshHash)
            AssetLoader.reloadAssets(true);
        window.addEventListener('popstate', this.cb.onPopState)
    }

    getRefreshHash() {
        return this.state.refreshHash;
    }

    getPath() {
        return this.props.pathname;
    }

    isLoaded() {
        return this.state.loaded;
    }

    getIterator() {
        return new AssetIterator(this.state.assets)
    }

    removeRenderedAsset(src) {
        delete this.renderedAssets[src];
    }

    addRenderedAsset(src, assetInstance) {
        if (!this.renderedAssets[src])
            this.renderedAssets[src] = assetInstance;
    }

    getRenderedAssets() {
        return this.renderedAssets;
    }

    checkForHashScrollPosition() {
        const {hash} = document.location;
        if (hash) {
            const idString = hash.substring(1);
            const headerElm = [].find.call(document.querySelectorAll('h1, h2, h3, h4, h5, h6'), header => header.getAttribute('id') === idString);

            if (headerElm) {
                headerElm.classList.add('highlighted');
                scrollIntoViewPersistent(headerElm);
            }
        }
    }

    render() {
        return <AssetBrowserContext.Provider value={this}>
            {this.renderContent()}
            {this.props.children}
        </AssetBrowserContext.Provider>;
    }


    renderContent() {
        const {loaded, error} = this.state;
        if (error) return error.stack || error || '';
        if (!loaded) return <>
            <AssetLoader/>
            Loading...
        </>
        let templatePath = this.getTemplatePath(this.props.pathname)
        let themePath = this.getSiteThemePath()

        return <>
            {themePath ? <StyleSheetAsset href={themePath}/> : null}
            {this.renderFullScreenAsset()}
            <AssetRefresher/>
            <MarkdownAsset
                wrapper={React.Fragment}
                overrides={this.overrides}
                src={templatePath}/>
        </>
    }

    renderChildren() {
        const {assets} = this.state;
        const iterator = new AssetIterator(assets);
        const {pathname} = this.props;
        if (iterator.fileExists(pathname)) return this.renderIndexPage(resolveAssetURL(pathname));
        if (!iterator.pathExists(pathname)) return this.renderSearchPage(pathname);
        try {
            const fileList = iterator.listFiles(pathname);
            const indexMDPath = fileList.find(filePath => filePath.endsWith('index.md'))
            if (indexMDPath) return this.renderIndexPage(indexMDPath, fileList)
            return this.renderDirectoryPage(fileList)
        } catch (e) {
            return this.renderErrorPage(e);
        }
    }

    renderIndexPage(indexMDPath, fileList = []) {
        const filteredFileList = fileList.filter(file => !file.endsWith('index.md'))
        setUnusedAssets(filteredFileList);
        return <article className={"index"}>
            <MarkdownAsset
                src={indexMDPath}
                onLoad={this.cb.onMarkdownLoad}
            />
        </article>;
    }

    renderSearchPage(pathname) {
        const {assetIterator} = this.state;
        let keywords = pathname.split(/[/?#]/g).filter(k => k).map(k => k.replace(/%20/g, ' ').trim());
        if (pathname === '/search') keywords = [];
        let searchPagePath = this.getSearchPagePath()

        return <article className={"search"}>
            <MarkdownAsset src={searchPagePath} onLoad={this.cb.onMarkdownLoad}/>
            <ErrorBoundary assetName={"Search"}>
                <AssetSearch iterator={assetIterator} keywords={keywords}/>
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

    renderFullScreenAsset() {
        if (!this.state.assetContentFullScreen)
            return null;
        const {children, assetInstance, src} = this.state.assetContentFullScreen;
        if (!children) {
            throw new Error("WTF")
        }
        return <AssetFullScreenView
            src={src}
            children={children}
            assetBrowser={this}
            assetInstance={assetInstance}
        />
    }

    updateAssets(assets, error) {
        const assetIterator = new AssetIterator(assets)
        const assetStats = assetIterator.getAssetStats();
        this.setState({assets, assetStats, assetIterator, error, loaded: true});
    }

    updateRefreshHash(refreshHash) {
        if (refreshHash !== this.state.refreshHash) {
            this.setState({refreshHash})
            AssetLoader.reloadAssets();
        }
    }

    showFullScreenAsset(assetInstance, assetContent, src, alt) {
        this.setState({assetContentFullScreen: {children: assetContent, assetInstance, src}});
        let {viewAsset, viewCount} = window.history.state || {};
        if (viewAsset !== src) {
            window.history.pushState({viewAsset: src, viewCount: (viewCount || 0) + 1}, alt, '?viewAsset=' + src);
        }
    }

    closeFullScreen() {
        if (!this.state.assetContentFullScreen)
            throw new Error("Fulls screen is already closed")
        this.setState({assetContentFullScreen: null});
        // if (window.history?.state?.viewAsset) {
        //     window.history.back();
        // } else {
        window.history.pushState({}, '', '?');
        // }
    }

    // Known paths

    getTemplatePath(pathname) {
        const {assetIterator} = this.state;
        let templatePath = assetIterator.tryFile(pathJoin(pathname, FILE_DEFAULT_TEMPLATE)) || assetIterator.tryFile(pathJoin(PATH_SITE, FILE_DEFAULT_TEMPLATE));
        if (templatePath) return resolveAssetURL(templatePath);
        return DefaultTemplate;
    }

    getSiteThemePath() {
        const {assetIterator} = this.state;
        let scssPath = assetIterator.tryFile(pathJoin(PATH_SITE, FILE_DEFAULT_THEME));
        if (scssPath) return resolveAssetURL(scssPath)
        return null;
    }

    getSearchPagePath() {
        const {assetIterator} = this.state;
        let searchPage = assetIterator.tryFile(pathJoin(PATH_SITE, FILE_SEARCH_PAGE));
        if (searchPage) return resolveAssetURL(searchPage);
        return DefaultSearchPage;
    }

    getMDCaptionPath(absPath) {
        const pathname = resolveAssetPath(absPath);
        const {assetStats: {associatedMDFiles}} = this.state;
        const mdCaptionPath = associatedMDFiles[pathname];
        return mdCaptionPath ? resolveAssetURL(mdCaptionPath) : null;
    }
}


