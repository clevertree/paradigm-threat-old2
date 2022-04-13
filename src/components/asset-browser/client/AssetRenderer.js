import * as React from "react";
import PropTypes from "prop-types";
import MarkdownContentLoader from "./assetTypes/markdown/MarkdownContentLoader.js";
import VideoAsset from "./assetTypes/video/VideoAsset.js";
import UnknownAsset from "./assetTypes/unknown/UnknownAsset.js";
import PDFAsset from "./assetTypes/pdf/PDFAsset.js";

export default class AssetRenderer extends React.Component {
    /** Property validation **/
    static propTypes = {
        fileList: PropTypes.array.isRequired,
        pathname: PropTypes.string.isRequired
    };

    static defaultProps = {
        pathname: ""
    }
    constructor(props) {
        super(props);
    }

    getAbsoluteURL(file) {
        let pathname = this.props.pathname;
        if(pathname[0] === '/')
            pathname = pathname.substring(1);
        return new URL(pathname + '/' + file, process.env.REACT_APP_SERVER_PUBLIC_URL || window.location.origin) + ''
    }

    render() {
        const { fileList } = this.props;
        if(fileList.indexOf('index.md') !== -1)
            return this.renderIndexMD();

        return fileList.map(file => this.renderFile(this.getAbsoluteURL(file)))
    }

    renderIndexMD() {
        const file = this.getAbsoluteURL('index.md');
        return <MarkdownContentLoader
            file={file}
        />;
    }

    renderFile(filePath) {
        const ext = filePath.split('.').pop().toLowerCase();
        console.log('WUT', filePath, ext);
        switch(ext) {
            case 'md':
                return <MarkdownContentLoader file={filePath} />
            case 'img':
            case 'jpg':
            case 'jpeg':
            case 'png':
            case 'gif':
            case 'svg':
                return <img src={filePath} alt={filePath} />;
            case 'm4v':
            case 'mp4':
            case 'mkv':
                return <VideoAsset src={filePath} alt={filePath}  />;
            case 'pdf':
                return <PDFAsset src={filePath} alt={filePath}  />;
            default:
                return <UnknownAsset src={filePath} alt={filePath}  />;
        }
    }
}