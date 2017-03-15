/**
 * Format functions
 * @module formatters
 */

'use strict'

let d = (module) => module && module.default || module

module.exports = {
  get annotationStripFormatter () { return d(require('./annotation_strip_formatter')) },
  get entityRefFormatter () { return d(require('./entity_ref_formatter')) }
}
