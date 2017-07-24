/**
 * Test case for prepareMix.
 * Runs with mocha.
 */
'use strict'

const prepareMix = require('../lib/mixins/prepare_mix.js')
const { ok } = require('assert')


describe('prepare-mix', function () {
  this.timeout(3000)

  before(async () => {

  })

  after(async () => {

  })

  it('Prepare mix', async () => {
    const PrepareMixed = prepareMix(class {})
    let prepareMixed = new PrepareMixed()
    prepareMixed.addPrepareTask('foo', () => ({ foo: 1 }))
    ok(prepareMixed.hasPrepareTask('foo'))
    prepareMixed.removePrepareTask('foo')
    ok(!prepareMixed.hasPrepareTask('foo'))
  })
})

/* global describe, before, after, it */
