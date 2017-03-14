/**
 * Mixin for sub feature
 * @function subMix
 * @param {function} BaseClass - Class to mix
 * @returns {function} Mixed class
 */
'use strict'

const clayResourceName = require('clay-resource-name')

/** @lends subMix */
function subMix (BaseClass) {
  class gSubMixed extends BaseClass {
    get $$gSubMixed () {
      return true
    }

    constructor (...args) {
      super(...args)
      const s = this
      s._subCache = {}
      s._argsForSub = [ ...args ]
    }

    /**
     * Get sub resource
     * @param {string} name
     * @returns {ClayResource}
     */
    sub (name) {
      const s = this
      let cache = s._subCache[ name ]
      if (cache) {
        return cache
      }
      const ClayResource = require('../clay_resource')
      let { _argsForSub } = s
      let prefix = String(clayResourceName(s))
      let subResource = new ClayResource(`${prefix}${name}`, ..._argsForSub.slice(1))
      s._subCache[ name ] = subResource
      return subResource
    }
  }
  return gSubMixed
}

module.exports = subMix
