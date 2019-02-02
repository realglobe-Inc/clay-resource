/**
 * Format functions
 * @module outbounds
 */

'use strict'


const annotationOutbound = require('./annotation_outbound')
const refOutbound = require('./ref_outbound')

exports.annotationOutbound = annotationOutbound
exports.refOutbound = refOutbound

module.exports = {
  annotationOutbound,
  refOutbound
}
