import * as React from "react";
import PropTypes from "prop-types";
import MarkdownAsset from "./asset-types/markdown/MarkdownAsset.js";
import AssetIterator from "../util/AssetIterator.js";
import AssetLoader from "./loader/AssetLoader.js";
import AssetBrowserContext from "./context/AssetBrowserContext.js";
import AssetRefresher from "./loader/AssetRefresher.js";
import AssetRenderer from "./asset-types/asset-renderer/AssetRenderer.js";
import {setUnusedAssets} from "./asset-types/markdown/markdownOptions.js";
import {pathJoin, resolveAssetURL, scrollIntoViewPersistent} from "./util/ClientUtil.js";
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
            loaded: false,
            refreshHash: null,
            assetContentFullScreen: null
        }
        this.overrides = {
            templateContent: (props) => this.renderChildren(props),
        }
        this.renderedAssets = [];
        this.cb = {
            onPopState: () => {
                const {searchParams} = (new URL(document.location));
                const viewAsset = searchParams.get('viewAsset');

                for (const asset of this.renderedAssets) {
                    if (asset.checkForFullScreenHash(viewAsset)) {
                        return;
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

    removeRenderedAsset(assetInstance) {
        const i = this.renderedAssets.indexOf(assetInstance);
        if (i !== -1) {
            this.renderedAssets.splice(i, 1);
        }
    }

    addRenderedAsset(assetInstance) {
        if (this.renderedAssets.indexOf(assetInstance) === -1) {
            this.renderedAssets.push(assetInstance);
        }
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
        </AssetBrowserContext.Provider>;
    }


    renderContent() {
        const {assets, loaded, error} = this.state;
        if (error) return error.stack || error || '';
        if (!loaded) return <>
            <AssetLoader/>
            Loading...
        </>
        const iterator = new AssetIterator(assets);
        let templatePath = this.getTemplatePath(this.props.pathname, iterator)
        let themePath = this.getSiteThemePath(iterator)

        return <>
            {themePath ? <StyleSheetAsset href={themePath}/> : null}
            {this.renderFullScreenAsset()}
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
                file={indexMDPath}
                onLoad={this.cb.onMarkdownLoad}
            />
        </article>;
    }

    renderSearchPage(pathname) {
        const {assets} = this.state;
        const iterator = new AssetIterator(assets);
        let keywords = pathname.split(/[/?#]/g).filter(k => k).map(k => k.replace(/%20/g, ' ').trim());
        if (pathname === '/search') keywords = [];
        let searchPagePath = this.getSearchPagePath(iterator)

        return <article className={"search"}>
            <MarkdownAsset file={searchPagePath} onLoad={this.cb.onMarkdownLoad}/>
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

    renderFullScreenAsset() {
        if (!this.state.assetContentFullScreen)
            return null;
        const {src, alt, children, assetInstance} = this.state.assetContentFullScreen;
        if (!children) {
            throw new Error("WTF")
        }
        return <AssetFullScreenView
            src={src}
            alt={alt}
            children={children}
            assetBrowser={this}
            assetInstance={assetInstance}
        />
    }

    updateAssets(assets, error) {
        const iterator = new AssetIterator(assets)
        const assetStats = iterator.getAssetStats();
        this.setState({assets, error, loaded: true});
    }

    updateRefreshHash(refreshHash) {
        if (refreshHash !== this.state.refreshHash) {
            this.setState({refreshHash})
            AssetLoader.reloadAssets();
        }
    }

    showFullScreenAsset(assetInstance, assetContent, src, alt) {
        this.setState({assetContentFullScreen: {children: assetContent, assetInstance, src, alt}});
        let {viewAsset, viewCount} = window.history.state || {};
        if (viewAsset !== src) {
            window.history.pushState({viewAsset: src, viewCount: (viewCount || 0) + 1}, '', '?viewAsset=' + src);
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

    getTemplatePath(pathname, iterator) {
        let templatePath = iterator.tryFile(pathJoin(pathname, FILE_DEFAULT_TEMPLATE)) || iterator.tryFile(pathJoin(PATH_SITE, FILE_DEFAULT_TEMPLATE));
        if (templatePath) return resolveAssetURL(templatePath);
        return DefaultTemplate;
    }

    getSiteThemePath(iterator) {
        let scssPath = iterator.tryFile(pathJoin(PATH_SITE, FILE_DEFAULT_THEME));
        if (scssPath) return resolveAssetURL(scssPath)
        return null;
    }

    getSearchPagePath(iterator) {
        let searchPage = iterator.tryFile(pathJoin(PATH_SITE, FILE_SEARCH_PAGE));
        if (searchPage) return resolveAssetURL(searchPage);
        return DefaultSearchPage;
    }

}


