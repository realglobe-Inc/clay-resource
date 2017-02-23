/**
 * Parse name string
 * @function parseNameString
 * @param {string} nameString - String of resource name
 * @returns {string[]} - Parsed string
 * @example
 * parseNameString('products') // -> ["products", "latest"]
 * parseNameString('products@1.0') // -> ["products", "1.0"]
 *
 */
'use strict'

/** @lends parseNameString */
function parseNameString (nameString) {
  if (typeof nameString === 'object') {
    const { name, version } = nameString
    return [ name, version ]
  }
  let [ name, version = 'latest' ] = nameString.split('@')
  return [ name, version ]
}

module.exports = parseNameString
