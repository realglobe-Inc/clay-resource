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
      if (!this.$$outboundMixed) {
        throw new Error('outboundMix is required')
      }
      this._annotateEnabled = false
    }

    /** @deprecated */
    toggleAnnotate (annotateEnabled) {
      if (arguments.length === 0) {
        annotateEnabled = !this._annotateEnabled
      }
      console.warn('`.toggleAnnotate()` is now deprecated. use `.annotates()` instead')
      return this.annotates(annotateEnabled)
    }

    /**
     * Toggle annotate support
     * @method annotates
     * @param {boolean} annotates - Should annotate or not
     * @returns {AnnotateMixed} this
     */
    annotates (annotates) {
      if (arguments.length === 0) {
        return !this._annotateEnabled
      }
      if (annotates) {
        this.removeOutbound(ANNOTATION_OUTBOUND)
      } else {
        this.addOutbound(ANNOTATION_OUTBOUND, annotationOutbound())
      }
      this.emit('resource:annotates', { annotates })
      this._annotateEnabled = annotates
      this.emit(ANNOTATION_TOGGLE, { annotates })
      return this
    }
  }
  return AnnotateMixed
}

module.exports = annotateMix
