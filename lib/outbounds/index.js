/**
 * Format functions
 * @module outbounds
 */

'use strict'

const d = (module) => module && module.default || module

const annotationOutbound = d(require('./annotation_outbound'))
const refOutbound = d(require('./ref_outbound'))

module.exports = {
  annotationOutbound,
  refOutbound
}


exports.annotationOutbound = annotationOutbound
exports.refOutbound = refOutbound
