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
      const s = this
      s._subs = {}
      s._argsForSub = [...args]
    }

    /**
     * Get sub resource
     * @param {string} name
     * @returns {ClayResource}
     */
    sub (name) {
      const s = this
      let cache = s._subs[name]
      if (cache) {
        return cache
      }
      const ClayResource = require('../clay_resource')
      let {_argsForSub} = s
      let prefix = String(clayResourceName(s))
      let subResource = new ClayResource(`${prefix}${name}`, ..._argsForSub.slice(1))
      let refs = s.refs()
      for (let name of Object.keys(refs)) {
        subResource.refs(refs[name])
      }
      s._subs[name] = subResource
      s.refs(subResource)
      subResource.refs(s)
      s.on(REF_ADD, ({resourceName, resource}) => subResource.addRef(resourceName, resource))
      s.on(REF_REMOVE, ({resourceName}) => subResource.removeRef(resourceName))
      s.emit(RESOURCE_SUB, {name})
      return subResource
    }

    /**
     * Get names of sub resources
     * @returns {Promise.<string[]>}
     */
    subNames () {
      const s = this
      return Promise.resolve(
        Object.keys(s._subs || {})
      )
    }
  }

  return SubMixed
}

module.exports = subMix
