/**
 * Test case for subMix.
 * Runs with mocha.
 */
'use strict'

const subMix = require('../lib/mixins/sub_mix.js')
const { ok } = require('assert')


describe('sub-mix', function () {
  this.timeout(3000)

  before(async () => {

  })

  after(async () => {

  })

  it('Sub mix', async () => {
    class Hoge {

    }
    let HogeWithSub = subMix(Hoge)
    ok(HogeWithSub)
  })
})

/* global describe, before, after, it */
