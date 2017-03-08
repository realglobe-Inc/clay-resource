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
    }

    /**
     * Get sub resource
     * @param {string} name
     * @returns {*}
     */
    sub (name) {
      const s = this
      let cache = s._subCache[ name ]
      if (cache) {
        return cache
      }
      const ClayResource = require('../clay_resource')
      let { args } = s
      let prefix = String(clayResourceName(s))
      let subResource = new ClayResource(`${prefix}${name}`, ...args.slice(1))
      s._subCache[ name ] = subResource
      return subResource
    }
  }
  return gSubMixed
}

module.exports = subMix
