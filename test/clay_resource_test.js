/**
 * Test case for clayResource.
 * Runs with mocha.
 */
'use strict'

const ClayResource = require('../lib/clay_resource.js')
const {ok, equal, deepEqual} = require('assert')
const {MemoryDriver} = require('clay-driver-memory')
const {
  ENTITY_CREATE,
  ENTITY_CREATE_BULK,
  ENTITY_UPDATE,
  ENTITY_UPDATE_BULK,
  ENTITY_DESTROY,
  ENTITY_DESTROY_BULK,
  ENTITY_DROP,
  INVALIDATE,
  INVALIDATE_BULK,
} = require('../lib/resource_events')

describe('clay-resource', function () {
  this.timeout(30000)

  before(async () => {

  })

  after(async () => {

  })

  it('Clay resource', async () => {
    const resource = new ClayResource('hoge@example.com', {
      one () {
        return {}
      }
    })
    ok(resource)
    ok(resource.one)
    equal(resource.name, 'hoge')
    equal(resource.domain, 'example.com')

    let clone = resource.clone()
    ok(clone)
    ok(clone.one)
    equal(clone.name, 'hoge')
    equal(clone.domain, 'example.com')

    equal(resource.refOf(1), 'hoge@example.com#1')
  })

  it('Ref and sub', async () => {
    const resource01 = new ClayResource('resource01')
    const resource02 = new ClayResource('resource02')
    const resource03 = resource01.sub('03')
    resource01.refs(resource02)
    deepEqual(Object.keys(resource03.refs()), ['resource01', 'resource02'])
  })

  it('Register prepare task', async () => {
    let count = 0
    const counter = () => {
      count++
      return count
    }
    let resource01 = new ClayResource('resource01')
    resource01.addPrepareTask('counter', counter)
    resource01.setNeedsPrepare()
    resource01.prepareIfNeeded()
    resource01.prepareIfNeeded()
    resource01.setNeedsPrepare()
    resource01.prepareIfNeeded()
    resource01.prepareIfNeeded()

    ok(resource01.internal('foo'))
    ok(resource01.sub('foo'))

    equal(resource01.internal('foo').name, 'foo.resource01')
  })

  it('Do decorate', async () => {
    let resource01 = new ClayResource('resource01')
    resource01.foo = (arg) => 'foo:' + arg
    resource01.decorate('foo', (foo) => (arg) => 'decorated:' + foo(arg))
    equal(resource01.foo('bar'), 'decorated:foo:bar')
  })

  it('Extension', async () => {
    class UserResource extends ClayResource {
    }

    const driver = new MemoryDriver()
    const userResource = UserResource.fromDriver(driver, 'User')
    const user = await userResource.create({name: 'foo'})
    equal(user.name, 'foo')
  })

  it('Emit', async () => {
    class UserResource extends ClayResource {
    }

    const driver = new MemoryDriver()
    const userResource = UserResource.fromDriver(driver, 'User')
    const createEvents = []
    const updateEvents = []
    userResource.on(ENTITY_CREATE, (d) => {
      createEvents.push(d)
    })
    userResource.on(ENTITY_UPDATE, (d) => {
      updateEvents.push(d)
    })
    const user = await userResource.create({name: 'foo'})
    equal(user.name, 'foo')
    await user.update({name: 'foo2'})
    equal(createEvents.length, 1)
    equal(updateEvents.length, 1)
  })

  // https://github.com/realglobe-Inc/claydb/issues/16
  it('All with paging', async () => {
    class UserResource extends ClayResource {
    }

    const driver = new MemoryDriver()
    const userResource = UserResource.fromDriver(driver, 'User')
    for (let i = 0; i < 120; i++) {
      await userResource.create({i})
    }

    const users = await userResource.all({i: {$gt: 10}})
    equal(users.length, 109)
  })
})

/* global describe, before, after, it */
