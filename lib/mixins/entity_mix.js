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
      this.ResourceEntity = define(this)
      this.addOutbound(ENTITY_OUTBOUND_NAME, (resource, entities, actionContext = {}) =>
        entities.map((entity) => this.createResourceEntity(entity))
      )
    }

    /**
     * Convert entity into resource entity
     * @param {Entity} entity to convert
     * @returns {EntityMixed.ResourceEntity}
     */
    createResourceEntity (entity) {
      const {ResourceEntity} = this
      return new ResourceEntity(entity)
    }

    /**
     * Extend resource entity
     * @param {function} enhancer - Enhancer function
     * @returns {EntityMixed} Returns this for chaining
     */
    enhanceResourceEntity (enhancer) {
      this.ResourceEntity = enhancer(this.ResourceEntity)
      return this
    }

  }

  return EntityMixed
}

module.exports = entityMix
