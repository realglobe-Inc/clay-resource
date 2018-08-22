/**
 * Define inbound functions
 * @module inbounds
 */

'use strict'

const _d = (module) => module && module.default || module

const policyInbound = _d(require('./policy_inbound'))
const refInbound = _d(require('./ref_inbound'))

module.exports = {
  policyInbound,
  refInbound
}
