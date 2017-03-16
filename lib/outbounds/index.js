/**
 * Format functions
 * @module outbounds
 */

'use strict'

let d = (module) => module && module.default || module

module.exports = {
  get annotationStripOutbound () { return d(require('./annotation_strip_outbound')) },
  get entityRefOutbound () { return d(require('./entity_ref_outbound')) }
}
