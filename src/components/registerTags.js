import React from "react";

import {registerTag} from "./asset-browser/client/asset-types/markdown/MarkdownAsset.js";

import HitCounter from "./asset-browser/client/asset-types/hit-counter/HitCounter.js";
// import HeaderTag from "./header/HeaderTag.js";

registerTag('hitCounter', (tagName, props, children) => <HitCounter {...props}>{children}</HitCounter>)
// registerTag('header', (tagName, props, children) => <HeaderTag {...props}>{children}</HeaderTag>)
