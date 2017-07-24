/**
 * Mixin for entity
 * @function entityMix
 * @param {function} BaseClass - Class to mix
 * @returns {function} Mixed class
 */
'use strict'

const ENTITY_OUTBOUND_NAME = 'entity:outbound'
const {define} = require('clay-resource-entity')

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
        entities.map((entity) => s.createResourceEntity(entity))
      )
    }

    /**
     * Convert entity into resource entity
     * @param {Entity} entity to convert
     * @returns {EntityMixed.ResourceEntity}
     */
    createResourceEntity (entity) {
      const s = this
      const {ResourceEntity} = s
      return new ResourceEntity(entity)
    }

    /**
     * Extend resource entity
     * @param {function} enhancer - Enhancer function
     * @returns {EntityMixed} Returns this for chaining
     */
    enhanceResourceEntity (enhancer) {
      const s = this
      s.ResourceEntity = enhancer(s.ResourceEntity)
      return s
    }
  }

  return EntityMixed
}

module.exports = entityMix
