/**
 * Make sure that given object is an id
 * @function sureId
 * @param {*} id
 * @param {Object} [options={}] - Optional settings
 * @param {string} [options.prefix] - Prefix for errors
 * @return {ClayId|String} id
 */
'use strict'

/** @lends sureId */
function sureId (id, options = {}) {
  if (!id) {
    const { prefix = 'Clay-Resource' } = options
    throw new Error(`[${prefix}] id is required`)
  }
  return id.id || id
}

module.exports = sureId
