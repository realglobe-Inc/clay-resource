/**
 * Test case for decorateMix.
 * Runs with mocha.
 */
'use strict'

const decorateMix = require('../lib/mixins/decorate_mix.js')
const { ok } = require('assert')
const co = require('co')

describe('decorate-mix', function () {
  this.timeout(3000)

  before(() => co(function * () {

  }))

  after(() => co(function * () {

  }))

  it('Decorate mix', () => co(function * () {
    let decorateMixed = decorateMix(class {})
    ok(decorateMixed)
  }))
})

/* global describe, before, after, it */
