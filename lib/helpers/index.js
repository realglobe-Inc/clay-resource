/**
 * Helper functions
 * @module helpers
 */

'use strict'

let d = (module) => module && module.default || module

module.exports = {
  get asEntity () { return d(require('./as_entity')) },
  get sureId () { return d(require('./sure_id')) }
}
