/**
 * Test case for resourceEvents.
 * Runs with mocha.
 */
'use strict'

const ResourceEvents = require('../lib/resource_events.js')
const { ok } = require('assert')


describe('resource-events', function () {
  this.timeout(3000)

  before(async () => {

  })

  after(async () => {

  })

  it('Resource events', async () => {
    for (let name of Object.keys(ResourceEvents)) {
      ok(ResourceEvents[ name ])
    }
  })
})

/* global describe, before, after, it */
