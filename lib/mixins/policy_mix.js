/**
 * Mixin for policy feature
 * @function policyMix
 * @param {function} BaseClass - Class to mix
 * @returns {function} Mixed class
 */
'use strict'

/** @lends policyMix */
function policyMix (BaseClass) {
  class PolicyMix extends BaseClass {
    get $$policyMixed () {
      return true
    }

    constructor () {
      super(...arguments)
      const s = this
    }
  }

  return PolicyMix
}

module.exports = policyMix
