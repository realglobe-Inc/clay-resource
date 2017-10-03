'use strict'

const {fromDriver} = require('clay-resource')
const clayDriverMemory = require('clay-driver-memory')

async function tryExample () {
  const driver = clayDriverMemory()
  const Product = fromDriver(driver, 'Product')

  {
    const product01 = await Product.create({name: 'Awesome Box', price: 100})
    const {id} = product01
    await Product.update(id, {price: 200})

    const {meta, entities} = await Product.list({
      filter: {price: {$gt: 100}}, // Supported operators: "$gt", "$gte", "$lt", "$lte", "$like", "$in" ...etc
      page: {size: 25, number: 1}
    })
    console.log('Found products:', entities, 'total:', meta.total)
    await Product.destroy(id)
  }
}

tryExample()
