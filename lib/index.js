/**
 * Resource accessor for ClayDB
 * @module clay-resource
 */

'use strict'

const create = require('./create')
const ClayResource = require('./clay_resource')
const fromDriver = require('./from_driver')
const ResourceEvents = require('./resource_events')

const lib = create.bind(this)

Object.assign(lib, ClayResource, {
  create,
  ClayResource,
  ResourceEvents,
  fromDriver
})

module.exports = lib
