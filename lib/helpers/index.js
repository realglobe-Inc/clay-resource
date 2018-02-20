/**
 * Helper functions
 * @module helpers
 */

'use strict'

const d = (module) => module && module.default || module

const asEntity = d(require('./as_entity'))
const sureId = d(require('./sure_id'))

module.exports = {
  asEntity,
  sureId
}
