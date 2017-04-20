/**
 * Make sure that given object is an id
 * @function sureId
 * @param {*} id
 * @return {ClayId|String} id
 */
'use strict'

/** @lends sureId */
function sureId (id) {
  if (!id) {
    throw new Error('[Clay-Resource] id is required')
  }
  return id.id || id
}

module.exports = sureId
