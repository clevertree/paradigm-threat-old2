import * as React from "react";
import PropTypes from "prop-types";
import MarkdownAsset from "../markdown/MarkdownAsset.js";
import ImageAsset from "../image/ImageAsset.js";
import VideoAsset from "../video/VideoAsset.js";
import PDFAsset from "../pdf/PDFAsset.js";
import UnknownAsset from "../unknown/UnknownAsset.js";

export default class AssetRenderer extends React.Component {
    /** Property validation **/
    static propTypes = {
        children: PropTypes.array,
        source: 'children'
    };

    static defaultProps = {
        children: []
    }


    render() {
        let fileList;
        switch(this.props.source) {
            case 'children':
                fileList = this.props.children;
                break;
            case 'unused':
                return 'TODO: Render Unused Assets';
        }
        if(!Array.isArray(fileList))
            throw new Error("Invalid file list in props.children")

        return fileList.map((filePath, i) => this.renderFile(filePath, i))
    }

    renderFile(filePath, key) {
        const ext = filePath.split('.').pop().toLowerCase();
        switch (ext) {
            case 'md':
                return <MarkdownAsset file={filePath} key={key}/>
            case 'img':
            case 'jpg':
            case 'jpeg':
            case 'png':
            case 'gif':
            case 'svg':
                return <ImageAsset src={filePath} alt={filePath} key={key}/>;
            case 'm4v':
            case 'mp4':
            case 'mkv':
                return <VideoAsset src={filePath} alt={filePath} key={key}/>;
            case 'pdf':
                return <PDFAsset src={filePath} alt={filePath} key={key}/>;
            default:
                return <UnknownAsset src={filePath} alt={filePath} key={key}/>;
        }
    }
}