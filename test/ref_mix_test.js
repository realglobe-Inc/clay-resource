/**
 * Test case for refMix.
 * Runs with mocha.
 */
'use strict'

const refMix = require('../lib/mixins/ref_mix.js')
const { ok } = require('assert')


describe('ref-mix', function () {
  this.timeout(3000)

  before(async () => {

  })

  after(async () => {

  })

  it('Ref mix', async () => {
    const refMixed = refMix(
      class {}
    )
    ok(refMixed)
  })
})

/* global describe, before, after, it */
