/**
 * Mixin for annotate feature
 * @function annotateMix
 * @param {function} BaseClass - Class to mix
 * @returns {function} Mixed class
 */
'use strict'

/** @lends annotateMix */
function annotateMix (BaseClass) {
  class AnnotateMixed extends BaseClass {
    get $$AnnotateMixed () {
      return true
    }

    /**
     * Toggle annotate support
     * @param {boolean} annotate - Should annotate or not
     * @returns {AnnotateMixed} this
     */
    toggleAnnotate (annotate) {
      const s = this
      if (arguments.length === 0) {
        annotate = !s.annotate
      }
      s.annotate = annotate
      return s
    }

    processAnnotateForEntity (entity) {
      if (!entity) {
        return entity
      }
      const s = this
      if (!s.annotate) {
        for (let name of Object.keys(entity)) {
          if (/^\$\$/.test(name)) {
            delete entity[ name ]
          }
        }
      }
      return entity
    }

    processAnnotateForEntityArray (entityArray) {
      if (!entityArray) {
        return entityArray
      }
      const s = this
      if (!s.annotate) {
        return entityArray.map((entity) => s.processAnnotateForEntity(entity))
      }
      return entityArray
    }

    processAnnotateForCollection (collection) {
      if (!collection) {
        return collection
      }
      const s = this
      if (!s.annotate) {
        collection.entities = s.processAnnotateForEntityArray(collection.entities)
      }
      return collection
    }

    processAnnotateForEntityHash (entityHash) {
      if (!entityHash) {
        return
      }
      const s = this
      for (let key of Object.keys(entityHash)) {
        entityHash[ key ] = s.processAnnotateForEntity(entityHash[ key ])
      }
      return entityHash
    }

    processAnnotateForCollectionArray (collectionArray) {
      if (!collectionArray) {
        return collectionArray
      }
      const s = this
      return collectionArray.map((collection) => s.processAnnotateForCollection(collection))
    }
  }
  return AnnotateMixed
}

module.exports = annotateMix
