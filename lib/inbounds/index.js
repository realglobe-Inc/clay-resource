/**
 * Define inbound functions
 * @module inbounds
 */

'use strict'

let d = (module) => module && module.default || module

module.exports = {
  get policyInbound () { return d(require('./policy_inbound')) },
  get refInbound () { return d(require('./ref_inbound')) }
}
