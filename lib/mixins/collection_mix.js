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
      this.ResourceCollection = define(this)
    }

    /**
     * Convert collection into resource collection
     * @param {Collection} collection - Collection to convert
     * @returns {CollectionMixed.ResourceCollection}
     */
    createResourceCollection (collection) {
      const { ResourceCollection } = this
      return new ResourceCollection(collection)
    }

    /**
     * Extend resource collection
     * @param {function} enhancer - Enhancer function
     * @returns {EntityMixed} Returns this for chaining
     */
    enhanceResourceCollection (enhancer) {
      this.ResourceCollection = enhancer(this.ResourceCollection)
      return this
    }
  }

  return CollectionMixed
}

module.exports = collectionMix
