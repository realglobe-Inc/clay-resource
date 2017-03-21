/**
 * Test case for clayResource.
 * Runs with mocha.
 */
'use strict'

const ClayResource = require('../lib/clay_resource.js')
const { ok, equal, deepEqual } = require('assert')
const co = require('co')

describe('clay-resource', function () {
  this.timeout(3000)

  before(() => co(function * () {

  }))

  after(() => co(function * () {

  }))

  it('Clay resource', () => co(function * () {
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
  }))

  it('Ref and sub', () => co(function * () {
    let resource01 = new ClayResource('resource01')
    let resource02 = new ClayResource('resource02')
    let resource03 = resource01.sub('03')
    resource01.refs(resource02)
    deepEqual(Object.keys(resource03.refs()), [ 'resource01', 'resource02' ])
  }))
})

/* global describe, before, after, it */
