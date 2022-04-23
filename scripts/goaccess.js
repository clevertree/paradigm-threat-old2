import {config} from "dotenv";
import child_process from "child_process";
import path from "path";
import {fileURLToPath} from "url";

// Locate root directory
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootPath = path.dirname(__dirname);

// Change to root directory
process.chdir(rootPath)

// Load environment variables
config();


if(!process.env.REACT_APP_ASSET_PATH)
    throw new Error(".env file not loaded: " + rootPath);

const {
    REACT_APP_ASSET_PATH: assetPath,
    REACT_APP_ASSET_SITE_DIRECTORY: siteDirectory,
    REACT_APP_ASSET_GOACCESS_REPORT_HTML: reportHTMLPath,
    REACT_APP_ASSET_GOACCESS_REPORT_JSON: reportJSONPath,
} = process.env;
const reportPath = path.join(rootPath, assetPath, siteDirectory);

child_process.exec('pkill goaccess', function (error, stdout, stderr) {
    error ? console.log("Existing goaccess process not found") : console.log("Killing existing goaccess process")
});

setTimeout(() => {

    const cmd = `/bin/zcat /var/log/nginx/paradigmthreat.access.log.*.gz | goaccess -o ${path.join(reportPath, reportHTMLPath)} -o ${path.join(reportPath, reportJSONPath)}`
        + ` --real-time-html`
        + ` --ignore-crawlers --log-format=COMBINED /var/log/nginx/paradigmthreat.access.log -`

    console.log("Executing ", cmd);
    const process = child_process.exec(cmd, function (error, stdout, stderr) {
        console.log('stdout: ' + stdout);
        console.log('stderr: ' + stderr);
        if (error !== null)
            throw error;
    });

    process.stdout.on('data', function(data) {
        console.log(data);
    });

    process.stderr.on('data', function(data) {
        console.error(data);
    });
}, 1000)
