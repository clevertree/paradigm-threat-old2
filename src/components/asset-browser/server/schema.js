import {GraphQLInt, GraphQLList, GraphQLObjectType, GraphQLSchema, GraphQLString} from "graphql";
import {GraphQLJSON} from "graphql-type-json";
import getConfig from "./config.js";
import path from "path";
import fs from "fs";
import AssetIterator from "../util/AssetIterator.js";
import * as readline from "readline";
import {simpleGit} from 'simple-git';

// const SearchResult = new GraphQLObjectType({
//     name: 'Address',
//     fields: {
//         href: {type: GraphQLString},
//         // title: {type: GraphQLString},
//     }
// });


const fields = {
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
        type: new GraphQLList(GraphQLString),
        args: {
            keywords: {type: GraphQLString},
        },
        resolve: async (_, {keywords: keywordString}) => {
            const {assetList, assetPath} = getConfig();
            const iterator = new AssetIterator(assetList);
            const fileList = iterator.searchByFile('.md');
            const filteredFileList = [];
            for (const filePath of fileList) {
                const absFilePath = path.join(assetPath, filePath);
                const found = await searchFileForKeywords(absFilePath, keywordString)
                if (found)
                    filteredFileList.push(filePath + "#scrollHighlight=" + keywordString);
            }
            return filteredFileList;
        }
    },

    changeLog: {
        type: new GraphQLList(GraphQLJSON),
        args: {
            maxCount: {type: GraphQLInt, defaultValue: 6},
        },
        resolve: async (_, {maxCount}) => {
            const git = getGitInstance();
            const {all} = await git.log({maxCount});
            return all.map(({hash, date, message, author_name}) => ({
                hash, date, message, author_name
            })).sort((a, b) => new Date(b.date) - new Date(a.date));
        }
    },
};

let gitInstance;

function getGitInstance() {
    if (!gitInstance) {
        const {assetPath} = getConfig();
        const options = {
            baseDir: assetPath,
            binary: 'git',
            maxConcurrentProcesses: 6,
            trimmed: false,
        };
        gitInstance = simpleGit(options);
    }
    return gitInstance;
}


export const schema = new GraphQLSchema({
    query: new GraphQLObjectType({
        name: "Assets",
        fields
    })
});

async function searchFileForKeywords(absFilePath, keywordString) {
    const keywords = keywordString.split(/[,;]+/g).filter(k => k).map(k => k.trim())
        .map(keyword => new RegExp(keyword, "i"));
    return await new Promise((resolve, reject) => {
        const found = new Array(keywords.length).fill(false);
        const rl = readline.createInterface({
            input: fs.createReadStream(absFilePath),
            output: process.stdout,
            terminal: false
        });
        rl.on('line', (line) => {
            for (const i in keywords) {
                const keyword = keywords[i];
                if (keyword.test(line)) {
                    found[i] = true;
                    if (found.every(t => t)) {
                        rl.close();
                        resolve(true);
                        break;
                    }
                }

            }
        });
        rl.on('close', function () {
            if (!found.every(t => t)) {
                resolve(false);
            }
        });
        rl.on('error', reject);
    })
}


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

