'use strict'

const { fromDriver, ResourceEvents } = require('clay-resource')
const clayDriverMemory = require('clay-driver-memory')

// Events fired from resource
const {
  ENTITY_CREATE,
  ENTITY_CREATE_BULK,
  ENTITY_UPDATE,
  ENTITY_UPDATE_BULK,
  ENTITY_DESTROY,
  ENTITY_DESTROY_BULK,
  ENTITY_DROP
} = ResourceEvents

async function tryEvents () {
  let driver = clayDriverMemory()
  let Product = fromDriver(driver, 'Product')

  Product.on(ENTITY_CREATE, ({ created }) => { /* ... */ })
  Product.on(ENTITY_CREATE_BULK, ({ created }) => { /* ... */ })
  Product.on(ENTITY_UPDATE, ({ id, updated }) => { /* ... */ })
  Product.on(ENTITY_UPDATE_BULK, ({ ids, updated }) => { /* ... */ })
  Product.on(ENTITY_DESTROY, ({ id, destroyed }) => { /* ... */ })
  Product.on(ENTITY_DESTROY_BULK, ({ ids, destroyed }) => { /* ... */ })
  Product.on(ENTITY_DROP, ({ dropped }) => { /* ... */ })
  {
    let product01 = await Product.create({ name: 'Awesome Box', price: 100 })
    /* ... */
  }
}

tryEvents()
