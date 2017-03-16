/**
 * Define outbound to strip entity annotations.
 * @function annotationStripOutbound
 * @returns {function} Outbound function
 */
'use strict'

/** @lends annotationStripOutbound */
function annotationStripOutbound () {
  /**
   * @function annotationStripFormat
   * @param {ClayEntity[]} - Entities
   * @returns {Promise.<ClayEntity[]>}
   */
  return function annotationStrip (entities) {
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

module.exports = annotationStripOutbound
