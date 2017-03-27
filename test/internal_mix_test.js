/**
 * Test case for internalMix.
 * Runs with mocha.
 */
'use strict'

const internalMix = require('../lib/mixins/internal_mix.js')
const { ok } = require('assert')
const co = require('co')

describe('internal-mix', function () {
  this.timeout(3000)

  before(() => co(function * () {

  }))

  after(() => co(function * () {

  }))

  it('Internal mix', () => co(function * () {
    let internalMixed = internalMix(class {})
    ok(internalMixed)
  }))
})

/* global describe, before, after, it */
