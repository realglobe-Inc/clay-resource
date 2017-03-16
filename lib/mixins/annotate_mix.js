/**
 * Mixin for annotate feature
 * @function annotateMix
 * @param {function} BaseClass - Class to mix
 * @returns {function} Mixed class
 */
'use strict'

const { annotationStripOutbound } = require('../outbounds')

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
      if (!s.$$outboundMixed) {
        throw new Error('outboundMix is required')
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
        s.removeOutbound(ANNOTATE_STRIP)
      } else {
        s.addOutbound(ANNOTATE_STRIP, annotationStripOutbound())
      }
      s._annotateEnabled = annotates
      return s
    }

  }
  return AnnotateMixed
}

module.exports = annotateMix
