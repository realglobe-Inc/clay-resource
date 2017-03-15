/**
 * Mixin for ref feature
 * @function refMix
 * @param {function} BaseClass - Class to mix
 * @returns {function} Mixed class
 */
'use strict'

const co = require('co')
const { isEntity } = require('clay-entity')
const { LogPrefixes } = require('clay-constants')
const clayResourceName = require('clay-resource-name')
const { entityRefFormatter } = require('../formatters')
const { parse: parseRef, refTo } = require('clay-resource-ref')
const { RESOURCE_PREFIX } = LogPrefixes

const formatterNameForResource = (resource) => `ref:${String(clayResourceName(resource))}`

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
      let formatName = formatterNameForResource(resourceName)
      s.addFormatter(formatName, entityRefFormatter(resource))
    }

    /**
     * has resources ref
     * @param {string} resourceName
     * @returns {boolean}
     */
    hasRef (resourceName) {
      const s = this
      let formatName = formatterNameForResource(resourceName)
      return s.hasFormatter(formatName)
    }

    /**
     * Remove resource ref
     * @param {string} resourceName
     * @returns {FormatMix}
     */
    removeRef (resourceName) {
      const s = this
      let formatName = formatterNameForResource(resourceName)
      return s.removeFormatter(formatName)
    }

  }

  return RelateMixed
}

module.exports = refMix
