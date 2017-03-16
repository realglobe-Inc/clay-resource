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
  class FormatMix extends BaseClass {
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
     * @returns {FormatMix}
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
     * @returns {FormatMix}
     */
    removeOutbound (name) {
      const s = this
      s._outbounds.delete(name)
      return s
    }

    /**
     * Apply outbound to entities
     * @param {ClayEntity[]} entities - Entities to outbound
     * @returns {Promise.<ClayEntity[]>} Formated entities
     */
    applyOutbound (entities) {
      const s = this
      return co(function * () {
        for (let handler of s._outbounds.values()) {
          entities = yield Promise.resolve(handler(entities))
        }
        return entities
      })
    }

    /**
     * Format entity
     * @param {ClayEntity} entity
     * @returns {Promise.<ClayEntity>}
     */
    outboundEntity (entity) {
      const s = this
      return co(function * () {
        if (!entity) {
          return entity
        }
        entity = clayEntity(entity)
        let outbounded = yield s.applyOutbound([ entity ])
        return outbounded[ 0 ]
      })
    }

    /**
     * Proses entity array
     * @param {ClayEntity[]} entityArray
     * @returns {Promise.<ClayEntity[]>}
     */
    outboundEntityArray (entityArray) {
      const s = this
      return co(function * () {
        if (!entityArray) {
          return entityArray
        }
        return yield s.applyOutbound(entityArray.map(clayEntity))
      })
    }

    /**
     * Format entity collection
     * @param {ClayCollection} collection
     * @returns {Promise.<ClayCollection>}
     */
    outboundCollection (collection) {
      const s = this
      return co(function * () {
        if (!collection) {
          return collection
        }
        collection = clayCollection(collection)
        collection.meta = Object.assign({}, collection.meta)
        collection.entities = yield s.applyOutbound(collection.entities.map(clayEntity))
        return collection
      })
    }

    /**
     * Format entity hash
     * @param {EntityHash} entityHash
     * @returns {Promise.<EntityHash>}
     */
    outboundEntityHash (entityHash) {
      const s = this
      return co(function * () {
        if (!entityHash) {
          return entityHash
        }
        entityHash = Object.assign({}, entityHash)
        let keys = Object.keys(entityHash)
        let entities = yield s.applyOutbound(keys.map((key) => entityHash[ key ]).map(clayEntity))
        for (let i = 0; i < keys.length; i++) {
          entityHash[ keys[ i ] ] = entities[ i ]
        }
        return entityHash
      })
    }

    /**
     * Format collection array
     * @param {CollectionArray} collectionArray
     * @returns {Promise.<CollectionArray>}
     */
    outboundCollectionArray (collectionArray) {
      const s = this
      return co(function * () {
        if (!collectionArray) {
          return collectionArray
        }
        return yield collectionArray.map((collection) => s.outboundCollection(collection))
      })
    }
  }
  return FormatMix
}

module.exports = outboundMix

/** @typedef {Object.<string, ClayEntity>} EntityHash */
/** @typedef {ClayCollection[]} CollectionArray */

