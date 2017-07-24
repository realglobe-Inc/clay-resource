/**
 * Define inbound function for resource
 * @function refInbound
 * @param {ClayResource} refResource - Resource of entities
 * @returns {function} Inbound function
 */
'use strict'

const {LogPrefixes} = require('clay-constants')
const {parse: parseRef, refTo} = require('clay-resource-ref')
const clayEntity = require('clay-entity')
const clayResourceName = require('clay-resource-name')
const {RESOURCE_PREFIX} = LogPrefixes

/** @lends refInbound */
function refInbound (refResource) {
  const refResourceName = String(clayResourceName(refResource))

  async function inboundAttribute (name, attribute) {
    if (!attribute) {
      return attribute
    }
    if (Array.isArray(attribute)) {
      return Promise.all(attribute.map((attribute) => inboundAttribute(name, attribute)))
    }
    let hasAs = attribute.$$as
    let isEntity = clayEntity.isEntity(attribute)
    if (isEntity || hasAs) {
      if (!isEntity) {
        attribute = clayEntity(attribute)
      }
      if (!hasAs) {
        console.warn(`${RESOURCE_PREFIX} You cannot use "${attribute}" as ref of "${name}" since it is not annotated`)
        return attribute
      }
      let hit = String(hasAs) === refResourceName
      if (hit) {
        attribute = {$ref: refTo(refResource, attribute.id)}
      }
    }
    let $ref = parseRef(attribute && attribute.$ref)
    if (!$ref) {
      return attribute
    }
    let hit = String($ref.resource) === refResourceName
    if (!hit) {
      return attribute
    }
    let has = await refResource.has($ref.id)
    if (!has) {
      console.warn(`Failed to resolve ref: "${$ref.id}" on "${refResourceName}"`)
    }
    return attribute
  }

  return async function inbound (resource, attributesArray) {
    for (let attributes of attributesArray) {
      for (let name of Object.keys(attributes)) {
        let attribute = attributes[name]
        attributes[name] = await inboundAttribute(name, attribute)
      }
    }
    return attributesArray
  }
}

module.exports = refInbound
