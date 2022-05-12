import {
    GraphQLObjectType,
    GraphQLSchema,
    GraphQLString,
} from "graphql";
import {GraphQLJSON} from "graphql-type-json";
import * as GraphQLHelix from "graphql-helix";

import getConfig from "./config.js";
import fs from "fs";
import path from "path";



export default function setupAPI(app) {
    app.use(process.env.REACT_APP_ASSET_ENDPOINT, async (req, res) => {
        // Create a generic Request object that can be consumed by Graphql Helix's API
        const request = {
            body: req.body,
            headers: req.headers,
            method: req.method,
            query: req.query,
        };

        // Determine whether we should render GraphiQL instead of returning an API response
        if (GraphQLHelix.shouldRenderGraphiQL(request)) {
            res.send(GraphQLHelix.renderGraphiQL());
        } else {
            // Extract the Graphql parameters from the request
            const { operationName, query, variables } = GraphQLHelix.getGraphQLParameters(request);

            // Validate and execute the query
            const result = await GraphQLHelix.processRequest({
                operationName,
                query,
                variables,
                request,
                schema,
            });

            // processRequest returns one of three types of results depending on how the server should respond
            // 1) RESPONSE: a regular JSON payload
            // 2) MULTIPART RESPONSE: a multipart response (when @stream or @defer directives are used)
            // 3) PUSH: a stream of events to push back down the client for a subscription
            // The "sendResult" is a NodeJS-only shortcut for handling all possible types of Graphql responses,
            // See "Advanced Usage" below for more details and customizations available on that layer.
            await GraphQLHelix.sendResult(result, res);
        }
    });
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

const schema = new GraphQLSchema({
    query: new GraphQLObjectType({
        name: "Assets",
        fields: {
            assets: {
                type: GraphQLJSON,
                args: {},
                resolve: (_, args) => {
                    const { assetList } = getConfig();
                    return assetList;
                }
            },
            report: {
                type: GraphQLJSON,
                args: {
                    path: {type: GraphQLString},
                },
                resolve: (_, args) => {
                    const { assetPath } = getConfig();
                    const reportPath = path.join(assetPath, process.env.REACT_APP_ASSET_SITE_DIRECTORY, process.env.REACT_APP_ASSET_GOACCESS_REPORT_JSON);
                    const reportJSONString = fs.readFileSync(reportPath, 'utf8');
                    const reportJSON = JSON.parse(reportJSONString);
                    return traverseObject(reportJSON, args.path);
                }
            },
        }
    }),
});