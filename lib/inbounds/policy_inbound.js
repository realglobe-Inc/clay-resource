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
const clayResourceName = require('clay-resource-name')
const { PolicyError } = require('clay-errors')

/** @lends policyInbound */
function policyInbound (policy) {
  return function inbound (resource, attributesArray, actionContext = {}) {
    let resourceName = clayResourceName(resource)
    let { action } = actionContext
    const idFor = (index) => {
      let { id, ids } = actionContext
      if (id) {
        return id
      }
      return ids && ids[ index ]
    }
    const hasUniqueViolation = (attributes, uniqueFilter, { id }) => co(function * () {
      let exists = yield resource.exists(uniqueFilter)
      if (!exists) {
        return false
      }
      if (id) {
        let first = yield resource.first(uniqueFilter)
        let isSelf = String(id) === String(first.id)
        return !isSelf
      }
      return true
    })

    return co(function * () {
      policy = yield Promise.resolve(policy)
      for (let [ index, attributes ] of attributesArray.entries()) {
        if (!policy) {
          continue
        }
        if (policy.format) {
          attributes = policy.format(attributes)
        } else {
          console.warn('`policy.format` is not found. Perhaps you are using older version of clay-policy.')
        }

        switch (action) {
          case 'create':
          case 'createBulk': {
            let defaults = policy.defaultsFor(attributes)
            Object.assign(attributes, defaults)
            policy.validateToThrow(attributes, {
              prefix: resourceName
            })
            break
          }
          default:
            policy.validateToThrow(attributes, {
              prefix: resourceName,
              ignoreMissing: true
            })
            break
        }

        let id = idFor(index)
        let uniqueFilters = policy.uniqueFilters(attributes)
        for (let uniqueFilter of uniqueFilters) {
          let hasViolation = yield hasUniqueViolation(attributes, uniqueFilter, { id })
          if (hasViolation) {
            let error = new PolicyError(`[${resourceName}] Unique constraint violation`, { values: uniqueFilter })
            delete error.stack
            throw error
          }
        }
      }
      return attributesArray
    })
  }
}

module.exports = policyInbound
