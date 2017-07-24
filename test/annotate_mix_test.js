/**
 * Test case for annotateMix.
 * Runs with mocha.
 */
'use strict'

const annotateMix = require('../lib/mixins/annotate_mix.js')
const {ok} = require('assert')

describe('annotate-mix', function () {
  this.timeout(3000)

  before(async () => {

  })

  after(async () => {

  })

  it('Annotate mix', async () => {
    const annotateMixed = annotateMix(class {

    })
    ok(annotateMixed)
  })
})

/* global describe, before, after, it */
