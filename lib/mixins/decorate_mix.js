/**
 * Mix decorate support
 * @private
 * @function decorateMix
 * @param {function} BaseClass - Class to mix
 * @returns {function} Mixed class
 */
'use strict'

const debug = require('debug')('clay:lump:decorate')

const assertIsFunction = (obj, what = '') => {
  let type = typeof obj
  if (type !== 'function') {
    throw new Error(`${what} must be a function, but given: "${type}"`)
  }
}

/** @lends decorateMix */
function decorateMix (BaseClass) {
  /** @class */
  class DecorateMixed extends BaseClass {
    get $$decorateMixed () {
      return true
    }

    /**
     * Decorate a method
     * @param {string} methodName - Name of method
     * @param {function} decorate - Decorate function
     * @returns {DecorateMixed} Returns this
     */
    decorate (methodName, decorate) {
      if (arguments.length === 1) {
        return this.decorateAll(arguments[0])
      }
      const method = this[methodName]
      if (!method) {
        throw new Error(`Method not found with name: "${methodName}"`)
      }
      assertIsFunction(method, 'decoration target')
      assertIsFunction(decorate, 'decorate')
      debug(`Decorate method: ${methodName}`)
      const decorated = decorate(method)
      assertIsFunction(decorated, 'decorated function')
      this[methodName] = decorated
      return this
    }

    decorateAll (decorates) {
      for (const name of Object.keys(decorates)) {
        this.decorate(name, decorates[name])
      }
      return this
    }
  }

  return DecorateMixed
}

module.exports = decorateMix
