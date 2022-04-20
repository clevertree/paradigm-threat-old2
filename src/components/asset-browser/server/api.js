import {graphqlHTTP} from "express-graphql";


import {buildSchema} from "graphql";
import {GraphQLJSON} from "graphql-type-json";

import getConfig from "./config.js";
import fs from "fs";
import path from "path";



export default function setupAPI(app) {
// GraphQL schema
    const schema = buildSchema(`
    scalar JSON
    type Query {
        assets(path: String): JSON
        report(path: String): JSON
    },
`);

    const root = {
        JSON: GraphQLJSON,
        assets: handleAssetsAPI,
        report: handleReportAPI,
    };

    app.use(path.join('/', process.env.REACT_APP_ASSET_ENDPOINT), graphqlHTTP({
        schema: schema,
        rootValue: root,
        graphiql: true
    }));
}


function handleAssetsAPI(args) {
    const { assetList } = getConfig();
    return traverseObject(assetList, args.path);
}

function handleReportAPI(args) {
    const { assetPath } = getConfig();

    const reportPath = path.join(assetPath, process.env.REACT_APP_ASSET_SITE_DIRECTORY, process.env.REACT_APP_ASSET_GOACCESS_REPORT_JSON);
    const reportJSONString = fs.readFileSync(reportPath, 'utf8');
    const reportJSON = JSON.parse(reportJSONString);
    return traverseObject(reportJSON, args.path);
}

function traverseObject(obj, path) {
    let pointer = obj;
    if(path) {
        const pathSplit = path.split(/[.\/]/g);
        for (const pathFrag of pathSplit) {
            if (!pathFrag)
                continue;
            if (!pointer.hasOwnProperty(pathFrag))
                throw new Error("Invalid path: " + path);
            pointer = pointer[pathFrag];
        }
    }
    return pointer;
}
