/**
 * Define outbound to strip entity annotations.
 * @function annotationOutbound
 * @returns {function} Outbound function
 */
'use strict'

/** @lends annotationOutbound */
function annotationOutbound () {
  /**
   * @function annotationOutbound
   * @param {ClayEntity[]} - Entities
   * @returns {Promise.<ClayEntity[]>}
   */
  return function outbound (entities) {
    for (let entity of entities) {
      for (let name of Object.keys(entity)) {
        if (/^\$\$/.test(name)) {
          delete entity[ name ]
        }
      }
    }
    return Promise.resolve(entities)
  }
}

module.exports = annotationOutbound
