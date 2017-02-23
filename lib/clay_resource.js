/**
 * Resource accessor
 * @class ClayResource
 * @param {string} nameString - Name string
 * @param {Object.<string, function>} bounds - Method bounds
 * @param {Object} [options={}] - Optional settings
 */
'use strict'

const { EventEmitter } = require('events')
const { parseNameString } = require('./parsing')

/** @lends ClayResource */
class ClayResource extends EventEmitter {
  get $$resource () {
    return true
  }

  constructor (nameString, bounds = {}, options = {}) {
    super(...arguments)
    const s = this
    let [ name, version ] = parseNameString(nameString)
    Object.assign(s, { name, version }, bounds)
  }
}

module.exports = ClayResource
