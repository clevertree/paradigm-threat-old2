import {GraphQLObjectType, GraphQLSchema, GraphQLString, GraphQLList} from "graphql";
import {GraphQLJSON} from "graphql-type-json";
import getConfig from "./config.js";
import path from "path";
import fs from "fs";
import AssetIterator from "../util/AssetIterator.js";

const SearchResult = new GraphQLObjectType({
    name: 'Address',
    fields: {
        href: {type: GraphQLString},
        title: {type: GraphQLString},
    }
});

export const schema = new GraphQLSchema({
    query: new GraphQLObjectType({
        name: "Assets",
        fields: {
            assets: {
                type: GraphQLJSON,
                args: {},
                resolve: (_, args) => {
                    const {assetList} = getConfig();
                    return assetList;
                }
            },
            report: {
                type: GraphQLJSON,
                args: {
                    path: {type: GraphQLString},
                },
                resolve: (_, args) => {
                    const {assetPath} = getConfig();
                    const reportPath = path.join(assetPath, process.env.REACT_APP_ASSET_SITE_DIRECTORY, process.env.REACT_APP_ASSET_GOACCESS_REPORT_JSON);
                    const reportJSONString = fs.readFileSync(reportPath, 'utf8');
                    const reportJSON = JSON.parse(reportJSONString);
                    return traverseObject(reportJSON, args.path);
                }
            },
            search: {
                type: new GraphQLList(SearchResult),
                args: {
                    keywords: {type: GraphQLString},
                },
                resolve: async (_, args) => {
                    const {assetList} = getConfig();
                    const iterator = new AssetIterator(assetList);
                    const fileList = iterator.searchByFile('.md');
                    return fileList.map((fileUrl) => {
                        return {href: fileUrl, title: fileUrl}
                    });
                }
            },
        }
    }),
});


function traverseObject(obj, path) {
    let pointer = obj;
    if (path) {
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

