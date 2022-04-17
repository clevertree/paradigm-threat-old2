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
        assets: JSON
    },
`);

    const root = {
        JSON: GraphQLJSON,
        assets: handleAssetsAPI,
        report: handleReportAPI,
    };

    app.use(process.env.REACT_APP_ASSET_ENDPOINT, graphqlHTTP({
        schema: schema,
        rootValue: root,
        graphiql: true
    }));
}


function handleAssetsAPI() {
    const { assetList } = getConfig();
    return assetList;
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

