/**
 * Mixin for entity
 * @function entityMix
 * @param {function} BaseClass - Class to mix
 * @returns {function} Mixed class
 */
'use strict'

const ENTITY_OUTBOUND_NAME = 'entity:outbound'
const { define } = require('clay-resource-entity')

/** @lends entityMix */
function entityMix (BaseClass) {
  /** @class EntityMixed */
  class EntityMixed extends BaseClass {
    get $$entityMixed () {
      return true
    }

    constructor () {
      super(...arguments)
      const s = this

      s.ResourceEntity = define(s)
      s.addOutbound(ENTITY_OUTBOUND_NAME, (resource, entities, actionContext = {}) =>
        entities.map((entity) => s.toResourceEntity(entity))
      )
    }

    /**
     * Convert entity into resource entity
     * @param {Entity} entity to convert
     * @returns {EntityMixed.ResourceEntity}
     */
    toResourceEntity (entity) {
      const s = this
      const { ResourceEntity } = s
      return new ResourceEntity(entity)
    }
  }

  return EntityMixed
}

module.exports = entityMix
