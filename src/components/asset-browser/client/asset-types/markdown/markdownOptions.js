import * as React from "react";

import "./MarkdownAsset.scss"
import ImageAsset from "../image/ImageAsset.js";
import AssetBrowserContext from "../../context/AssetBrowserContext.js";

import MetaAsset from "../meta/MetaAsset.js";
import NavAsset from "../nav/NavAsset.js";
import AssetRenderer from "../asset-renderer/AssetRenderer.js";
import {resolveAssetURL} from "../../util/ClientUtil.js";

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
registerTag('meta', (tagName, props, children) => <MetaAsset {...props}>{children}</MetaAsset>)
registerTag('nav', (tagName, props, children) => <NavAsset {...props}>{children}</NavAsset>)
registerTag('assetRenderer', (tagName, {key, ...props}, children) => <section key={key}>
    <AssetRenderer {...props}>{children}</AssetRenderer>
</section>)

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
            return customTags[tagName](tagName, finalProps, children);

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