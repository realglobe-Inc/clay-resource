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
      if (!this.$$collectionMixed) {
        throw new Error('needs collectionMix')
      }
      this._outbounds = new Map()
    }

    /**
     * Add outbound
     * @param {string} name - Name of outbound
     * @param {function} handler - Format handler function
     * @returns {OutboundMixed}
     */
    addOutbound (name, handler) {
      this._outbounds.set(name, handler)
      return this
    }

    /**
     * Check if has outbound
     * @param {string} name - Name of outbound
     * @returns {boolean}
     */
    hasOutbound (name) {
      return this._outbounds.has(name)
    }

    /**
     * Remove outbound
     * @param {string} name - Name of outbound
     * @returns {OutboundMixed}
     */
    removeOutbound (name) {
      this._outbounds.delete(name)
      return this
    }

    /**
     * Apply outbound to entities
     * @param {Entity[]} entities - Entities to outbound
     * @param {Object} [actionContext={}]
     * @returns {Promise.<Entity[]>} Formatted entities
     */
    async applyOutbound (entities, actionContext = {}) {
      for (const outbound of this._outbounds.values()) {
        entities = await Promise.resolve(outbound(this, entities, actionContext))
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
      if (!entity) {
        return entity
      }
      entity = clayEntity(entity)
      const results = await this.applyOutbound([entity], actionContext)
      return results[0]
    }

    /**
     * Proses entity array
     * @param {Entity[]} entityArray
     * @param {Object} [actionContext={}]
     * @returns {Promise.<Entity[]>}
     */
    async outboundEntityArray (entityArray, actionContext = {}) {
      if (!entityArray) {
        return entityArray
      }
      return this.applyOutbound(entityArray.map(clayEntity), actionContext)
    }

    /**
     * Format entity collection
     * @param {Collection} collection
     * @param {Object} [actionContext={}]
     * @returns {Promise.<Collection>}
     */
    async outboundCollection (collection, actionContext = {}) {
      if (!collection) {
        return collection
      }
      collection = clayCollection(collection)
      collection.meta = Object.assign({}, collection.meta)
      collection.demand = Object.assign({}, collection.demand)
      collection.entities = await this.applyOutbound(collection.entities.map(clayEntity), actionContext)
      return this.createResourceCollection(collection)
    }

    /**
     * Format entity hash
     * @param {EntityHash} entityHash
     * @param {Object} [actionContext={}]
     * @returns {Promise.<EntityHash>}
     */
    async outboundEntityHash (entityHash, actionContext = {}) {
      if (!entityHash) {
        return entityHash
      }
      entityHash = Object.assign({}, entityHash)
      const ids = Object.keys(entityHash)
      const entities = await this.applyOutbound(
        ids.map((id) => entityHash[id]).map((v) => v === null ? v : clayEntity(v)).filter(Boolean),
        actionContext
      )
      const outboundedHash = entities.reduce((hash, entity) => Object.assign(hash, { [entity.id]: entity }), {})
      Object.assign(entityHash, outboundedHash)
      return entityHash
    }

    /**
     * Format collection array
     * @param {CollectionArray} collectionArray
     * @param {Object} [actionContext={}]
     * @returns {Promise.<CollectionArray>}
     */
    async outboundCollectionArray (collectionArray, actionContext = {}) {
      if (!collectionArray) {
        return collectionArray
      }
      return Promise.all(
        collectionArray.map((collection) => this.outboundCollection(collection, actionContext))
      )
    }
  }

  return OutboundMixed
}

module.exports = outboundMix

/** @typedef {Object.<string, Entity>} EntityHash */
/** @typedef {Collection[]} CollectionArray */
