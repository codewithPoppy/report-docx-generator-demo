const fs = require('fs');

const RESULTS_PATH = __dirname + '/__mocks__/results';

function saveResultAsFile(name, buffer) {
    fs.writeFileSync(`${RESULTS_PATH}/${name}.xml`, buffer);
}

function getResult(name) {
    const buffer = fs.readFileSync(`${RESULTS_PATH}/${name}.xml`);
    return buffer.toString();
}

function cloneObject(obj) {
    return JSON.parse(JSON.stringify(obj));
}

module.exports = {
    saveResultAsFile,
    getResult,
    cloneObject
}
