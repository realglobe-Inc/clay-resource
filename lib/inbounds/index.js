/**
 * Define inbound functions
 * @module inbounds
 */

'use strict'


const policyInbound = require('./policy_inbound')
const refInbound = require('./ref_inbound')

exports.policyInbound = policyInbound
exports.refInbound = refInbound

module.exports = {
  policyInbound,
  refInbound
}
