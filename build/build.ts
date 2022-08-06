/**
 * Prevent errors from typescript output including definition of exports.__esModule property.
 */

import fs = require('fs')

const INDEX_JS = './temp_js_logger.js'

fs.readFile(INDEX_JS, {encoding: 'utf-8'}, (err, data) => {
    if (err) {
        console.log(`error unable to read ${INDEX_JS}`)
        throw err
    }
    else {
        const exports_property = 'Object.defineProperty(exports, "__esModule"'
        let idx = data.indexOf(exports_property)
        if (idx != -1) {
            if (data[idx-1] !== '\n') {
                console.log('warning exports property not at beginning of line; skip conditional insert')
            }
            else {
                console.log(`info exports property found at ${INDEX_JS}:${idx}`)
                const condition = '(typeof exports !== "undefined") && '

                fs.writeFile(INDEX_JS, data.slice(0, idx) + condition + data.slice(idx), () => {
                    console.log(`info wrote conditional exports property to ${INDEX_JS}`)
                })
            }
        }
        else {
            console.log(`warning exports property not found in ${INDEX_JS}`)
        }
    }
})
