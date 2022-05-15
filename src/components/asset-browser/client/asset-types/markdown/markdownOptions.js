import * as React from "react";

import "./MarkdownAsset.scss"
import ImageAsset from "../image/ImageAsset.js";

import MetaAsset from "../meta/MetaAsset.js";
import NavAsset from "../nav/NavAsset.js";
import AssetRenderer from "../asset-renderer/AssetRenderer.js";
import {resolveAssetURL} from "../../util/ClientUtil.js";
import ChatRoomAsset from "../chatroom/ChatRoomAsset.js";
import VideoAsset from "../video/VideoAsset.js";
import HeaderListAsset from "../list/HeaderListAsset.js";
import ErrorBoundary from "../../error/ErrorBoundary.js";
import AssetSearch from "../../search/AssetSearch.js";

const customTags = {};
let unusedAssets = [];

/**
 * Callback for adding two numbers.
 *
 * @callback tagCallback
 * @param {string} tagName - Tag Name.
 * @param {object} props - Tag Props.
 * @param {any} children - Tag Children.
 */

/**
 *
 * @param tagName
 * @param {tagCallback} tagCallback - A callback to run.
 */
export function registerTag(tagName, tagCallback) {
    customTags[tagName] = tagCallback;
}

registerTag('img', (tagName, props, children) => <ImageAsset {...props}>{children}</ImageAsset>)
registerTag('video', (tagName, props, children) => <VideoAsset {...props}>{children}</VideoAsset>)
registerTag('meta', (tagName, props, children) => <MetaAsset {...props}>{children}</MetaAsset>)
registerTag('nav', (tagName, props, children) => <NavAsset {...props}>{children}</NavAsset>)
registerTag('chatroom', (tagName, props, children) => <ChatRoomAsset {...props}>{children}</ChatRoomAsset>)
registerTag('headerList', (tagName, props, children) => <HeaderListAsset {...props}>{children}</HeaderListAsset>)
registerTag('assetSearch', (tagName, props, children) => <AssetSearch {...props}>{children}</AssetSearch>)
registerTag('assetRenderer', (tagName, {key, ...props}, children) => <div className="asset-spread" key={key}>
    <AssetRenderer {...props}>{children}</AssetRenderer>
</div>)

export function getMarkdownOptions(pathname) {

    return {
        wrapper: React.Fragment,
        createElement,
    }

    function createElement(tagName, props, children) {
        let finalProps = {...props};
        if (props.class) {
            finalProps.className = finalProps.class;
            delete finalProps.class;
        }
        if (props.src) {
            finalProps.src = resolveAssetURL(props.src + '', pathname);
            let found = unusedAssets.indexOf(finalProps.src);
            if (found !== -1) {
                unusedAssets.splice(found, 1);
            }
        }
        if (customTags[tagName])
            return <ErrorBoundary assetName={tagName} key={props.key}>
                {customTags[tagName](tagName, finalProps, children)}
            </ErrorBoundary>;

        // console.log('renderTag', tagName, finalProps, children)
        return React.createElement(tagName, finalProps, children);
    }

}

export function setUnusedAssets(list = []) {
    unusedAssets = list;
}

export function getUnusedAssets() {
    return unusedAssets;
}