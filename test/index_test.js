/**
 * Test case for index.
 * Runs with mocha.
 */
'use strict'

const index = require('../lib/index.js')
const { ok } = require('assert')


describe('create', function () {
  this.timeout(3000)

  before(async () => {

  })

  after(async () => {

  })

  it('index', async () => {
    let created = index({})
    ok(created)

    ok(index.create)
    ok(index.ClayResource)
    ok(index.fromDriver)
  })
})

/* global describe, before, after, it */
