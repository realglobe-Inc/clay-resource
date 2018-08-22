/**
 * Format functions
 * @module outbounds
 */

'use strict'

const _d = (module) => module && module.default || module

const annotationOutbound = _d(require('./annotation_outbound'))
const refOutbound = _d(require('./ref_outbound'))

module.exports = {
  annotationOutbound,
  refOutbound
}
