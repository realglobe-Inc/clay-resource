/**
 * Define inbound function for policy
 * @function policyInbound
 * @param {ClayResource} resource - Resource of entities
 * @returns {function} Inbound function
 */
'use strict'

const co = require('co')
const { LogPrefixes } = require('clay-constants')

/** @lends policyInbound */
function policyInbound (policy) {
  return function inbound (attributesArray) {
    return co(function * () {
      for (let attributes of attributesArray) {
        let policyError = policy && policy.validate(attributes)
        if (policyError) {
          throw policyError
        }
      }
      return attributesArray
    })
  }
}

module.exports = policyInbound
