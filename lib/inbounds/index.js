/**
 * Define inbound functions
 * @module inbounds
 */

'use strict'

let d = (module) => module && module.default || module

module.exports = {
  get refInbound () { return d(require('./ref_inbound')) }
}
