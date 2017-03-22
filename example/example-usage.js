'use strict'

const { fromDriver } = require('clay-resource')
const clayDriverMemory = require('clay-driver-memory')

async function tryExample () {
  let driver = clayDriverMemory()
  let Product = fromDriver(driver, 'Product')

  {
    let product01 = await Product.create({ name: 'Awesome Box', price: 100 })
    let { id } = product01
    await Product.update(id, { price: 200 })

    let { meta, entities } = await Product.list({
      filter: { price: { $gt: 100 } },
      page: { size: 25, number: 1 }
    })
    console.log('Found products:', entities, 'total:', meta.total)
    await Product.destroy(id)
  }
}

tryExample()
