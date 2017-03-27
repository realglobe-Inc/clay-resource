/**
 * Mixin for policy feature
 * @function policyMix
 * @param {function} BaseClass - Class to mix
 * @returns {function} Mixed class
 */
'use strict'

const { ClayPolicy, isPolicy } = require('clay-policy')
const { ResourceEvents } = require('clay-constants')
const { policyInbound } = require('../inbounds')
const { POLICY_SET, POLICY_REMOVE } = ResourceEvents

const POLICY_INBOUND = 'policy:inbound'

/** @lends policyMix */
function policyMix (BaseClass) {
  /** @class PolicyMixed */
  class PolicyMixed extends BaseClass {
    get $$policyMixed () {
      return true
    }

    constructor () {
      super(...arguments)
      const s = this
      s._policy = null
    }

    /**
     * Get policy
     * @method PolicyMix#policy
     * @returns {ClayPolicy}
     */
    /**
     * Set policy
     * @method PolicyMix#policy
     * @param policy
     * @returns {PolicyMix} this
     */
    policy (policy) {
      const s = this
      if (arguments.length === 0) {
        return s._policy
      }
      return s.setPolicy(policy)
    }

    /**
     * Get the policy
     * @returns {?ClayPolicy}
     */
    getPolicy () {
      const s = this
      return s._policy
    }

    /**
     * Set policy
     * @param policy
     * @returns {PolicyMix} this
     */
    setPolicy (policy) {
      const s = this
      let needsConvert = policy && !isPolicy(policy)
      if (needsConvert) {
        policy = new ClayPolicy(policy)
      }
      s._policy = policy
      s.addInbound(POLICY_INBOUND, policyInbound(policy, s))
      s.emit(POLICY_SET, { policy })
    }

    /**
     * Remove policy
     */
    removePolicy () {
      const s = this
      s._policy = null
      s.removeInbound(POLICY_INBOUND)
      s.emit(POLICY_REMOVE)
    }
  }

  return PolicyMixed
}

module.exports = policyMix
