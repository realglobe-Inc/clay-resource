/**
 * Mixin for parse feature. Convert in-bind data like attributes to create/update
 * @function parseMix
 * @param {function} BaseClass - Class to mix
 * @returns {function} Mixed class
 */
'use strict'

const co = require('co')

const toAttributes = (values) => Object.assign({}, values)

/** @lends parseMix */
function parseMix (BaseClass) {
  class ParseMixed extends BaseClass {
    get $$parseMixed () {
      return true
    }

    constructor () {
      super(...arguments)
      const s = this
      s._parsers = new Map()
    }

    /**
     * Add parser
     * @param {string} name - Name of parser
     * @param {function} parser - Parser function
     * @returns {ParseMixed}
     */
    addParser (name, parser) {
      const s = this
      s._parsers.set(name, parser)
      return s
    }

    /**
     * Check if has parser
     * @param {string} name - Name of parser
     * @returns {boolean}
     */
    hasParser (name) {
      const s = this
      return s._parsers.has(name)
    }

    /**
     * Remove parser
     * @param {string} name - Name of parser
     * @returns {ParseMixed}
     */
    removeParser (name) {
      const s = this
      s._parsers.delete(name)
      return s
    }

    /**
     * Apply parser to array of attributes
     * @param {EntityAttributes[]} attributesArray - Array of attributes
     * @returns {Promise.<EntityAttributes[]>} Parsed attributes array
     */
    applyParser (attributesArray) {
      const s = this
      return co(function * () {
        for (let parser of s._parsers.values()) {
          attributesArray = yield Promise.resolve(parser(attributesArray))
        }
        return attributesArray
      })
    }

    /**
     * Parse attributes
     * @param {EntityAttributes} attributes - Attributes to parse
     * @returns {Promise.<EntityAttributes>} Parsed attributes
     */
    parseAttributes (attributes) {
      const s = this
      return co(function * () {
        if (!attributes) {
          return attributes
        }
        attributes = toAttributes(attributes)
        let parsed = yield s.applyParser([ attributes ])
        return parsed[ 0 ]
      })
    }

    /**
     * Parse attributes array
     * @param {EntityAttributes[]} attributesArray - Attributes array to parse
     * @returns {Promise.<EntityAttributes[]>} Parsed attributes array
     */
    parseAttributesArray (attributesArray) {
      const s = this
      return co(function * () {
        if (!attributesArray) {
          return attributesArray
        }
        return yield s.applyParser(attributesArray.map(toAttributes))
      })
    }

    /**
     * Parse attributes hash
     * @param {AttributesHash} attributesHash
     * @returns {Promise.<AttributesHash>}
     */
    parseAttributesHash (attributesHash) {
      const s = this
      return co(function * () {
        if (!attributesHash) {
          return attributesHash
        }
        attributesHash = Object.assign({}, attributesHash)
        let keys = Object.keys(attributesHash)
        let attributesArray = yield s.applyParser(keys.map((key) => attributesHash[ key ]).map(toAttributes))
        for (let i = 0; i < keys.length; i++) {
          attributesHash[ keys[ i ] ] = attributesArray[ i ]
        }
        return attributesHash
      })
    }

  }
  return ParseMixed
}

module.exports = parseMix

/** @typedef {Object} EntityAttributes */
/** @typedef {Object.<string, EntityAttributes>} AttributesHash */
