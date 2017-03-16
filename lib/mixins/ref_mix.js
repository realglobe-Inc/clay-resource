/**
 * Mixin for ref feature
 * @function refMix
 * @param {function} BaseClass - Class to mix
 * @returns {function} Mixed class
 */
'use strict'

const co = require('co')
const clayResourceName = require('clay-resource-name')
const { entityRefOutbound } = require('../outbounds')
const { entityRefInbound } = require('../inbounds')

const outboundNameForResource = (resource) => `ref:outbound:${String(clayResourceName(resource))}`
const inboundNameForResource = (resource) => `ref:inbound:${String(clayResourceName(resource))}`

/** @lends refMix */
function refMix (BaseClass) {
  class RelateMixed extends BaseClass {
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
     * @param {...ClayResource} resources - Resources to add
     * @returns {RelateMixed} this
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
      s.addOutbound(outboundName, entityRefOutbound(resource))
      s.addInbound(inboundName, entityRefInbound(resource))
      s._refResources[ resourceName ] = resource
      return s
    }

    /**
     * has resources ref
     * @param {string} resourceName
     * @returns {boolean}
     */
    hasRef (resourceName) {
      const s = this
      return s._refResources[ resourceName ]
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
      delete s._refResources[ resourceName ]
      return s
    }

  }

  return RelateMixed
}

module.exports = refMix
