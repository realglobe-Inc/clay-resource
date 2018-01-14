/**
 * Mixin for internal feature
 * @function internalMix
 * @param {function} BaseClass - Class to mix
 * @returns {function} Mixed class
 */
'use strict'

const clayResourceName = require('clay-resource-name')

/** @lends internalMix */
function internalMix (BaseClass) {
  /** @class InternalMixed */
  class InternalMixed extends BaseClass {
    get $$gInternalMixed () {
      return true
    }

    constructor () {
      super(...arguments)
      this._internals = {}
    }

    /**
     * Get internal resource
     * @param {string} name
     * @returns {ClayResource}
     */
    internal (name) {
      const cache = this._internals[name]
      if (cache) {
        return cache
      }
      const ClayResource = require('../clay_resource')
      const resourceName = String(clayResourceName(this))
      let internalResource = new ClayResource(`${name}.${resourceName}`, this.bounds)
      this._internals[name] = internalResource
      return internalResource
    }

    /**
     * Get names of internal resources
     * @returns {Promise.<string[]>}
     */
    async internalNames () {
      return Promise.resolve(
        Object.keys(this._internals || {})
      )
    }
  }

  return InternalMixed
}

module.exports = internalMix
