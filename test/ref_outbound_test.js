/**
 * Test case for refOutbound.
 * Runs with mocha.
 */
'use strict'

const refOutbound = require('../lib/outbounds/ref_outbound.js')
const create = require('../lib/create')
const { equal } = require('assert')


describe('ref-outbound', function () {
  this.timeout(3000)

  before(async () => {

  })

  after(async () => {

  })

  it('Ref outbound', async () => {
    let resource01 = create('Foo')
    let resource02 = create('Bar')
    let outbound = refOutbound(resource01)
    let entities = await outbound(resource02, [ { foo: 'bar' } ])
    equal(entities.length, 1)
  })
})

/* global describe, before, after, it */
