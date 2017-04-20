/**
 * Define outbound to resolve entities
 * @function entityOutbound
 * @param {ClayResource} resource
 * @returns {function} Outbound function
 */
'use strict'

const { define } = require('clay-resource-entity')

/** @lends entityOutbound */
function entityOutbound (resource) {
  const ResourceEntity = define(resource)
  /**
   * @function refOutbound
   * @param {ClayEntity[]} - Entities
   * @param {Object} [actionContext={}]
   * @returns {Promise.<ClayEntity[]>}
   */
  return function outbound (resource, entities, actionContext = {}) {
    return entities.map((entity) => new ResourceEntity(entity))
  }
}

module.exports = entityOutbound

