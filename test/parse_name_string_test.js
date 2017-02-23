/**
 * Test case for parseNameString.
 * Runs with mocha.
 */
'use strict'

const parseNameString = require('../lib/parsing/parse_name_string.js')
const { deepEqual } = require('assert')
const co = require('co')

describe('parse-name-string', function () {
  this.timeout(3000)

  before(() => co(function * () {

  }))

  after(() => co(function * () {

  }))

  it('Parse name string', () => co(function * () {
    deepEqual(parseNameString('products'), [ 'products', 'latest' ])
    deepEqual(parseNameString('products@1.0.0'), [ 'products', '1.0.0' ])
    deepEqual(parseNameString({ name: 'products', version: '2.2.2' }), [ 'products', '2.2.2' ])
  }))
})

/* global describe, before, after, it */
