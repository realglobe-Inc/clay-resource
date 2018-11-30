/**
 * Test case for outboundMix.
 * Runs with mocha.
 */
'use strict'

const outboundMix = require('../lib/mixins/outbound_mix.js')
const collectionMix = require('../lib/mixins/collection_mix')
const assert = require('assert')


describe('outbound-mix', function () {
  this.timeout(3000)

  before(async () => {

  })

  after(async () => {

  })

  it('Outbound mix', async () => {
    const OutboundMix = outboundMix(collectionMix(class BaseClass {}))
    const outbound = new OutboundMix()
    assert.ok(outbound)
  })

  it('Outbound mix. outboundEntityHash()', async () => {
    const OutboundMix = outboundMix(collectionMix(class BaseClass {}))
    const outbound = new OutboundMix()

    outbound.addOutbound('outbound1', (resource, entities) => {
      for (const entity of entities) {
        entity.foo = 'foo'
      }
      return Promise.resolve(entities)
    })

    const entities = await outbound.outboundEntityHash({
      '1': { id: '1' },
      '2': null,
    })
    assert.deepStrictEqual(entities, {
      '1': { id: '1', foo: 'foo' },
      '2': null,
    })

  })
})

/* global describe, before, after, it */
