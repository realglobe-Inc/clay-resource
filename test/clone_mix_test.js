/**
 * Test case for cloneMix.
 * Runs with mocha.
 */
'use strict'

const cloneMix = require('../lib/mixins/clone_mix.js')
const {ok} = require('assert')

describe('clone-mix', function () {
  this.timeout(3000)

  before(async () => {

  })

  after(async () => {

  })

  it('Clone mix', async () => {
    class Hoge {

    }

    const HogeClone = cloneMix(Hoge)
    ok(new HogeClone().clone())
  })
})

/* global describe, before, after, it */
