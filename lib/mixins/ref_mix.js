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
      this._refResources = new Map()
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
      if (arguments.length === 0) {
        return Object.assign({}, this._refResources)
      }
      for (const resource of resources) {
        const resourceName = String(clayResourceName(resource))
        if (this.hasRef(resourceName)) {
          this.removeRef(resourceName)
        }
        this.addRef(resourceName, resource)
      }
      return this
    }

    /**
     * Add resource ref
     * @param {string} resourceName
     * @param {ClayResource} resource
     */
    addRef (resourceName, resource) {
      const outboundName = outboundNameForResource(resourceName)
      const inboundName = inboundNameForResource(resourceName)
      this.addOutbound(outboundName, refOutbound(resource))
      this.addInbound(inboundName, refInbound(resource))
      this._refResources[resourceName] = resource
      this.emit(REF_ADD, {resourceName})
      return this
    }

    /**
     * Has resources ref
     * @param {string} resourceName
     * @returns {boolean}
     */
    hasRef (resourceName) {
      return !!this._refResources[resourceName]
    }

    /**
     * Get resource ref
     * @param {string} resourceName
     * @returns {boolean}
     */
    getRef (resourceName) {
      return this._refResources[resourceName]
    }

    /**
     * Remove resource ref
     * @param {string} resourceName
     * @returns {RefMixed} this
     */
    removeRef (resourceName) {
      const outboundName = outboundNameForResource(resourceName)
      const inboundName = inboundNameForResource(resourceName)
      this.removeOutbound(outboundName)
      this.removeInbound(inboundName)
      delete this._refResources[resourceName]
      this.emit(REF_REMOVE, {resourceName})
      return this
    }
  }

  return RefMixed
}

module.exports = refMix
