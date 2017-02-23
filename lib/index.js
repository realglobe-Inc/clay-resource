/**
 * Resource accessor for ClayDB
 * @module clay-resource
 */

'use strict'

const create = require('./create')
const ClayResource = require('./clay_resource')

let lib = create.bind(this)

Object.assign(lib, ClayResource, {
  create,
  ClayResource
})

module.exports = lib
