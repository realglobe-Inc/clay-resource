/**
 * Mixin for format feature. Convert out-bind data like entity, collection
 * @function formatMix
 * @param {function} BaseClass - Class to mix
 * @returns {function} Mixed class
 */
'use strict'

const co = require('co')
const clayCollection = require('clay-collection')
const clayEntity = require('clay-entity')

/** @lends formatMix */
function formatMix (BaseClass) {
  class FormatMix extends BaseClass {
    get $$formatMixed () {
      return true
    }

    constructor () {
      super(...arguments)
      const s = this
      s._formatters = new Map()
    }

    /**
     * Add format
     * @param {string} name - Name of format
     * @param {function} handler - Format handler function
     * @returns {FormatMix}
     */
    addFormatter (name, handler) {
      const s = this
      s._formatters.set(name, handler)
      return s
    }

    /**
     * Check if has format
     * @param {string} name - Name of formatter
     * @returns {boolean}
     */
    hasFormatter (name) {
      const s = this
      return s._formatters.has(name)
    }

    /**
     * Remove format
     * @param {string} name - Name of formatter
     * @returns {FormatMix}
     */
    removeFormatter (name) {
      const s = this
      s._formatters.delete(name)
      return s
    }

    /**
     * Apply format to entities
     * @param {ClayEntity[]} entities - Entities to format
     * @returns {Promise.<ClayEntity[]>} Formated entities
     */
    applyFormatter (entities) {
      const s = this
      return co(function * () {
        for (let handler of s._formatters.values()) {
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
    formatEntity (entity) {
      const s = this
      return co(function * () {
        if (!entity) {
          return entity
        }
        entity = clayEntity(entity)
        let formated = yield s.applyFormatter([ entity ])
        return formated[ 0 ]
      })
    }

    /**
     * Proses entity array
     * @param {ClayEntity[]} entityArray
     * @returns {Promise.<ClayEntity[]>}
     */
    formatEntityArray (entityArray) {
      const s = this
      return co(function * () {
        if (!entityArray) {
          return entityArray
        }
        return yield s.applyFormatter(entityArray.map(clayEntity))
      })
    }

    /**
     * Format entity collection
     * @param {ClayCollection} collection
     * @returns {Promise.<ClayCollection>}
     */
    formatCollection (collection) {
      const s = this
      return co(function * () {
        if (!collection) {
          return collection
        }
        collection = clayCollection(collection)
        collection.meta = Object.assign({}, collection.meta)
        collection.entities = yield s.applyFormatter(collection.entities.map(clayEntity))
        return collection
      })
    }

    /**
     * Format entity hash
     * @param {EntityHash} entityHash
     * @returns {Promise.<EntityHash>}
     */
    formatEntityHash (entityHash) {
      const s = this
      return co(function * () {
        if (!entityHash) {
          return entityHash
        }
        entityHash = Object.assign({}, entityHash)
        let keys = Object.keys(entityHash)
        let entities = yield s.applyFormatter(keys.map((key) => entityHash[ key ]).map(clayEntity))
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
    formatCollectionArray (collectionArray) {
      const s = this
      return co(function * () {
        if (!collectionArray) {
          return collectionArray
        }
        return yield collectionArray.map((collection) => s.formatCollection(collection))
      })
    }
  }
  return FormatMix
}

module.exports = formatMix

/** @typedef {Object.<string, ClayEntity>} EntityHash */
/** @typedef {ClayCollection[]} CollectionArray */

