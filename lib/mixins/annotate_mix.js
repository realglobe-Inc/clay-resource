/**
 * Mixin for annotate feature
 * @function annotateMix
 * @param {function} BaseClass - Class to mix
 * @returns {function} Mixed class
 */
'use strict'

const annotationStripProcess = (entities) => {
  for (let entity of entities) {
    for (let name of Object.keys(entity)) {
      if (/^\$\$/.test(name)) {
        delete entity[ name ]
      }
    }
  }
  return entities
}

const ANNOTATE_STRIP = 'annotation:strip'

/** @lends annotateMix */
function annotateMix (BaseClass) {
  class AnnotateMixed extends BaseClass {
    get $$AnnotateMixed () {
      return true
    }

    constructor () {
      super(...arguments)
      const s = this
      if (!s.$$processMixed) {
        throw new Error('ProcessMix is required')
      }
      s._annotateEnabled = false
    }

    /** @deprecated */
    toggleAnnotate (annotateEnabled) {
      const s = this
      if (arguments.length === 0) {
        annotateEnabled = !s._annotateEnabled
      }
      console.warn('`.toggleAnnotate()` is now deprecated. use `.annotates()` instead')
      return s.annotates(annotateEnabled)
    }

    /**
     * Toggle annotate support
     * @method annotates
     * @param {boolean} annotates - Should annotate or not
     * @returns {AnnotateMixed} this
     */
    annotates (annotates) {
      const s = this
      if (arguments.length === 0) {
        return !s._annotateEnabled
      }
      if (annotates) {
        s.removeProcess(ANNOTATE_STRIP)
      } else {
        s.addProcess(ANNOTATE_STRIP, annotationStripProcess)
      }
      s._annotateEnabled = annotates
      return s
    }

  }
  return AnnotateMixed
}

module.exports = annotateMix
