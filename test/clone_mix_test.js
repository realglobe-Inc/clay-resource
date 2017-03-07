/**
 * Test case for cloneMix.
 * Runs with mocha.
 */
'use strict'

const cloneMix = require('../lib/mixins/clone_mix.js')
const { ok } = require('assert')
const co = require('co')

describe('clone-mix', function () {
  this.timeout(3000)

  before(() => co(function * () {

  }))

  after(() => co(function * () {

  }))

  it('Clone mix', () => co(function * () {
    class Hoge {

    }
    const HogeClone = cloneMix(Hoge)
    ok(new HogeClone().clone())
  }))
})

/* global describe, before, after, it */
