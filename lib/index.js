/**
 * Resource accessor for ClayDB
 * @module clay-resource
 */

'use strict'

const create = require('./create')
const ClayResource = require('./clay_resource')
const fromDriver = require('./from_driver')

let lib = create.bind(this)

Object.assign(lib, ClayResource, {
  create,
  ClayResource,
  fromDriver
})

module.exports = lib
