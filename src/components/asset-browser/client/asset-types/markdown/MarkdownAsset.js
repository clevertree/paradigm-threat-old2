import * as React from "react";
import Markdown from 'markdown-to-jsx';
import PropTypes from "prop-types";

import "./MarkdownAsset.scss"
import AssetBrowserContext from "../../context/AssetBrowserContext.js";
import {getMarkdownOptions} from "./markdownOptions.js";
import ErrorBoundary from "../../error/ErrorBoundary.js";
import {useEffect} from "react";


class MarkdownAsset extends React.Component {
    /** Property validation **/
    static propTypes = {
        src: PropTypes.string.isRequired,
        onLoad: PropTypes.func,
        className: PropTypes.string,
        overrides: PropTypes.object,
        assetBrowser: PropTypes.object.isRequired
    };

    static defaultProps = {
        className: null,
        asset: false
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
        if (prevProps.src !== this.props.src) {
            this.setState({content: null, loaded: false});
            // console.log("Changing content: ", this.props.src);
            this.loadContent().then();
        }
        if (prevProps.refreshHash && (prevProps.refreshHash !== this.props.refreshHash)) {
            // console.log("Refreshing content: ", this.props.src, prevProps.refreshHash);
            this.loadContent().then();
        }
    }

    componentDidMount() {
        this.loadContent().then();
        let {assetBrowser, src} = this.props;
        assetBrowser.addRenderedAsset(src, this);
    }

    componentWillUnmount() {
        let {assetBrowser, src} = this.props;
        assetBrowser.removeRenderedAsset(src);
    }

    async loadContent() {
        const {src} = this.props;
        const response = await fetch(src);
        const content = await response.text()
        this.setState({
            content,
            loaded: true,
            pathname: src.substring(0, src.lastIndexOf("/") + 1)
        });
    }

    render() {
        let className = 'asset markdown';
        if (this.props.className)
            className += ' ' + this.props.className;
        const {loaded, pathname, content} = this.state;
        const {overrides, onLoad} = this.props;
        let output = "Loading: " + this.props.src;
        if (loaded)
            output = <MarkdownAssetContentRenderer
                overrides={overrides}
                onLoad={onLoad}
                pathname={pathname}
                {...this.props}
            >
                {content}
            </MarkdownAssetContentRenderer>
        if (this.props.asset) {
            output = <div className={className}>
                {output}
            </div>
        }
        return output;
    }
}

const MarkdownAssetContentRenderer = ({pathname, children, overrides, onLoad, options, className}) => {
    useEffect(() => {
        onLoad && onLoad()
    }, [onLoad])
    const markdownOptions = getMarkdownOptions(pathname, overrides);
    const props = {
        options: markdownOptions
    }
    if (className)
        props.className = className;
    return <ErrorBoundary assetName={"Markdown"}>
        <Markdown {...props}>
            {children}
        </Markdown>
    </ErrorBoundary>
}


export default class MarkdownAssetWrapper extends React.Component {
    render() {
        return <AssetBrowserContext.Consumer>
            {(assetBrowser) => {
                const refreshHash = assetBrowser.getRefreshHash();
                return <MarkdownAsset {...this.props} refreshHash={refreshHash} assetBrowser={assetBrowser}>
                    {this.props.children}
                </MarkdownAsset>;
            }}
        </AssetBrowserContext.Consumer>;
    }
}

