/**
 * Define outbound to load entity refs
 * @function refOutbound
 * @param {ClayResource} refResource - Resource of entities
 * @returns {function} Outbound function
 */
'use strict'

const {isEntity} = require('clay-entity')
const {parse: parseRef, refTo} = require('clay-resource-ref')
const {LogPrefixes} = require('clay-constants')
const clayResourceName = require('clay-resource-name')
const {RESOURCE_PREFIX} = LogPrefixes

/** @lends refOutbound */
function refOutbound (refResource) {
  const refResourceName = String(clayResourceName(refResource))

  async function outboundAttribute (resourceName, name, attribute, actionContext) {
    let skip = actionContext.skipResolvingRefFor === refResourceName
    if (skip) {
      return attribute
    }

    if (Array.isArray(attribute)) {
      return Promise.all(
        attribute.map((attribute) => outboundAttribute(resourceName, name, attribute, actionContext))
      )
    }
    if (isEntity(attribute)) {
      if (!attribute.$$as) {
        console.warn(`${RESOURCE_PREFIX} You cannot use "${attribute}" as ref of "${name}" since it is not annotated`)
        return attribute
      }
      let hit = String(attribute.$$as) === refResourceName
      if (hit) {
        attribute = {$ref: refTo(refResource, attribute.id)}
      }
    }
    let $ref = parseRef(attribute && attribute.$ref)
    if (!$ref) {
      return attribute
    }
    let hit = String($ref.resource) === refResourceName
    if (hit) {
      return refResource.one($ref.id, {
        skipResolvingRefFor: resourceName
      })
    }

    return attribute
  }

  /**
   * @function refOutbound
   * @param {Entity[]} - Entities
   * @param {Object} [actionContext={}]
   * @returns {Promise.<Entity[]>}
   */
  return async function outbound (resource, entities, actionContext = {}) {
    const resourceName = String(clayResourceName(resource))
    for (let entity of entities) {
      for (let name of Object.keys(entity)) {
        let attribute = entity[name]
        entity[name] = await outboundAttribute(resourceName, name, attribute, actionContext)
      }
    }
    return entities
  }
}

module.exports = refOutbound
