/**
 * Parser functions
 * @module parsers
 */

'use strict'

let d = (module) => module && module.default || module

module.exports = {
  get entityRefParser () { return d(require('./entity_ref_parser')) }
}
