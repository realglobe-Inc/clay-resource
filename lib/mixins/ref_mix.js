/**
 * Mixin for ref feature
 * @function refMix
 * @param {function} BaseClass - Class to mix
 * @returns {function} Mixed class
 */
'use strict'

const clayResourceName = require('clay-resource-name')

const processNameForResource = (resource) => `ref:${String(clayResourceName(resource))}`
const processForResource = (resource) => (entity) => {
  let resourceName = String(clayResourceName(resource))
  for (let name of Object.keys(entity)) {
    let value = entity[ name ]
    let $ref = value && value.$ref || ''
    let [ refResource, refId ] = String($ref).split(':')
    let hit = refResource === resourceName
    if (hit) {
      entity[ name ] = resource.one(refId)
    }
  }
  return entity
}

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
      let processName = processNameForResource(resourceName)
      s.addProcess(processName, processForResource(resource))
    }

    /**
     * has resources ref
     * @param {string} resourceName
     * @returns {boolean}
     */
    hasRef (resourceName) {
      const s = this
      let processName = processNameForResource(resourceName)
      return s.hasProcess(processName)
    }

    /**
     * Remove resource ref
     * @param {string} resourceName
     * @returns {ProcessMix}
     */
    removeRef (resourceName) {
      const s = this
      let processName = processNameForResource(resourceName)
      return s.removeProcess(processName)
    }

  }

  return RelateMixed
}

module.exports = refMix
