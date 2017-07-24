/**
 * Mixin for inbound feature. Convert in-bind data like attributes to create/update
 * @function inboundMix
 * @param {function} BaseClass - Class to mix
 * @returns {function} Mixed class
 */
'use strict'

const toAttributes = (values) => values && Object.keys(values)
  .filter((name) => typeof values[name] !== 'undefined')
  .reduce((attributes, name) => Object.assign(attributes, {
    [name]: values[name]
  }), {})

/** @lends inboundMix */
function inboundMix (BaseClass) {
  /** @class InboundMixed */
  class InboundMixed extends BaseClass {
    get $$inboundMixed () {
      return true
    }

    constructor () {
      super(...arguments)
      const s = this
      s._inbounds = new Map()
    }

    /**
     * Add inbound
     * @param {string} name - Name of inbound
     * @param {function} inbound - Inbound function
     * @returns {InboundMixed}
     */
    addInbound (name, inbound) {
      const s = this
      s._inbounds.set(name, inbound)
      return s
    }

    /**
     * Check if has inbound
     * @param {string} name - Name of inbound
     * @returns {boolean}
     */
    hasInbound (name) {
      const s = this
      return s._inbounds.has(name)
    }

    /**
     * Remove inbound
     * @param {string} name - Name of inbound
     * @returns {InboundMixed}
     */
    removeInbound (name) {
      const s = this
      s._inbounds.delete(name)
      return s
    }

    /**
     * Apply inbound to array of attributes
     * @param {EntityAttributes[]} attributesArray - Array of attributes
     * @param {ActionContext} [actionContext={}] - Context for resource action
     * @returns {Promise.<EntityAttributes[]>} Inbounded attributes array
     */
    async applyInbound (attributesArray, actionContext = {}) {
      const s = this

      for (let inbound of s._inbounds.values()) {
        attributesArray = await Promise.resolve(inbound(s, attributesArray, actionContext))
      }
      return attributesArray
    }

    /**
     * Inbound attributes
     * @param {EntityAttributes} attributes - Attributes to inbound
     * @param {ActionContext} [actionContext={}] - Context for resource action
     * @returns {Promise.<EntityAttributes>} Inbounded attributes
     */
    async inboundAttributes (attributes, actionContext = {}) {
      const s = this

      if (!attributes) {
        return attributes
      }
      attributes = toAttributes(attributes)
      const inbounded = await s.applyInbound([attributes], actionContext)
      return inbounded[0]
    }

    /**
     * Inbound attributes array
     * @param {EntityAttributes[]} attributesArray - Attributes array to inbound
     * @param {ActionContext} [actionContext={}] - Context for resource action
     * @returns {Promise.<EntityAttributes[]>} Inbounded attributes array
     */
    async inboundAttributesArray (attributesArray, actionContext = {}) {
      const s = this

      if (!attributesArray) {
        return attributesArray
      }
      return s.applyInbound(attributesArray.map(toAttributes), actionContext)
    }

    /**
     * Inbound attributes hash
     * @param {AttributesHash} attributesHash
     * @param {ActionContext} [actionContext={}] - Context for resource action
     * @returns {Promise.<AttributesHash>}
     */
    async inboundAttributesHash (attributesHash, actionContext = {}) {
      const s = this

      if (!attributesHash) {
        return attributesHash
      }
      attributesHash = Object.assign({}, attributesHash)
      let ids = Object.keys(attributesHash)
      let attributesArray = await s.applyInbound(
        ids.map((id) => attributesHash[id]).map(toAttributes),
        actionContext
      )
      for (let i = 0; i < ids.length; i++) {
        attributesHash[ids[i]] = attributesArray[i]
      }
      return attributesHash
    }
  }

  return InboundMixed
}

module.exports = inboundMix

/** @typedef {Object} EntityAttributes */
/** @typedef {Object.<string, EntityAttributes>} AttributesHash */
