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
      const s = this
      if (arguments.length === 1) {
        return s.decorateAll(arguments[ 0 ])
      }
      let method = s[ methodName ]
      if (!method) {
        throw new Error(`Method not found with name: "${methodName}"`)
      }
      assertIsFunction(method, 'decoration target')
      assertIsFunction(decorate, 'decorate')
      debug(`Decorate method: ${methodName}`)
      let decorated = decorate(method)
      assertIsFunction(decorated, 'decorated function')
      s[ methodName ] = decorated
      return s
    }

    decorateAll (decorates) {
      const s = this
      for (let name of Object.keys(decorates)) {
        s.decorate(name, decorates[ name ])
      }
      return s
    }
  }

  return DecorateMixed
}

module.exports = decorateMix
