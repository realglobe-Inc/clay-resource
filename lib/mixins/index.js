/**
 * Mixin functions
 * @module mixins
 */

'use strict'

let d = (module) => module && module.default || module

module.exports = {
  get annotateMix () { return d(require('./annotate_mix')) },
  get cloneMix () { return d(require('./clone_mix')) }
}