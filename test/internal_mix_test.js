/**
 * Test case for internalMix.
 * Runs with mocha.
 */
'use strict'

const internalMix = require('../lib/mixins/internal_mix.js')
const { ok } = require('assert')


describe('internal-mix', function () {
  this.timeout(3000)

  before(async () => {

  })

  after(async () => {

  })

  it('Internal mix', async () => {
    let internalMixed = internalMix(class {})
    ok(internalMixed)
  })
})

/* global describe, before, after, it */
