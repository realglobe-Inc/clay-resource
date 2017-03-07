/**
 * Mixin functions
 * @module mixins
 */

'use strict'

let d = (module) => module && module.default || module

module.exports = {
  get cloneMix () { return d(require('./clone_mix')) }
}
