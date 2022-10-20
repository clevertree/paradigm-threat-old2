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
import AssetSearch from "../../search/AssetSearch.js";
import ChangeLogAsset from "../changelog/ChangeLogAsset.js";
import HiddenAsset from "../hidden/HiddenAsset.js";

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
// TODO: process meta keywords and highlight on page
registerTag('meta', (tagName, props, children) => <MetaAsset {...props}>{children}</MetaAsset>)
registerTag('nav', (tagName, props, children) => <NavAsset {...props}>{children}</NavAsset>)
registerTag('hidden', (tagName, props, children) => <HiddenAsset {...props}>{children}</HiddenAsset>)

registerTag('chatroom', (tagName, props, children) => <ChatRoomAsset {...props}>{children}</ChatRoomAsset>)
registerTag('changelog', (tagName, props, children) => <ChangeLogAsset {...props}>{children}</ChangeLogAsset>)
registerTag('headerList', (tagName, props, children) => <HeaderListAsset {...props}>{children}</HeaderListAsset>)
registerTag('assetSearch', (tagName, props, children) => <AssetSearch {...props}>{children}</AssetSearch>)
registerTag('assetRenderer', (tagName, {key, ...props}, children) => <div className="asset-spread" key={key}>
    <AssetRenderer {...props}>{children}</AssetRenderer>
</div>)

// TODO: asset collection in global context?

export function getMarkdownOptions(pathname, overrides = null) {
    return {
        wrapper: React.Fragment,
        overrides,
        createElement,
    }

    function createElement(tagName, props, children) {
        let finalProps = {...props};
        // if (typeof tagName === 'string' && collection !== null) {
        //     finalProps.ref = elm => {
        //         if (elm instanceof React.Component
        //             && collection.indexOf(elm) === -1)
        //             collection.push(elm);
        //     }
        // }
        if (props.class) {
            finalProps.className = finalProps.class;
            delete finalProps.class;
        }
        if (props.src) {
            finalProps.originalSrc = props.src;
            finalProps.src = resolveAssetURL(props.src + '', pathname);
            let found = unusedAssets.indexOf(finalProps.src);
            if (found !== -1) {
                unusedAssets.splice(found, 1);
            }
        }
        if (customTags[tagName])
            return customTags[tagName](tagName, finalProps, children)

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