import React from "react";

import {registerTag} from "./asset-browser/client/asset-types/markdown/markdownOptions.js";

import HitCounter from "./asset-browser/client/asset-types/hit-counter/HitCounter.js";

registerTag('hitCounter', (tagName, props, children) => <HitCounter {...props}>{children}</HitCounter>)
