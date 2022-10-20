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
            assets: null, loaded: false, refreshHash: null,
            assetContentFullScreen: null
        }
        this.overrides = {
            templateContent: (props) => this.renderChildren(props),
        }
        this.renderedAssets = [];
        this.cb = {
            onPopState: (e) => {
                this.setState({assetContentFullScreen: null});
            },
            /** @deprecated **/
            addRenderedAsset: (assetInstance) => {
                if (assetInstance instanceof React.Component
                    && this.renderedAssets.indexOf(assetInstance) === -1)
                    this.renderedAssets.push(assetInstance);
            },
            showFullScreenAsset: (assetContent, src, alt) => {
                this.setState({assetContentFullScreen: {children: assetContent, src, alt}});
                if (window.history.state?.viewAsset !== src) {
                    window.history.pushState({viewAsset: src}, '', '?viewAsset=' + src);
                }
            },
            closeFullScreen: (e) => {
                this.setState({assetContentFullScreen: null});
                if (window.history?.state?.viewAsset) {
                    window.history.back();
                } else {
                    window.history.pushState({}, '', '#');
                }
            },
            stopPropagation: e => e.stopPropagation(),
            updateAssets: (assets, error) => {
                this.setState({assets, error, loaded: true});
            },
            updateRefreshHash: (refreshHash) => {
                if (refreshHash !== this.state.refreshHash) {
                    this.setState({refreshHash})
                    AssetLoader.reloadAssets();
                }
            },
            onMarkdownLoad: () => {
                this.cb.onHashChange();
            },
            onHashChange: () => {
                const {hash} = document.location;
                if (hash) {
                    if (hash.startsWith('#viewAsset=')) {
                    } else {
                        const idString = hash.substring(1);
                        const headerElm = [].find.call(document.querySelectorAll('h1, h2, h3, h4, h5, h6'), header => header.getAttribute('id') === idString);

                        if (headerElm) {
                            headerElm.classList.add('highlighted');
                            scrollIntoViewPersistent(headerElm);
                            return;
                        }
                    }
                }
            }
        }
    }

    componentDidMount() {
        if (!this.state.loaded && !this.state.refreshHash)
            AssetLoader.reloadAssets(true);
        window.addEventListener('popstate', this.cb.onPopState)
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
            ...this.cb, ...this.props, ...this.state,
            getIterator: () => new AssetIterator(this.state.assets),
            showFullScreenAsset: this.cb.showFullScreenAsset,
            addRenderedAsset: this.cb.addRenderedAsset
        }}>
            {this.renderContent()}
        </AssetBrowserContext.Provider>;
    }


    renderContent() {
        const {assets, loaded, error, assetContentFullScreen} = this.state;
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
            {assetContentFullScreen ? this.renderFullScreenAsset() : null}
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
        const {assetContentFullScreen} = this.state;
        return <AssetFullScreenView
            onClose={this.cb.closeFullScreen}
            {...assetContentFullScreen}
        />
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


