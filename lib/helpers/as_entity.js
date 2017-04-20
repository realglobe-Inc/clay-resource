/**
 * Convert as entity
 * @function asEntity
 * @param {Object} attributes - Entity attributes
 * @returns {Object} entity
 */
'use strict'

const { decorate, create } = require('clay-entity')

/** @lends asEntity */
function asEntity (attributes) {
  return decorate(create(
    Object.assign({}, attributes, { id: false }))
  )
}

module.exports = asEntity
