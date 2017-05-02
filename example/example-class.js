'use strict'

const { ClayResource } = require('clay-resource')
const clayDriverMemory = require('clay-driver-memory')

// Extends ClayResource class
class UserResource extends ClayResource {
  /* ... */
}

{
  let driver = clayDriverMemory()
  let userResource = UserResource.fromDriver(driver, 'User')

  let user = yield userResource.create({ name: 'Taka Okunishi' })
  /* ... */
}

