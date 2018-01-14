/**
 * Mixin for policy feature
 * @function policyMix
 * @param {function} BaseClass - Class to mix
 * @returns {function} Mixed class
 */
'use strict'

const {ClayPolicy, isPolicy} = require('clay-policy')
const {ResourceEvents, ReservedResources} = require('clay-constants')
const clayResourceName = require('clay-resource-name')
const {policyInbound} = require('../inbounds')
const {POLICY} = ReservedResources
const {POLICY_SET, POLICY_REMOVE} = ResourceEvents

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
      this._policy = null
      this.addPrepareTask(POLICY_PREPARE, () => Promise.resolve(this._policy).then((policy) => {
        this._policy = policy
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
      if (arguments.length === 0) {
        return this._policy
      }
      return this.setPolicy(policy)
    }

    /**
     * Get the policy
     * @returns {?ClayPolicy}
     */
    getPolicy () {
      return this._policy
    }

    /**
     * Set policy
     * @param policy
     * @returns {PolicyMix} this
     */
    setPolicy (policy) {
      policy = policy && asPolicy(policy)

      this._policy = policy
      this.addInbound(POLICY_INBOUND, policyInbound(policy, this))
      this.emit(POLICY_SET, {policy})
      return this
    }

    /**
     * Remove policy
     */
    removePolicy () {
      this._policy = null
      this.removeInbound(POLICY_INBOUND)
      this.emit(POLICY_REMOVE)
    }

    /**
     * Fetch policy from db
     * @param {string} digest
     * @returns {Promise<ClayPolicy>}
     */
    async fetchPolicy (digest) {
      const {policyResource} = this
      const resourceName = clayResourceName(this)

      const policyData = await policyResource.first({digest, resourceName})
      const policy = policyData && policyData.policy
      if (!policy) {
        throw new Error(`Unknown policy: ${digest}`)
      }
      return new ClayPolicy(policy)
    }

    /**
     * Save policy
     * @param {ClayPolicy} policy
     * @returns {Promise.<string>} Digest of saved policy
     */
    async savePolicy (policy) {
      const {policyResource} = this
      policy = policy && asPolicy(policy)
      const resourceName = clayResourceName(this)

      const digest = policy.toDigest()
      const {id} = await policyResource.of({digest, resourceName})
      await policyResource.update(id, {policy: policy.toValues()})
      return digest
    }

    get policyResource () {
      return this.internal(POLICY)
    }
  }

  return PolicyMixed
}

module.exports = policyMix
