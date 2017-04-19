/**
 * Define outbound to load entity refs
 * @function refOutbound
 * @param {ClayResource} refResource - Resource of entities
 * @returns {function} Outbound function
 */
'use strict'

const co = require('co')
const { isEntity } = require('clay-entity')
const { parse: parseRef, refTo } = require('clay-resource-ref')
const { LogPrefixes } = require('clay-constants')
const clayResourceName = require('clay-resource-name')
const { RESOURCE_PREFIX } = LogPrefixes

/** @lends refOutbound */
function refOutbound (refResource) {
  const refResourceName = String(clayResourceName(refResource))
  const outboundAttribute = (resourceName, name, attribute, actionContext) => co(function * () {
    let skip = actionContext.skipResolvingRefFor === refResourceName
    if (skip) {
      return attribute
    }

    if (Array.isArray(attribute)) {
      return yield attribute.map((attribute) => outboundAttribute(resourceName, name, attribute, actionContext))
    }
    if (isEntity(attribute)) {
      if (!attribute.$$as) {
        console.warn(`${RESOURCE_PREFIX} You cannot use "${attribute}" as ref of "${name}" since it is not annotated`)
        return attribute
      }
      let hit = String(attribute.$$as) === refResourceName
      if (hit) {
        attribute = { $ref: refTo(refResource, attribute.id) }
      }
    }
    let $ref = parseRef(attribute && attribute.$ref)
    if (!$ref) {
      return attribute
    }
    let hit = String($ref.resource) === refResourceName
    if (hit) {
      return yield refResource.one($ref.id, {
        skipResolvingRefFor: resourceName
      })
    }

    return attribute
  })

  /**
   * @function refOutbound
   * @param {ClayEntity[]} - Entities
   * @param {Object} [actionContext={}]
   * @returns {Promise.<ClayEntity[]>}
   */
  return function outbound (resource, entities, actionContext = {}) {
    const resourceName = String(clayResourceName(resource))
    return co(function * () {
      for (let entity of entities) {
        for (let name of Object.keys(entity)) {
          let attribute = entity[ name ]
          entity[ name ] = yield outboundAttribute(resourceName, name, attribute, actionContext)
        }
      }
      return entities
    })
  }
}

module.exports = refOutbound
