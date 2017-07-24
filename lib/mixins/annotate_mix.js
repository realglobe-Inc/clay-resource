/**
 * Mixin for annotate feature
 * @function annotateMix
 * @param {function} BaseClass - Class to mix
 * @returns {function} Mixed class
 */
'use strict'

const { annotationOutbound } = require('../outbounds')
const { ResourceEvents } = require('clay-constants')
const { ANNOTATION_TOGGLE } = ResourceEvents

const ANNOTATION_OUTBOUND = 'annotation:outbound'

/** @lends annotateMix */
function annotateMix (BaseClass) {
  /** @class AnnotateMixed */
  class AnnotateMixed extends BaseClass {
    get $$annotateMixed () {
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
        s.removeOutbound(ANNOTATION_OUTBOUND)
      } else {
        s.addOutbound(ANNOTATION_OUTBOUND, annotationOutbound())
      }
      s.emit('resource:annotates', { annotates })
      s._annotateEnabled = annotates
      s.emit(ANNOTATION_TOGGLE, { annotates })
      return s
    }
  }
  return AnnotateMixed
}

module.exports = annotateMix
