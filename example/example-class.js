'use strict'

const {ClayResource} = require('clay-resource')
const clayDriverMemory = require('clay-driver-memory')

// Extends ClayResource class
class UserResource extends ClayResource {
  /* ... */
}

void async function () {
  const driver = clayDriverMemory()
  const userResource = UserResource.fromDriver(driver, 'User')

  const user = await userResource.create({name: 'Taka Okunishi'})
  /* ... */
}()

