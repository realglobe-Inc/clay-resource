/**
 * Mixin for collection
 * @function collectionMix
 * @param {function} BaseClass - Class to mix
 * @returns {function} Mixed class
 */
'use strict'

const { define } = require('clay-resource-collection')

/** @lends collectionMix */
function collectionMix (BaseClass) {
  /** @class CollectionMixed */
  class CollectionMixed extends BaseClass {
    get $$collectionMixed () {
      return true
    }

    constructor () {
      super(...arguments)
      const s = this
      s.ResourceCollection = define(s)
    }

    /**
     * Convert collection into resource collection
     * @param {Collection} collection - Collection to convert
     * @returns {CollectionMixed.ResourceCollection}
     */
    createResourceCollection (collection) {
      const s = this
      const { ResourceCollection } = s
      return new ResourceCollection(collection)
    }

    /**
     * Extend resource collection
     * @param {function} enhancer - Enhancer function
     * @returns {EntityMixed} Returns this for chaining
     */
    enhanceResourceCollection (enhancer) {
      const s = this
      s.ResourceCollection = enhancer(s.ResourceCollection)
      return s
    }
  }

  return CollectionMixed
}

module.exports = collectionMix
