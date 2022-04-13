import React from "react";
import PropTypes from "prop-types";

import Markdown from 'markdown-to-jsx';

import ImageAsset from "../image/ImageAsset";
import Touch from './../../../touch.js';
import ServerConfig from "../../../server/ServerConfig";
import AssetList from "../list/AssetList";

import "./MarkdownAsset.css";
import AssetBrowser from "../../AssetBrowser";
import VideoAsset from "../video/VideoAsset";


const serverConfig = new ServerConfig();


export default class MarkdownAsset extends React.Component {
    /** Property validation **/
    static propTypes = {
        src: PropTypes.string.isRequired,
    };

    constructor(props) {
        super(props);
        this.state = {
            loading: true,
            source: null
        }
        this.usedImages = [];
        this.options={
            overrides: {
                img: (props) => this.processImage(props),
                video: (props) => this.processVideo(props),
                assetList: (props) => this.processAssetList(props),
                assetListExtra: (props) => this.processAssetListExtra(props),
                meta: (props) => this.processMetaTag(props),
            },
        };
        // this.renderers = ReactMarkdown.Renderers = {
        //     nextImage: (url) => this.getNextImage(url),
        // };
    }

    componentDidMount() {
        this.loadAsset();
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        // console.log(this.constructor.name, this.props.src, prevProps.src);
        if(this.props.src !== prevProps.src)
            this.loadAsset()
    }

    render() {
        let className = 'asset-markdown ' + Touch;

        this.usedImages = [];
        return (
            <div className={className}>
                {this.state.loading ? `Loading ${this.props.src}` : <Markdown
                    children={this.state.source}
                    options={this.options}
                    // renderers={this.renderers}
                />}
            </div>
        );
    }

    async loadAsset() {
        this.setState({
            loading: true,
            source: `Loading: [${this.props.src}](${this.props.src})`
        });
        const response = await fetch(this.props.src);
        const source = await response.text();
        this.setState({
            loading: false,
            source
        }, () => this.scrollToHash());

    }


    scrollToHash() {
        // let hash = document.location.hash;
        // if(hash) {
        //     hash = hash.substr(1);
        //     let scrollElm = document.getElementById(hash); // TODO: check content, not document
        //     console.log("loaded", hash, scrollElm)
        //     if(scrollElm && scrollElm.scrollIntoView) {
        //         scrollElm.scrollIntoView();
        //         setTimeout(() => scrollElm.scrollIntoView(), 1);
        //     }
        // }
    }

    processImage(props) {
        let src = props.src;
        if(src) {
            if(src.substr(0, 1) === '/')
                src = '.' + src;
            src = serverConfig.getURL(src);
            if(this.usedImages.indexOf(src) === -1)
                this.usedImages.push(src);
        }
        // console.log('processImage', props);
        return <ImageAsset {...props} src={src}/>;
    }

    /** TODO: redundant **/
    processVideo(props) {
        let src = props.src;
        if(src) {
            if(src.substr(0, 1) === '/')
                src = '.' + src;
            src = serverConfig.getURL(src);
            if(this.usedImages.indexOf(src) === -1)
                this.usedImages.push(src);
        }
        // console.log('processImage', props);
        return <VideoAsset {...props} src={src}/>;
    }


    processAssetList(props) {
        return <AssetList
            {...props}
        />;
    }

    processAssetListExtra(props) {
        if(!this.props.files)
            return null;
        const urlList =
            this.props.files
                .map(file => serverConfig.getURL(file))
                .filter(url => this.usedImages.indexOf(url) === -1)
        // console.log('processImageList', props, urlList);
        return <AssetList className="spread">
            {urlList.map((src, i) => {
                return AssetBrowser.renderAsset(src, i);
            })}
        </AssetList>; //  <ImageAsset {...props} />;
    }

    processMetaTag(props) {
        // console.log('processMetaTag', props);
        let paramName = typeof props.property !== "undefined" ? 'property' : 'name';
        const key = props[paramName];
        const content = props.content;

        // TODO: fix meta tags on navigation
        switch(key) {
            case 'title':
                document.title = content;
                break;
            default:
                let elm = document.head.querySelector(`meta[${paramName}="${key}"]`)
                if(!elm) {
                    elm = document.createElement('meta');
                    elm[paramName] = key;
                    document.head.appendChild(elm);
                }
                elm.content = content;
                break;
        }
        return null; //  <ImageAsset {...props} />;
    }


}


