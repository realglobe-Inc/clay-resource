/**
 * Mixin for process feature
 * @function processMix
 * @param {function} BaseClass - Class to mix
 * @returns {function} Mixed class
 */
'use strict'

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
     * Process entity
     * @param {ClayEntity} entity
     * @returns {ClayEntity}
     */
    processEntity (entity) {
      if (!entity) {
        return entity
      }
      const s = this
      entity = clayEntity(entity)
      for (let handler of s._processHandlers.values()) {
        entity = handler(entity)
      }
      return entity
    }

    /**
     * Proses entity array
     * @param {ClayEntity[]} entityArray
     * @returns {ClayEntity[]}
     */
    processEntityArray (entityArray) {
      if (!entityArray) {
        return entityArray
      }
      const s = this
      return entityArray.map((entity) => s.processEntity(entity))
    }

    /**
     * Process entity collection
     * @param {ClayCollection} collection
     * @returns {ClayCollection}
     */
    processCollection (collection) {
      if (!collection) {
        return collection
      }
      const s = this
      collection = clayCollection(collection)
      collection.entities = collection.entities.map((entity) => s.processEntity(entity))
      return collection
    }

    /**
     * Process entity hash
     * @param {Object.<string, ClayEntity>} entityHash
     * @returns {Object.<string, ClayEntity>}
     */
    processEntityHash (entityHash) {
      if (!entityHash) {
        return entityHash
      }
      const s = this
      entityHash = Object.assign({}, entityHash)
      for (let key of Object.keys(entityHash)) {
        entityHash[ key ] = s.processEntity(entityHash[ key ])
      }
      return entityHash
    }

    /**
     * Process collection array
     * @param {ClayCollection[]} collectionArray
     * @returns {ClayCollection[]}
     */
    processCollectionArray (collectionArray) {
      if (!collectionArray) {
        return collectionArray
      }
      const s = this
      return collectionArray.map((collection) => s.processCollection(collection))
    }
  }
  return ProcessMix
}

module.exports = processMix
