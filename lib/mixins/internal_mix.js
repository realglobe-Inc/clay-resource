/**
 * Mixin for internal feature
 * @function internalMix
 * @param {function} BaseClass - Class to mix
 * @returns {function} Mixed class
 */
'use strict'

const clayResourceName = require('clay-resource-name')
const co = require('co')

/** @lends internalMix */
function internalMix (BaseClass) {
  /** @class InternalMixed */
  class InternalMixed extends BaseClass {
    get $$gInternalMixed () {
      return true
    }

    constructor () {
      super(...arguments)
      const s = this
      s._internals = {}
    }

    /**
     * Get internal resource
     * @param {string} name
     * @returns {ClayResource}
     */
    internal (name) {
      const s = this
      let cache = s._internals[ name ]
      if (cache) {
        return cache
      }
      const ClayResource = require('../clay_resource')
      let resourceName = String(clayResourceName(s))
      let internalResource = new ClayResource(`${name}.${resourceName}`, s.bounds)
      s._internals[ name ] = internalResource
      return internalResource
    }

    /**
     * Get names of internal resources
     * @returns {Promise.<string[]>}
     */
    internalNames () {
      const s = this
      return co(function * () {
        return Object.keys(s._internals || {})
      })
    }
  }
  return InternalMixed
}

module.exports = internalMix
