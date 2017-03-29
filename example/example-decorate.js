'use strict'

const { fromDriver } = require('clay-resource')
const clayDriverMemory = require('clay-driver-memory')

async function tryDecoration () {
  let driver = clayDriverMemory()
  let Product = fromDriver(driver, 'Product')

  // Decorate resource method
  Product.decorate('create', (create) => async function decoratedCrate (attributes) {
    // Add custom check before create
    {
      let ok = /^[a-zA-Z\d].$/.test(attributes.name)
      if (ok) {
        throw new Error('Invalid name!')
      }
    }
    let created = await create(attributes) // Call original method

    // Add custom logging after created
    {
      let logMsg = '[product] New Product created:' + created.id
      console.log(logMsg)
    }
    return created
  })

  let created = await Product.create({ name: 'foo' })
  /* ... */
}

tryDecoration()
