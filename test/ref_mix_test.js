/**
 * Test case for refMix.
 * Runs with mocha.
 */
'use strict'

const refMix = require('../lib/mixins/ref_mix.js')
const { ok } = require('assert')
const co = require('co')

describe('ref-mix', function () {
  this.timeout(3000)

  before(() => co(function * () {

  }))

  after(() => co(function * () {

  }))

  it('Ref mix', () => co(function * () {
    const refMixed = refMix(
      class {}
    )
    ok(refMixed)
  }))
})

/* global describe, before, after, it */
