/**
 * Test case for index.
 * Runs with mocha.
 */
'use strict'

const index = require('../lib/index.js')
const { ok } = require('assert')
const co = require('co')

describe('create', function () {
  this.timeout(3000)

  before(() => co(function * () {

  }))

  after(() => co(function * () {

  }))

  it('index', () => co(function * () {
    let created = index({})
    ok(created)

    ok(index.create)
    ok(index.ClayResource)
    ok(index.fromDriver)
  }))
})

/* global describe, before, after, it */
