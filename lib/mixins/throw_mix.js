/**
 * Mixin for throw feature.
 * @function throwMix
 * @param {function} BaseClass - Class to mix
 * @returns {function} Mixed class
 */
'use strict'

const { NotFoundError } = require('clay-errors')
const { LogPrefixes } = require('clay-constants')
const clayResourceName = require('clay-resource-name')
const { RESOURCE_PREFIX } = LogPrefixes

/** @lends throwMix */
function throwMix (BaseClass) {
  /** @class ThrowMixed */
  class ThrowMixed extends BaseClass {
    get $$throwMixed () {
      return true
    }

    /**
     * Throw entity not found error
     * @param {ClayId} id
     * @throws {NotFoundError}
     */
    throwEntityNotFoundError (id) {
      const s = this
      let resourceName = clayResourceName(s)
      let msg = `${RESOURCE_PREFIX} Resource data with id "${id}" not found in ${resourceName}`
      throw new NotFoundError(msg, { id: id, resource: resourceName })
    }
  }

  return ThrowMixed
}

module.exports = throwMix
