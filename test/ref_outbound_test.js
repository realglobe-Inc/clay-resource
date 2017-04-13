/**
 * Test case for refOutbound.
 * Runs with mocha.
 */
'use strict'

const refOutbound = require('../lib/outbounds/ref_outbound.js')
const create = require('../lib/create')
const { equal } = require('assert')
const co = require('co')

describe('ref-outbound', function () {
  this.timeout(3000)

  before(() => co(function * () {

  }))

  after(() => co(function * () {

  }))

  it('Ref outbound', () => co(function * () {
    let resource01 = create('Foo')
    let resource02 = create('Bar')
    let outbound = refOutbound(resource01)
    let entities = yield outbound(resource02, [ { foo: 'bar' } ])
    equal(entities.length, 1)
  }))
})

/* global describe, before, after, it */
