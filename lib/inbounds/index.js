/**
 * Define inbound functions
 * @module inbounds
 */

'use strict'

let d = (module) => module && module.default || module

module.exports = {
  get entityRefInbound () { return d(require('./entity_ref_inbound')) }
}
