/**
 * Mixin for entity
 * @function entityMix
 * @param {function} BaseClass - Class to mix
 * @returns {function} Mixed class
 */
'use strict'

const ENTITY_OUTBOUND_NAME = 'entity:outbound'
const { entityOutbound } = require('../outbounds')

/** @lends entityMix */
function entityMix (BaseClass) {
  /** @class EntityMixed */
  class EntityMixed extends BaseClass {
    get $$entityMixed () {
      return true
    }

    constructor () {
      super(...arguments)
      const s = this
      s.addOutbound(ENTITY_OUTBOUND_NAME, entityOutbound(s))
    }
  }

  return EntityMixed
}

module.exports = entityMix
