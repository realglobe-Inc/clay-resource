/**
 * Define formatter to strip entity annotations.
 * @function annotationStripFormatter
 * @returns {function} Formatter function
 */
'use strict'

/** @lends annotationStripFormatter */
function annotationStripFormatter () {
  /**
   * @function annotationStripFormat
   * @param {ClayEntity[]} - Entities
   * @returns {Promise.<ClayEntity[]>}
   */
  return function annotationStripFormat (entities) {
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

module.exports = annotationStripFormatter
