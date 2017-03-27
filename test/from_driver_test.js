/**
 * Test case for fromDriver.
 * Runs with mocha.
 */
'use strict'

const fromDriver = require('../lib/from_driver.js')
const clayDriverMemory = require('clay-driver-memory')
const { decorate } = require('clay-entity')
const { ok, equal, strictEqual, deepEqual } = require('assert')
const asleep = require('asleep')
const clayPolicy = require('clay-policy')
const { refTo } = require('clay-resource-ref')
const { generate: generateKeys, verify } = require('clay-crypto')
const co = require('co')
const { DataTypes } = clayPolicy

describe('from-driver', function () {
  this.timeout(3000)

  before(() => co(function * () {

  }))

  after(() => co(function * () {

  }))

  it('From driver', () => co(function * () {
    let driver = clayDriverMemory()
    let resource = fromDriver(driver, 'hogehoge', { annotates: true })

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

    // Sub resource
    {
      let hogeResource = resource.sub('hoge')
      ok(hogeResource)
      yield hogeResource.create({ fooSub: 'barSub' })

      strictEqual(resource.sub('hoge'), resource.sub('hoge'), 'Using cache')

      equal(hogeResource.name, 'hogehogehoge')
      ok(hogeResource.refs()[ 'hogehoge' ])
    }

    {
      let notFoundError
      try {
        yield resource.update('__invalid_id__', {})
      } catch (thrown) {
        notFoundError = thrown
      }
      ok(notFoundError)
      equal(notFoundError.name, 'NotFoundError')
    }

  }))

  it('From driver without annotate', () => co(function * () {
    let driver = clayDriverMemory()
    let resource = fromDriver(driver, 'hogehoge').annotates(false)

    let created = yield resource.create({ foo: 'bar' })

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
    let resource = fromDriver(driver, 'hogehoge').clone().annotates(true)
    let created = yield resource.create({ foo: 'bar' })
    let { id } = created

    let { privateKey, publicKey } = generateKeys()
    yield resource.seal(privateKey, { by: 'foo!' })

    let one = yield resource.one(id)
    ok(one.$$seal)
    equal(one.$$as, 'hogehoge')
    equal(one.$$by, 'foo!')

    ok(decorate(one).verify(publicKey))
    one.hoge = 'fuge'
    ok(!decorate(one).verify(publicKey))
  }))

  it('Resolve refs', () => co(function * () {
    let driver = clayDriverMemory()
    let Org = fromDriver(driver, 'Org')
    let User = fromDriver(driver, 'User').refs(Org)
    let org01 = yield Org.create({ name: 'org01' })
    let user01 = yield User.create({
      name: 'user01',
      org: { $ref: refTo(Org, org01.id) }
    })
    equal(user01.org.name, 'org01')
    let user02 = yield User.create({
      name: 'user02',
      org: org01
    })
    equal(user02.org.name, 'org01')

    equal(driver._storages.User[ String(user02.id) ].org.$ref, `Org#${org01.id}`)

    let Team = fromDriver(driver, 'Team').refs(User)
    let team01 = yield Team.create({
      name: 'Team01',
      users: [ { $ref: refTo(User, user01.id) } ]
    })
    ok(team01)
    equal(team01.users[ 0 ].name, 'user01')
  }))

  it('Policy check', () => co(function * () {
    const { STRING, DATE } = clayPolicy.DataTypes
    let driver = clayDriverMemory()
    let User = fromDriver(driver, 'User')

    User.setPolicy({
      username: {
        type: STRING,
        required: true
      },
      birthday: {
        type: DATE
      },
      rank: {
        type: STRING,
        oneOf: [ 'GOLD', 'SLIVER', 'BRONZE' ]
      }
    })

    let caught
    try {
      yield User.create({
        username: 'hoge',
        rank: 'SUPER'
      })
    } catch (thrown) {
      caught = thrown
    }
    ok(caught)
    deepEqual(caught.detail.failures.rank, {
      reason: 'value:unexpected',
      actual: 'SUPER',
      expects: { oneOf: [ 'GOLD', 'SLIVER', 'BRONZE' ] }
    })
  }))

  it('of', () => co(function * () {
    let driver = clayDriverMemory()
    let Product = fromDriver(driver, 'Product')
    let product01 = yield Product.of({ code: '#1234' })
    equal(product01.code, '#1234')
    let product02 = yield Product.of({ code: '#1234' })
    equal(String(product01).id, String(product02).id)
    yield Product.drop()
  }))

  it('Unique', () => co(function * () {
    let driver = clayDriverMemory()
    let Fruit = fromDriver(driver, 'Fruit')
    Fruit.policy({
      name: {
        type: DataTypes.STRING,
        unique: true
      }
    })
    yield Fruit.create({ name: 'banana' })
    let caught
    try {
      yield Fruit.create({ name: 'banana' })
    } catch (thrown) {
      caught = thrown
    }
    ok(caught)
    yield Fruit.drop()
  }))
})

/* global describe, before, after, it */
