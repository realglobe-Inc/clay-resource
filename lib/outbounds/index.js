/**
 * Format functions
 * @module outbounds
 */

'use strict'

let d = (module) => module && module.default || module

module.exports = {
  get annotationOutbound () { return d(require('./annotation_outbound')) },
  get entityOutbound () { return d(require('./entity_outbound')) },
  get refOutbound () { return d(require('./ref_outbound')) }
}
