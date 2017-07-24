/**
 * Test case for clayResource.
 * Runs with mocha.
 */
'use strict'

const ClayResource = require('../lib/clay_resource.js')
const {ok, equal, deepEqual} = require('assert')
const {MemoryDriver} = require('clay-driver-memory')

describe('clay-resource', function () {
  this.timeout(3000)

  before(async () => {

  })

  after(async () => {

  })

  it('Clay resource', async () => {
    let resource = new ClayResource('hoge@example.com', {
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
  })

  it('Ref and sub', async () => {
    let resource01 = new ClayResource('resource01')
    let resource02 = new ClayResource('resource02')
    let resource03 = resource01.sub('03')
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

    let driver = new MemoryDriver()
    let userResource = UserResource.fromDriver(driver, 'User')
    let user = await userResource.create({name: 'foo'})
    equal(user.name, 'foo')
  })
})

/* global describe, before, after, it */
