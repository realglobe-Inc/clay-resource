/**
 * Create a ClayResource instance
 * @function create
 * @param {...*} args
 * @returns {ClayResource}
 */
'use strict'

const ClayResource = require('./clay_resource')

/** @lends create */
function create (...args) {
  return new ClayResource(...args)
}

module.exports = create
