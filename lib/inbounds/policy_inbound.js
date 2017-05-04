/**
 * Define inbound function for policy
 * @function policyInbound
 * @param {ClayPolicy} policy - Policy to bind
 * @param {ClayResource} resource - Resource of entities
 * @returns {function} Inbound function
 */
'use strict'

const co = require('co')
const { LogPrefixes } = require('clay-constants')
const { PolicyError } = require('clay-errors')

/** @lends policyInbound */
function policyInbound (policy) {
  return function inbound (resource, attributesArray, actionContext = {}) {
    let { action } = actionContext
    return co(function * () {
      policy = yield Promise.resolve(policy)
      for (let attributes of attributesArray) {
        if (!policy) {
          continue
        }
        if (policy.format) {
          attributes = policy.format(attributes)
        } else {
          console.warn('`policy.format` is not found. Perhaps you are using older version of clay-policy.')
        }
        let policyError = policy.validate(attributes)
        if (policyError) {
          throw policyError
        }
        let uniqueFilters = policy.uniqueFilters(attributes)
        for (let uniqueFilter of uniqueFilters) {
          let exists = yield resource.exists(uniqueFilter)
          if (exists) {
            let error = new PolicyError('Unique constraint violation', { values: uniqueFilter })
            delete error.stack
            throw error
          }
        }

        switch (action) {
          case 'create':
          case 'createBulk': {
            let defaults = policy.defaultsFor(attributes)
            Object.assign(attributes, defaults)
            break
          }
          default:
            break
        }
      }
      return attributesArray
    })
  }
}

module.exports = policyInbound
