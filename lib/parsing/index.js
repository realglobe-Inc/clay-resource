/**
 * Parsing modules
 * @module parsing
 */

'use strict'

let d = (module) => module && module.default || module

module.exports = {
  get parseNameString () { return d(require('./parse_name_string')) }
}
