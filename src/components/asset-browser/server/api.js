import {graphqlHTTP} from "express-graphql";


import {buildSchema} from "graphql";
import {KEY_DIRS, KEY_FILES} from "../constants.js";
import getConfig from "./config.js";
import fs from "fs";
import path from "path";


export default function setupAPI(app) {
// GraphQL schema
    var schema = buildSchema(`
    type Query {
        assets(path: String): AssetDirectory
    },
    type AssetDirectory {
        ${KEY_FILES}: [String]
        ${KEY_DIRS}: [AssetDirectory]
    }
`);

    var root = {
        assets: handleAssetsAPI,
        report: handleReportAPI,
    };

    app.use(process.env.REACT_APP_ASSET_ENDPOINT, graphqlHTTP({
        schema: schema,
        rootValue: root,
        graphiql: true
    }));
}


function handleAssetsAPI(args) {
    const { assetList } = getConfig();

    let pointer = assetList;
    if(args.path) {
        const pathSplit = args.path.split('/');
        for(const pathFrag of pathSplit) {
            if(!pathFrag)
                continue;
            if(!pointer[KEY_DIRS][pathFrag])
                throw new Error("Invalid path: " + args.path);
            pointer = pointer[KEY_DIRS][pathFrag];
        }
    }

    return pointer;
}

function handleReportAPI(args) {
    const { assetPath } = getConfig();

    const reportPath = process.env.REACT_APP_ASSET_GOACCESS_REPORT;
    if(!reportPath)
        throw new Error( "Missing process.env.REACT_APP_ASSET_GOACCESS_REPORT")
    const reportJSONString = fs.readFileSync(path.resolve(assetPath + reportPath), 'utf8');
    const reportJSON = JSON.parse(reportJSONString);
    if(args.path) {
        let pointer = reportJSON;
        const pathSplit = args.path.split('/');
        for(const pathFrag of pathSplit) {
            if(!pathFrag)
                continue;
            if(!pointer[pathFrag])
                throw new Error("Invalid path: " + args.path);
            pointer = pointer[pathFrag];
        }
        return pointer;
    }

    return reportJSON;
}