/**
 * Mixin for process feature
 * @function processMix
 * @param {function} BaseClass - Class to mix
 * @returns {function} Mixed class
 */
'use strict'

const co = require('co')
const clayCollection = require('clay-collection')
const clayEntity = require('clay-entity')

/** @lends processMix */
function processMix (BaseClass) {
  class ProcessMix extends BaseClass {
    get $$processMixed () {
      return true
    }

    constructor () {
      super(...arguments)
      const s = this
      s._processHandlers = new Map()
    }

    /**
     * Add process
     * @param {string} name - Name of process
     * @param {function} handler - Process handler function
     * @returns {ProcessMix}
     */
    addProcess (name, handler) {
      const s = this
      s._processHandlers.set(name, handler)
      return s
    }

    /**
     * Check if has process
     * @param {string} name - Name of process
     * @returns {boolean}
     */
    hasProcess (name) {
      const s = this
      return s._processHandlers.has(name)
    }

    /**
     * Remove process
     * @param {string} name - Name of process
     * @returns {ProcessMix}
     */
    removeProcess (name) {
      const s = this
      s._processHandlers.delete(name)
      return s
    }

    /**
     * Apply process to entities
     * @param {ClayEntity[]} entities - Entities to process
     * @returns {Promise.<ClayEntity[]>} Processed entities
     */
    applyProcess (entities) {
      const s = this
      return co(function * () {
        for (let handler of s._processHandlers.values()) {
          entities = yield Promise.resolve(handler(entities))
        }
        return entities
      })
    }

    /**
     * Process entity
     * @param {ClayEntity} entity
     * @returns {Promise.<ClayEntity>}
     */
    processEntity (entity) {
      const s = this
      return co(function * () {
        if (!entity) {
          return entity
        }
        entity = clayEntity(entity)
        let processed = yield s.applyProcess([ entity ])
        return processed[ 0 ]
      })
    }

    /**
     * Proses entity array
     * @param {ClayEntity[]} entityArray
     * @returns {Promise.<ClayEntity[]>}
     */
    processEntityArray (entityArray) {
      const s = this
      return co(function * () {
        if (!entityArray) {
          return entityArray
        }
        return yield s.applyProcess(entityArray.map(clayEntity))
      })
    }

    /**
     * Process entity collection
     * @param {ClayCollection} collection
     * @returns {Promise.<ClayCollection>}
     */
    processCollection (collection) {
      const s = this
      return co(function * () {
        if (!collection) {
          return collection
        }
        collection = clayCollection(collection)
        collection.meta = Object.assign({}, collection.meta)
        collection.entities = yield s.applyProcess(collection.entities.map(clayEntity))
        return collection
      })
    }

    /**
     * Process entity hash
     * @param {EntityHash} entityHash
     * @returns {Promise.<EntityHash>}
     */
    processEntityHash (entityHash) {
      const s = this
      return co(function * () {
        if (!entityHash) {
          return entityHash
        }
        entityHash = Object.assign({}, entityHash)
        let keys = Object.keys(entityHash)
        let entities = yield s.applyProcess(keys.map((key) => entityHash[ key ]).map(clayEntity))
        for (let i = 0; i < keys.length; i++) {
          entityHash[ keys[ i ] ] = entities[ i ]
        }
        return entityHash
      })
    }

    /**
     * Process collection array
     * @param {CollectionArray} collectionArray
     * @returns {Promise.<CollectionArray>}
     */
    processCollectionArray (collectionArray) {
      const s = this
      return co(function * () {
        if (!collectionArray) {
          return collectionArray
        }
        return yield collectionArray.map((collection) => s.processCollection(collection))
      })
    }
  }
  return ProcessMix
}

module.exports = processMix

/** @typedef {Object.<string, ClayEntity>} EntityHash */
/** @typedef {ClayCollection[]} CollectionArray */

