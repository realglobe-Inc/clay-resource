/**
 * Test case for annotateMix.
 * Runs with mocha.
 */
'use strict'

const annotateMix = require('../lib/mixins/annotate_mix.js')
const { ok } = require('assert')
const co = require('co')

describe('annotate-mix', function () {
  this.timeout(3000)

  before(() => co(function * () {

  }))

  after(() => co(function * () {

  }))

  it('Annotate mix', () => co(function * () {
    const annotateMixed = annotateMix(class {

    })
    ok(annotateMixed)
  }))
})

/* global describe, before, after, it */
