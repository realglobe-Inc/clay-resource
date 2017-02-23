/**
 * Test case for fromDriver.
 * Runs with mocha.
 */
'use strict'

const fromDriver = require('../lib/from_driver.js')
const clayDriverMemory = require('clay-driver-memory')
const assert = require('assert')
const co = require('co')

describe('from-driver', function () {
  this.timeout(3000)

  before(() => co(function * () {

  }))

  after(() => co(function * () {

  }))

  it('From driver', () => co(function * () {
    let driver = clayDriverMemory()
    let resource = fromDriver(driver, 'hogehoge')

    let created = yield resource.create({ foo: 'bar' })
    assert.ok(created)
  }))
})

/* global describe, before, after, it */
