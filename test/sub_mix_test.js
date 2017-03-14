/**
 * Test case for subMix.
 * Runs with mocha.
 */
'use strict'

const subMix = require('../lib/mixins/sub_mix.js')
const { ok } = require('assert')
const co = require('co')

describe('sub-mix', function () {
  this.timeout(3000)

  before(() => co(function * () {

  }))

  after(() => co(function * () {

  }))

  it('Sub mix', () => co(function * () {
    class Hoge {

    }
    let HogeWithSub = subMix(Hoge)
    ok(HogeWithSub)
  }))
})

/* global describe, before, after, it */
