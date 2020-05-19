'use strict'

const { isEntity } = require('clay-entity')
const { parse: parseRef, refTo } = require('clay-resource-ref')
const { LogPrefixes } = require('clay-constants')
const clayResourceName = require('clay-resource-name')
const { RESOURCE_PREFIX } = LogPrefixes

/**
 * Define outbound to load entity refs
 * @function refOutbound
 * @param {ClayResource} refResource - Resource of entities
 * @returns {function} Outbound function
 */
function refOutbound (refResource) {
  const refResourceName = String(clayResourceName(refResource))
  const getAttributeRef = attribute => {
    const $ref = parseRef(attribute && attribute.$ref)
    if (!$ref) {
      return null
    }
    const hit = String($ref.resource) === refResourceName
    if (hit) {
      return $ref
    }
    return null
  }
  const eachEntityAttribute = async (entities, action) => {
    for (const entity of entities) {
      const attributeNames = Object.keys(entity).filter((name) => !/^_/.test(name))
      for (const attributeName of attributeNames) {
        const attribute = entity[attributeName]
        await action(entity, attributeName, attribute)
      }
    }
  }

  const normalizeAttribute = (attribute, actionContext) => {
    const {
      suppressWarning = false,
    } = actionContext
    if (!attribute) {
      return attribute
    }

    const isNullRef = attribute && attribute.hasOwnProperty('$ref') && attribute.$ref === null
    if (isNullRef) {
      return null
    }

    if (Array.isArray(attribute)) {
      return attribute.map(attribute => normalizeAttribute(attribute, actionContext))
    }

    if (isEntity(attribute)) {
      if (!attribute.$$as) {
        if (!suppressWarning) {
          console.warn(`${RESOURCE_PREFIX} You cannot use "${attribute}" as ref of "${name}" since it is not annotated`)
        }
        return attribute
      }
      const hit = String(attribute.$$as) === refResourceName
      if (hit) {
        attribute = {
          $ref: refTo(refResource, attribute.id)
        }
      }
    }

    return attribute
  }

  const shouldSKip = (skipResolvingRefFor, name) => skipResolvingRefFor.includes(refResourceName) || skipResolvingRefFor.includes(name)

  async function outboundAttribute (resourceName, name, attribute, actionContext, options = {}) {
    const { resolvedEntities } = options
    const {
      skipResolvingRefFor = [],
      ignoreCached = false,
      resolvedRefs = {},
    } = actionContext
    const skip = shouldSKip(skipResolvingRefFor, name)
    if (skip) {
      return attribute
    }
    if (!attribute) {
      return attribute
    }

    if (Array.isArray(attribute)) {
      return Promise.all(
        attribute.map((attribute) => {
          return outboundAttribute(resourceName, name, attribute, actionContext, options)
        })
      )
    }

    const $ref = getAttributeRef(attribute)
    if (!$ref) {
      return attribute
    }

    const refId = $ref.id
    const refKey = refTo(refResource, refId)
    const resolved = resolvedEntities[String(refId)] || resolvedRefs[refKey]
    if (resolved) {
      return resolved
    }
    const found = refResource.one(refId, {
      ignoreCached,
      skipResolvingRefFor: [...skipResolvingRefFor, resourceName].filter(Boolean),
      fromAction: actionContext.action
    })
    resolvedRefs[refKey] = found
    return found
  }

  /**
   * @function refOutbound
   * @param {Entity[]} - Entities
   * @param {Object} [actionContext={}]
   * @returns {Promise.<Entity[]>}
   */
  return async function outbound (resource, entities, actionContext = {}) {
    const resourceName = String(clayResourceName(resource))
    const skipResolvingRefFor = [...(actionContext.skipResolvingRefFor || []), resourceName].filter(Boolean)
    const refIds = new Set()
    await eachEntityAttribute(entities, async (entity, attributeName, attribute) => {
      entity[attributeName] = normalizeAttribute(attribute, actionContext)
      const ref = getAttributeRef(entity[attributeName])
      const skip = shouldSKip(skipResolvingRefFor, attributeName)
      if (ref && !skip) {
        refIds.add(String(ref.id))
      }
    })
    const resolvedEntities = refIds.size > 0 ? await refResource.oneBulk(Array.from(refIds), {
      ignoreCached: actionContext.ignoreCached,
      skipResolvingRefFor,
      fromAction: actionContext.action,
    }) : {}
    await eachEntityAttribute(entities, async (entity, attributeName, attribute) => {
      entity[attributeName] = await outboundAttribute(resourceName, attributeName, attribute, actionContext, {
        resolvedEntities
      })
    })
    return entities
  }
}

module.exports = refOutbound
