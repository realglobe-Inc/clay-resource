/**
 * Create clayResource class from driver
 * @function fromDriver
 * @param {Driver} driver - Driver to bind
 * @param {string} nameString - Resource name string
 * @param {Object} [options={}] - Optional settings
 * @returns {ClayResource} Resource instance
 * @example
 * const { fromDriver } = require('clay-resource')
 * const { SqliteDriver } = require('clay-driver-sqlite')
 * {
 *   let driver = new SqliteDriver('var/test.db')
 *   let resource = fromDriver(driver)
 * }
 */
'use strict'

const ClayResource = require('./clay_resource')

/** @lends fromDriver */
function fromDriver (driver, nameString, options = {}) {
  return ClayResource.fromDriver(driver, nameString, options)
}

module.exports = fromDriver
