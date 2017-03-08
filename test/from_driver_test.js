/**
 * Test case for fromDriver.
 * Runs with mocha.
 */
'use strict'

const fromDriver = require('../lib/from_driver.js')
const clayDriverMemory = require('clay-driver-memory')
const { decorate } = require('clay-entity')
const { ok, equal } = require('assert')
const asleep = require('asleep')
const { generate: generateKeys, verify } = require('clay-crypto')
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

    ok(!(yield resource.exists({ foo: 'bar' })))

    let created = yield resource.create({ foo: 'bar' })
    ok(created)
    ok(created.id)
    ok(created.$$at)

    ok(yield resource.exists({ foo: 'bar' }))

    equal(yield resource.count(), 1)

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

    let first = yield resource.first({ foo2: 'bar2' })
    ok(first)
    ok(first.foo2, 'bar2')

    yield resource.destroy(id)
  }))

  it('From driver without annotate', () => co(function * () {
    let driver = clayDriverMemory()
    let resource = fromDriver(driver, 'hogehoge')

    let created = yield resource.create({ foo: 'bar' })
    ok(!created.$$at)

    let { id } = created

    let one = yield resource.one(id)
    equal(one.foo, 'bar')
    equal(String(one.id), String(id))
    ok(!one.$$at)

    let updated = yield resource.update(id, { foo2: 'bar2' })
    ok(updated)
    equal(updated.foo, 'bar')
    equal(updated.foo2, 'bar2')
    ok(!updated.$$at)

    yield resource.destroy(id)

    // Bulk
    {
      let [ created ] = yield resource.createBulk([ { foo: 'bar' } ])
      ok(created)
      ok(created.id)
      ok(!created.$$at)

      let { id } = created
      let one = (yield resource.oneBulk([ id ]))[ id ]
      equal(one.foo, 'bar')
      equal(String(one.id), String(created.id))

      yield asleep(10)

      let updated = (yield resource.updateBulk({ [id]: { foo2: 'bar2' } }))[ id ]
      ok(updated)
      equal(updated.foo, 'bar')
      equal(updated.foo2, 'bar2')
      ok(!updated.$$at)

      let count = yield resource.destroyBulk([ created.id ])
      equal(count, 1)
    }
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
  it('From driver seal', () => co(function * () {
    let driver = clayDriverMemory()
    let resource = fromDriver(driver, 'hogehoge').clone().toggleAnnotate(true)
    let created = yield resource.create({ foo: 'bar' })
    let { id } = created

    let { privateKey, publicKey } = generateKeys()
    yield resource.seal(privateKey, { by: 'foo!' })

    let one = yield resource.one(id)
    ok(one.$$seal)
    equal(one.$$by, 'foo!')

    ok(decorate(one).verify(publicKey))
    one.hoge = 'fuge'
    ok(!decorate(one).verify(publicKey))
  }))
})

/* global describe, before, after, it */
