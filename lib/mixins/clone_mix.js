/**
 * Mixin for clone feature
 * @function cloneMix
 * @param {function} BaseClass - Class to mix
 * @returns {function} Mixed class
 */
'use strict'

/** @lends cloneMix */
function cloneMix (BaseClass) {
  /** @class CloneMixed */
  class CloneMixed extends BaseClass {
    get $$cloneMixed () {
      return true
    }

    constructor (...args) {
      super(...args)
      this._argsForClone = [...args]
    }

    /**
     * Clone the instance
     * @returns {Object} Cloned instance
     */
    clone () {
      const {
        constructor: Clazz,
        _argsForClone: args
      } = this
      return new Clazz(...args)
    }
  }

  return CloneMixed
}

module.exports = cloneMix
