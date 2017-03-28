/**
 * Mixin for policy feature
 * @function policyMix
 * @param {function} BaseClass - Class to mix
 * @returns {function} Mixed class
 */
'use strict'

const { ClayPolicy, isPolicy } = require('clay-policy')
const { ResourceEvents, ReservedResources } = require('clay-constants')
const clayResourceName = require('clay-resource-name')
const { policyInbound } = require('../inbounds')
const { POLICY } = ReservedResources
const { POLICY_SET, POLICY_REMOVE } = ResourceEvents
const co = require('co')

const POLICY_INBOUND = 'policy:inbound'
const POLICY_PREPARE = 'policy:prepare'

const asPolicy = (policy) => isPolicy(policy) ? policy : new ClayPolicy(policy)

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
      s.addPrepareTask(POLICY_PREPARE, () => Promise.resolve(s._policy).then((policy) => {
        s._policy = policy
      }))
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
      policy = policy && asPolicy(policy)

      s._policy = policy
      s.addInbound(POLICY_INBOUND, policyInbound(policy, s))
      s.emit(POLICY_SET, { policy })
      return s
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

    /**
     * Fetch policy from db
     * @param {string} digest
     * @returns {Promise<ClayPolicy>}
     */
    fetchPolicy (digest) {
      const s = this
      const { policyResource } = s
      const resourceName = clayResourceName(s)
      return co(function * () {
        let policyData = yield policyResource.first({ digest, resourceName })
        let policy = policyData && policyData.policy
        if (!policy) {
          throw new Error(`Unknown policy: ${digest}`)
        }
        return new ClayPolicy(policy)
      })
    }

    /**
     * Save policy
     * @param {ClayPolicy} policy
     * @returns {Promise.<string>} Digest of saved policy
     */
    savePolicy (policy) {
      const s = this
      const { policyResource } = s
      policy = policy && asPolicy(policy)
      const resourceName = clayResourceName(s)
      return co(function * () {
        let digest = policy.toDigest()
        let { id } = yield policyResource.of({ digest, resourceName })
        yield policyResource.update(id, { policy: policy.toValues() })
        return digest
      })
    }

    get policyResource () {
      const s = this
      return s.internal(POLICY)
    }
  }

  return PolicyMixed
}

module.exports = policyMix
