/**
 * Mixin for outbound feature. Convert out-bind data like entity, collection
 * @function outboundMix
 * @param {function} BaseClass - Class to mix
 * @returns {function} Mixed class
 */
'use strict'

const co = require('co')
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
     * @param {ClayEntity[]} entities - Entities to outbound
     * @param {Object} [actionContext={}]
     * @returns {Promise.<ClayEntity[]>} Formatted entities
     */
    applyOutbound (entities, actionContext = {}) {
      const s = this
      return co(function * () {
        for (let outbound of s._outbounds.values()) {
          entities = yield Promise.resolve(outbound(s, entities, actionContext))
        }
        return entities
      })
    }

    /**
     * Format entity
     * @param {ClayEntity} entity
     * @param {Object} [actionContext={}]
     * @returns {Promise.<ClayEntity>}
     */
    outboundEntity (entity, actionContext = {}) {
      const s = this
      return co(function * () {
        if (!entity) {
          return entity
        }
        entity = clayEntity(entity)
        let results = yield s.applyOutbound([ entity ], actionContext)
        return results[ 0 ]
      })
    }

    /**
     * Proses entity array
     * @param {ClayEntity[]} entityArray
     * @param {Object} [actionContext={}]
     * @returns {Promise.<ClayEntity[]>}
     */
    outboundEntityArray (entityArray, actionContext = {}) {
      const s = this
      return co(function * () {
        if (!entityArray) {
          return entityArray
        }
        return yield s.applyOutbound(entityArray.map(clayEntity), actionContext)
      })
    }

    /**
     * Format entity collection
     * @param {ClayCollection} collection
     * @param {Object} [actionContext={}]
     * @returns {Promise.<ClayCollection>}
     */
    outboundCollection (collection, actionContext = {}) {
      const s = this
      return co(function * () {
        if (!collection) {
          return collection
        }
        collection = clayCollection(collection)
        collection.meta = Object.assign({}, collection.meta)
        collection.demand = Object.assign({}, collection.demand)
        collection.entities = yield s.applyOutbound(collection.entities.map(clayEntity), actionContext)
        return collection
      })
    }

    /**
     * Format entity hash
     * @param {EntityHash} entityHash
     * @param {Object} [actionContext={}]
     * @returns {Promise.<EntityHash>}
     */
    outboundEntityHash (entityHash, actionContext = {}) {
      const s = this
      return co(function * () {
        if (!entityHash) {
          return entityHash
        }
        entityHash = Object.assign({}, entityHash)
        let keys = Object.keys(entityHash)
        let entities = yield s.applyOutbound(keys.map((key) => entityHash[ key ]).map(clayEntity), actionContext)
        for (let i = 0; i < keys.length; i++) {
          entityHash[ keys[ i ] ] = entities[ i ]
        }
        return entityHash
      })
    }

    /**
     * Format collection array
     * @param {CollectionArray} collectionArray
     * @param {Object} [actionContext={}]
     * @returns {Promise.<CollectionArray>}
     */
    outboundCollectionArray (collectionArray, actionContext = {}) {
      const s = this
      return co(function * () {
        if (!collectionArray) {
          return collectionArray
        }
        return yield collectionArray.map((collection) => s.outboundCollection(collection, actionContext))
      })
    }
  }
  return OutboundMixed
}

module.exports = outboundMix

/** @typedef {Object.<string, ClayEntity>} EntityHash */
/** @typedef {ClayCollection[]} CollectionArray */

