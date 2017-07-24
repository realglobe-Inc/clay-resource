/**
 * Mixin for outbound feature. Convert out-bind data like entity, collection
 * @function outboundMix
 * @param {function} BaseClass - Class to mix
 * @returns {function} Mixed class
 */
'use strict'

const clayCollection = require('clay-collection')
const clayEntity = require('clay-entity')

/** @lends outboundMix */
function outboundMix (BaseClass) {
  /** @class OutboundMixed */
  class OutboundMixed extends BaseClass {
    get $$outboundMixed () {
      return true
    }

    constructor () {
      super(...arguments)
      const s = this
      if (!s.$$collectionMixed) {
        throw new Error('needs collectionMix')
      }
      s._outbounds = new Map()
    }

    /**
     * Add outbound
     * @param {string} name - Name of outbound
     * @param {function} handler - Format handler function
     * @returns {OutboundMixed}
     */
    addOutbound (name, handler) {
      const s = this
      s._outbounds.set(name, handler)
      return s
    }

    /**
     * Check if has outbound
     * @param {string} name - Name of outbound
     * @returns {boolean}
     */
    hasOutbound (name) {
      const s = this
      return s._outbounds.has(name)
    }

    /**
     * Remove outbound
     * @param {string} name - Name of outbound
     * @returns {OutboundMixed}
     */
    removeOutbound (name) {
      const s = this
      s._outbounds.delete(name)
      return s
    }

    /**
     * Apply outbound to entities
     * @param {Entity[]} entities - Entities to outbound
     * @param {Object} [actionContext={}]
     * @returns {Promise.<Entity[]>} Formatted entities
     */
    async applyOutbound (entities, actionContext = {}) {
      const s = this

      for (let outbound of s._outbounds.values()) {
        entities = await Promise.resolve(outbound(s, entities, actionContext))
      }
      return entities
    }

    /**
     * Format entity
     * @param {Entity} entity
     * @param {Object} [actionContext={}]
     * @returns {Promise.<Entity>}
     */
    async outboundEntity (entity, actionContext = {}) {
      const s = this

      if (!entity) {
        return entity
      }
      entity = clayEntity(entity)
      let results = await s.applyOutbound([entity], actionContext)
      return results[0]
    }

    /**
     * Proses entity array
     * @param {Entity[]} entityArray
     * @param {Object} [actionContext={}]
     * @returns {Promise.<Entity[]>}
     */
    async outboundEntityArray (entityArray, actionContext = {}) {
      const s = this

      if (!entityArray) {
        return entityArray
      }
      return s.applyOutbound(entityArray.map(clayEntity), actionContext)
    }

    /**
     * Format entity collection
     * @param {Collection} collection
     * @param {Object} [actionContext={}]
     * @returns {Promise.<Collection>}
     */
    async outboundCollection (collection, actionContext = {}) {
      const s = this

      if (!collection) {
        return collection
      }
      collection = clayCollection(collection)
      collection.meta = Object.assign({}, collection.meta)
      collection.demand = Object.assign({}, collection.demand)
      collection.entities = await s.applyOutbound(collection.entities.map(clayEntity), actionContext)
      return s.createResourceCollection(collection)
    }

    /**
     * Format entity hash
     * @param {EntityHash} entityHash
     * @param {Object} [actionContext={}]
     * @returns {Promise.<EntityHash>}
     */
    async outboundEntityHash (entityHash, actionContext = {}) {
      const s = this

      if (!entityHash) {
        return entityHash
      }
      entityHash = Object.assign({}, entityHash)
      let ids = Object.keys(entityHash)
      let entities = await s.applyOutbound(ids.map((id) => entityHash[id]).map(clayEntity), actionContext)
      for (let i = 0; i < ids.length; i++) {
        entityHash[ids[i]] = entities[i]
      }
      return entityHash
    }

    /**
     * Format collection array
     * @param {CollectionArray} collectionArray
     * @param {Object} [actionContext={}]
     * @returns {Promise.<CollectionArray>}
     */
    async outboundCollectionArray (collectionArray, actionContext = {}) {
      const s = this

      if (!collectionArray) {
        return collectionArray
      }
      return Promise.all(
        collectionArray.map((collection) => s.outboundCollection(collection, actionContext))
      )
    }
  }

  return OutboundMixed
}

module.exports = outboundMix

/** @typedef {Object.<string, Entity>} EntityHash */
/** @typedef {Collection[]} CollectionArray */
