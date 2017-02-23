'use strict'

const co = require('co')
const { fromDriver } = require('clay-resource')
const clayDriverMemory = require('clay-driver-memory')

co(function * () {
  let driver = clayDriverMemory()
  let Products = fromDriver(driver, 'products')

  let product01 = yield Products.create({ name: 'Awesome Box' })
  /* ... */
}).catch((err) => {
  console.error(err)
})
