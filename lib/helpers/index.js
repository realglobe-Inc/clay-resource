/**
 * Helper functions
 * @module helpers
 */

'use strict'

const _d = (module) => module && module.default || module

const asEntity = _d(require('./as_entity'))
const sureId = _d(require('./sure_id'))

module.exports = {
  asEntity,
  sureId
}
