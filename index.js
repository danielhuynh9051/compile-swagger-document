#!/usr/bin/env node

const path = require('path');
const fs = require('fs');
const beautify = require("json-beautify");
const $RefParser = require('json-schema-ref-parser-sync');

function getParams() {
    let params = [];
    const args = process.argv.slice(2);
    args.forEach(function (val, index) {
        const tempPath = path.resolve(val);
        if (index == 0) {
            // from
            params[0] = {
                path: tempPath,
                label: 'get'
            };
        } else if (index == 1) {
            // to
            params[1] = {
                path: tempPath,
                label: 'save'
            };
        } else if (index == 2) {
            params[2] = (val == 'true') ? true : false;
        }

        if (index == 0 && params[index] && !fs.existsSync(tempPath)) {
            throw new Error('NOT FOUND path to ' + params[index].label + ' file [' + tempPath + ']');
        }
    });

    if (params[2] === undefined) {
        params[2] = true;
    }
    return params;
}

function convertPaths(content) {
    const {
        paths
    } = content;
    if (Array.isArray(paths)) {
        const temp = {};
        for (var i = 0; i < paths.length; ++i) {
            for (var j in paths[i]) {
                temp[j] = paths[i][j];
            }
        }
        return temp;
    } else {
        return paths;
    }
}

function compile() {
        const params = getParams();
        const format = params[2];
        const content = $RefParser.dereference(params[0].path);

        if (content) {
            if (content.paths) content.paths = convertPaths(content);
            fs.writeFileSync(params[1].path, format ? beautify(content, null, 2, 100) : JSON.stringify(content));
        } else {
            throw new Error('Cannot parse this file!');
        }
}

try {
    compile();
} catch (e) {
    console.log(e);
}