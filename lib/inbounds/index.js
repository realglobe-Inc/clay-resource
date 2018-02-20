/**
 * Define inbound functions
 * @module inbounds
 */

'use strict'

const d = (module) => module && module.default || module

const policyInbound = d(require('./policy_inbound'))
const refInbound = d(require('./ref_inbound'))

module.exports = {
  policyInbound,
  refInbound
}
