/**
 * Mixin for sub feature
 * @function subMix
 * @param {function} BaseClass - Class to mix
 * @returns {function} Mixed class
 */
'use strict'

const clayResourceName = require('clay-resource-name')
const {ResourceEvents} = require('clay-constants')

const {REF_ADD, REF_REMOVE, RESOURCE_SUB} = ResourceEvents

/** @lends subMix */
function subMix (BaseClass) {
  /** @class SubMixed */
  class SubMixed extends BaseClass {
    get $$gSubMixed () {
      return true
    }

    constructor (...args) {
      super(...args)
      this._subs = {}
      this._argsForSub = [...args]
    }

    /**
     * Get sub resource
     * @param {string} name
     * @returns {ClayResource}
     */
    sub (name) {
      const cache = this._subs[name]
      if (cache) {
        return cache
      }
      const ClayResource = require('../clay_resource')
      const {_argsForSub} = this
      const prefix = String(clayResourceName(this))
      const subResource = new ClayResource(`${prefix}${name}`, ..._argsForSub.slice(1))
      const refs = this.refs()
      for (const name of Object.keys(refs)) {
        subResource.refs(refs[name])
      }
      this._subs[name] = subResource
      this.refs(subResource)
      subResource.refs(this)
      this.on(REF_ADD, ({resourceName}) => {
        const resource = this.getRef(resourceName)
        subResource.addRef(resourceName, resource)
      })
      this.on(REF_REMOVE, ({resourceName}) => subResource.removeRef(resourceName))
      this.emit(RESOURCE_SUB, {name})
      return subResource
    }

    /**
     * Get names of sub resources
     * @returns {Promise.<string[]>}
     */
    subNames () {
      return Promise.resolve(
        Object.keys(this._subs || {})
      )
    }
  }

  return SubMixed
}

module.exports = subMix
