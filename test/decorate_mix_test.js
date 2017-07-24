/**
 * Test case for decorateMix.
 * Runs with mocha.
 */
'use strict'

const decorateMix = require('../lib/mixins/decorate_mix.js')
const {ok} = require('assert')

describe('decorate-mix', function () {
  this.timeout(3000)

  before(async () => {

  })

  after(async () => {

  })

  it('Decorate mix', async () => {
    let decorateMixed = decorateMix(class {})
    ok(decorateMixed)
  })
})

/* global describe, before, after, it */
