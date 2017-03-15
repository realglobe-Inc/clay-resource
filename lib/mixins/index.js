/**
 * Mixin functions
 * @module mixins
 */

'use strict'

let d = (module) => module && module.default || module

module.exports = {
  get annotateMix () { return d(require('./annotate_mix')) },
  get cloneMix () { return d(require('./clone_mix')) },
  get formatMix () { return d(require('./format_mix')) },
  get parseMix () { return d(require('./parse_mix')) },
  get refMix () { return d(require('./ref_mix')) },
  get subMix () { return d(require('./sub_mix')) }
}
