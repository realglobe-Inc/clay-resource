/**
 * Define inbound function for policy
 * @function policyInbound
 * @param {ClayPolicy} policy - Policy to bind
 * @param {ClayResource} resource - Resource of entities
 * @returns {function} Inbound function
 */
'use strict'

const { LogPrefixes } = require('clay-constants')
const clayResourceName = require('clay-resource-name')
const { PolicyError } = require('clay-errors')
const { flatten } = require('objnest')
const { UNIQUE_VIOLATION } = require('clay-policy').Reasons

/** @lends policyInbound */
function policyInbound (policy) {
  return async function inbound (resource, attributesArray, actionContext = {}) {
    const resourceName = clayResourceName(resource)
    const {
      action,
      errorNamespace,
      skipPolicyCheck = false
    } = actionContext
    if (skipPolicyCheck) {
      return attributesArray
    }
    const idFor = (index) => {
      const { id, ids } = actionContext
      if (id) {
        return id
      }
      return ids && ids[index]
    }

    async function hasUniqueViolation (attributes, uniqueFilter, { id }) {
      const exists = await resource.exists(uniqueFilter)
      if (!exists) {
        return false
      }
      if (id) {
        const first = await resource.first(uniqueFilter)
        const isSelf = String(id) === String(first.id)
        return !isSelf
      }
      return true
    }

    policy = await Promise.resolve(policy)
    for (let [index, attributes] of attributesArray.entries()) {
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
          const defaults = policy.defaultsFor(attributes)
          Object.assign(attributes, defaults)
          policy.validateToThrow(attributes, {
            prefix: resourceName,
            namespace: errorNamespace
          })
          break
        }
        default:
          policy.validateToThrow(attributes, {
            prefix: resourceName,
            ignoreMissing: true,
            namespace: errorNamespace
          })
          break
      }

      const id = idFor(index)
      const uniqueFilters = policy.uniqueFilters(attributes)
      for (const uniqueFilter of uniqueFilters) {
        const hasViolation = await hasUniqueViolation(attributes, uniqueFilter, { id })
        if (hasViolation) {
          const attributesNames = Object.keys(uniqueFilter)
          const error = new PolicyError(`[${resourceName}] Unique constraint violation on ${attributesNames.join(',')}`, {
            conflict: errorNamespace ? flatten({ [errorNamespace]: uniqueFilter }) : uniqueFilter,
            reason: UNIQUE_VIOLATION
          })
          delete error.stack
          throw error
        }
      }
    }
    return attributesArray
  }
}

module.exports = policyInbound
