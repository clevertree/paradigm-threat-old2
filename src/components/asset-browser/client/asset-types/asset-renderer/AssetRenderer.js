import * as React from "react";
import PropTypes from "prop-types";
import MarkdownAsset from "../markdown/MarkdownAsset.js";
import ImageAsset from "../image/ImageAsset.js";
import VideoAsset from "../video/VideoAsset.js";
import PDFAsset from "../pdf/PDFAsset.js";
import UnknownAsset from "../unknown/UnknownAsset.js";
import {getUnusedAssets} from "../markdown/markdownOptions.js";

export default class AssetRenderer extends React.Component {
    /** Property validation **/
    static propTypes = {
        children: PropTypes.array,
    };

    static defaultProps = {
        children: [],
        source: 'children'
    }


    render() {
        let fileList;
        switch (this.props.source) {
            default:
            case 'children':
                fileList = this.props.children;
                break;
            case 'unused':
                fileList = getUnusedAssets()
                break;
        }
        if (!Array.isArray(fileList))
            throw new Error("Invalid file list in props.children: " + typeof fileList)
        return fileList.map((filePath, i) => this.renderFile(filePath, i))
    }

    renderFile(filePath, key) {
        const ext = filePath.split('.').pop().toLowerCase();
        const props = {
            src: filePath,
            key,
            className: 'float'
        }
        switch (ext) {
            case 'md':
                return <article className={props.className} key={key}>
                    <MarkdownAsset file={filePath}/>;
                </article>
            case 'img':
            case 'jpg':
            case 'jpeg':
            case 'png':
            case 'gif':
            case 'svg':
            case 'ppm':
                return <ImageAsset {...props}/>;
            case 'm4v':
            case 'mp4':
            case 'mkv':
                return <VideoAsset {...props}/>;
            case 'pdf':
                return <PDFAsset {...props}/>;
            default:
                return <UnknownAsset {...props}/>;
        }
    }
}