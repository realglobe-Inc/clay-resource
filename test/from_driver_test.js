/**
 * Test case for fromDriver.
 * Runs with mocha.
 */
'use strict'

const fromDriver = require('../lib/from_driver.js')
const clayDriverMemory = require('clay-driver-memory')
const { ok, equal } = require('assert')
const asleep = require('asleep')
const co = require('co')

describe('from-driver', function () {
  this.timeout(3000)

  before(() => co(function * () {

  }))

  after(() => co(function * () {

  }))

  it('From driver', () => co(function * () {
    let driver = clayDriverMemory()
    let resource = fromDriver(driver, 'hogehoge', { annotate: true })

    let created = yield resource.create({ foo: 'bar' })
    ok(created)
    ok(created.id)
    ok(created.$$at)

    let { id } = created

    let one = yield resource.one(id)
    equal(one.foo, 'bar')
    equal(String(one.id), String(id))

    yield asleep(10)

    let updated = yield resource.update(id, { foo2: 'bar2' })
    ok(updated)
    equal(updated.foo, 'bar')
    equal(updated.foo2, 'bar2')
    ok(updated.$$at > created.$$at)

    yield resource.destroy(id)
  }))

  it('From driver without annotate', () => co(function * () {
    let driver = clayDriverMemory()
    let resource = fromDriver(driver, 'hogehoge')

    let created = yield resource.create({ foo: 'bar' })
    ok(!created.$$at)
  }))

  it('From driver bulk', () => co(function * () {
    let driver = clayDriverMemory()
    let resource = fromDriver(driver, 'hogehoge', { annotate: true })

    let [ created ] = yield resource.createBulk([ { foo: 'bar' } ])
    ok(created)
    ok(created.id)
    ok(created.$$at)

    let { id } = created
    let one = (yield resource.oneBulk([ id ]))[ id ]
    equal(one.foo, 'bar')
    equal(String(one.id), String(created.id))

    yield asleep(10)

    let updated = (yield resource.updateBulk({ [id]: { foo2: 'bar2' } }))[ id ]
    ok(updated)
    equal(updated.foo, 'bar')
    equal(updated.foo2, 'bar2')
    ok(updated.$$at > created.$$at)

    let count = yield resource.destroyBulk([ created.id ])
    equal(count, 1)
  }))
})

/* global describe, before, after, it */
