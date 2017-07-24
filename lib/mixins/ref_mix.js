/**
 * Mixin for ref feature
 * @function refMix
 * @param {function} BaseClass - Class to mix
 * @returns {function} Mixed class
 */
'use strict'

const clayResourceName = require('clay-resource-name')
const {ResourceEvents} = require('clay-constants')
const {refOutbound} = require('../outbounds')
const {refInbound} = require('../inbounds')
const {REF_ADD, REF_REMOVE} = ResourceEvents

const outboundNameForResource = (resource) => `ref:outbound:${String(clayResourceName(resource))}`
const inboundNameForResource = (resource) => `ref:inbound:${String(clayResourceName(resource))}`

/** @lends refMix */
function refMix (BaseClass) {
  /** @class RefMixed */
  class RefMixed extends BaseClass {
    get $$refMixed () {
      return true
    }

    constructor () {
      super(...arguments)
      const s = this
      s._refResources = new Map()
    }

    /**
     * Add refs
     * @method RelatedMix#refs
     * @param {...ClayResource} resources - Resources to add
     * @returns {RefMixed} this
     */
    /**
     * Add refs
     * @method RelatedMix#refs
     * @returns {Object} Refs
     */
    refs (...resources) {
      const s = this
      if (arguments.length === 0) {
        return Object.assign({}, s._refResources)
      }
      for (let resource of resources) {
        let resourceName = String(clayResourceName(resource))
        if (s.hasRef(resourceName)) {
          s.removeRef(resourceName)
        }
        s.addRef(resourceName, resource)
      }
      return s
    }

    /**
     * Add resource ref
     * @param {string} resourceName
     * @param {ClayResource} resource
     */
    addRef (resourceName, resource) {
      const s = this
      let outboundName = outboundNameForResource(resourceName)
      let inboundName = inboundNameForResource(resourceName)
      s.addOutbound(outboundName, refOutbound(resource))
      s.addInbound(inboundName, refInbound(resource))
      s._refResources[resourceName] = resource
      s.emit(REF_ADD, {resourceName, resource})
      return s
    }

    /**
     * has resources ref
     * @param {string} resourceName
     * @returns {boolean}
     */
    hasRef (resourceName) {
      const s = this
      return s._refResources[resourceName]
    }

    /**
     * Remove resource ref
     * @param {string} resourceName
     * @returns {FormatMix}
     */
    removeRef (resourceName) {
      const s = this
      let outboundName = outboundNameForResource(resourceName)
      let inboundName = inboundNameForResource(resourceName)
      s.removeOutbound(outboundName)
      s.removeInbound(inboundName)
      delete s._refResources[resourceName]
      s.emit(REF_REMOVE, {resourceName})
      return s
    }
  }

  return RefMixed
}

module.exports = refMix
