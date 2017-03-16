/**
 * Create clayResource class from driver
 * @function fromDriver
 * @param {Driver} driver - Driver to bind
 * @param {string} nameString - Resource name string
 * @param {Object} [options={}] - Optional settings
 * @returns {ClayResource} Created class
 * @example
 * const { fromDriver } = require('clay-resource')
 * const { SqliteDriver } = require('clay-driver-sqlite')
 * {
 *   let driver = new SqliteDriver('var/test.db')
 *   let resource = fromDriver(driver)
 * }
 */
'use strict'

const { DriverSpec } = require('clay-constants')
const { RESOURCE_BINDABLE_METHODS } = DriverSpec
const clayResourceName = require('clay-resource-name')
const create = require('./create')

/** @lends fromDriver */
function fromDriver (driver, nameString, options = {}) {
  let resourceName = String(clayResourceName(nameString))
  let bounds = RESOURCE_BINDABLE_METHODS.split(',')
    .reduce((bounds, methodName) => Object.assign(bounds, {
      [methodName]: driver[ methodName ].bind(driver, resourceName)
    }), {})
  return create(resourceName, bounds, options)
}

module.exports = fromDriver

