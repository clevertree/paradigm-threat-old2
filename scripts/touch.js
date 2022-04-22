import fs from "fs";
import {fileURLToPath} from "url";
import {dirname} from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const touchFilePath = dirname(__dirname) + '/src/.touch.js';
fs.writeFileSync(touchFilePath,
    `const Touch = ${new Date().getTime()};`
    + `export default Touch;`);
console.log('Updated touch file', touchFilePath)