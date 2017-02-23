/**
 * Test case for clayResource.
 * Runs with mocha.
 */
'use strict'

const ClayResource = require('../lib/clay_resource.js')
const { ok, equal } = require('assert')
const co = require('co')

describe('clay-resource', function () {
  this.timeout(3000)

  before(() => co(function * () {

  }))

  after(() => co(function * () {

  }))

  it('Clay resource', () => co(function * () {
    let resource = new ClayResource('hoge@1.0.0', {
      one () {
        return {}
      }
    })
    ok(resource)
    ok(resource.one)
    equal(resource.name, 'hoge')
    equal(resource.version, '1.0.0')
  }))
})

/* global describe, before, after, it */
