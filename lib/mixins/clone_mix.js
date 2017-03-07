/**
 * Mix clone feature
 * @function cloneMix
 * @param {function} BaseClass - Class to mix
 * @returns {function} Mixed class
 */
'use strict'

/** @lends cloneMix */
function cloneMix (BaseClass) {
  class CloneMixed extends BaseClass {
    get $$cloneMixed () {
      return true
    }

    constructor (...args) {
      super(...args)
      const s = this
      s._argsForClone = [ ...args ]
    }

    /**
     * Clone the instance
     * @returns {Object} Cloned instance
     */
    clone () {
      const s = this
      const {
        constructor: Clazz,
        _argsForClone: args
      } = s
      return new Clazz(...args)
    }
  }
  return CloneMixed
}

module.exports = cloneMix

