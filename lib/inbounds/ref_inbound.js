/**
 * Define inbound function for resource
 * @function refInbound
 * @param {ClayResource} refResource - Resource of entities
 * @returns {function} Inbound function
 */
'use strict'

const {LogPrefixes, EntitySpec} = require('clay-constants')
const {parse: parseRef, refTo} = require('clay-resource-ref')
const clayEntity = require('clay-entity')
const {clone} = require('asobj')
const clayResourceName = require('clay-resource-name')
const {RESOURCE_PREFIX} = LogPrefixes
const {RESERVED_ATTRIBUTES} = EntitySpec

/** @lends refInbound */
function refInbound (refResource) {
  const refResourceName = String(clayResourceName(refResource))

  async function inboundAttribute (resourceName, name, attribute, actionContext) {
    const {
      skipResolvingRefFor = [],
      suppressWarning = false,
    } = actionContext
    const skip = skipResolvingRefFor.includes(refResourceName) || skipResolvingRefFor.includes(name)
    if (skip) {
      return attribute
    }
    if (!attribute) {
      return attribute
    }
    if (Array.isArray(attribute)) {
      return Promise.all(attribute.map((attribute) => {
        if (Array.isArray(attribute)) {
          // Skip for nested array
          return attribute
        }
        return inboundAttribute(resourceName, name, attribute, actionContext)
      }))
    }
    const as = attribute.$$as
    const hasAs = Boolean(as)
    const isEntity = clayEntity.isEntity(attribute)
    if (isEntity || hasAs) {
      if (!hasAs) {
        if (!suppressWarning) {
          console.warn(`${RESOURCE_PREFIX} You cannot use "${attribute}" as ref of "${name}" since it is not annotated`)
        }
        return attribute
      }
      const hit = String(as) === refResourceName
      if (hit) {
        if (!attribute.id) {
          const values = clone(attribute, {without: RESERVED_ATTRIBUTES.split(',')})
          attribute = await refResource.create(values)
        }
        const $ref = refTo(refResource, attribute.id)
        if ($ref) {
          attribute = {$ref}
        }
      }
    }
    const isNullRef = attribute && attribute.hasOwnProperty('$ref') && attribute.$ref === null
    if (isNullRef) {
      return null
    }
    const $ref = parseRef(attribute && attribute.$ref)
    if (!$ref) {
      return attribute
    }
    const hit = String($ref.resource) === refResourceName
    if (!hit) {
      return attribute
    }
    const has = await refResource.has($ref.id)
    if (!has) {
      if (!suppressWarning) {
        console.warn(`Failed to resolve ref: "${$ref.id}" on "${refResourceName}"`)
      }
    }
    return attribute
  }

  return async function inbound (resource, attributesArray, actionContext = {}) {
    const resourceName = String(clayResourceName(resource))
    for (const attributes of attributesArray) {
      const names = Object.keys(attributes).filter((name) => !/^_/.test(name))
      for (const name of names) {
        const attribute = attributes[name]
        attributes[name] = await inboundAttribute(resourceName, name, attribute, actionContext)
      }
    }
    return attributesArray
  }
}

module.exports = refInbound
