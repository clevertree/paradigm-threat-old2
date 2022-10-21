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
        file: PropTypes.string.isRequired,
        onLoad: PropTypes.func,
        className: PropTypes.string,
        overrides: PropTypes.object
    };

    static defaultProps = {
        className: "markdown-body"
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
        if (prevProps.file !== this.props.file) {
            this.setState({content: null, loaded: false});
            // console.log("Changing content: ", this.props.file);
            this.loadContent().then();
        }
        if (prevProps.refreshHash && (prevProps.refreshHash !== this.props.refreshHash)) {
            // console.log("Refreshing content: ", this.props.file, prevProps.refreshHash);
            this.loadContent().then();
        }
    }

    componentDidMount() {
        // console.log("Loading content: ", this.props.file, this.state);
        this.loadContent().then();
    }

    async loadContent() {
        const {file} = this.props;
        const response = await fetch(file);
        const content = await response.text()
        this.setState({
            content,
            loaded: true,
            pathname: file.substring(0, file.lastIndexOf("/") + 1)
        });
    }

    render() {
        const {loaded, pathname, content} = this.state;
        const {overrides, onLoad} = this.props;
        if (!loaded)
            return "Loading: " + this.props.file;
        return <MarkdownAssetContentRenderer
            overrides={overrides} onLoad={onLoad} pathname={pathname}>
            {content}
        </MarkdownAssetContentRenderer>
    }
}

const MarkdownAssetContentRenderer = ({pathname, children, overrides, onLoad}) => {
    useEffect(() => {
        onLoad && onLoad()
    }, [onLoad])
    const markdownOptions = getMarkdownOptions(pathname, overrides);
    return <ErrorBoundary assetName={"Markdown"}>
        <Markdown options={markdownOptions}>
            {children}
        </Markdown>
    </ErrorBoundary>
}


export default class MarkdownAssetWrapper extends React.Component {
    render() {
        return <AssetBrowserContext.Consumer>
            {(assetBrowser) => {
                const refreshHash = assetBrowser.getRefreshHash();
                return <MarkdownAsset {...this.props} refreshHash={refreshHash}>
                    {this.props.children}
                </MarkdownAsset>;
            }}
        </AssetBrowserContext.Consumer>;
    }
}

