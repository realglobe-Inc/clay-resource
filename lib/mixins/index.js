/**
 * Mixin functions
 * @module mixins
 */

'use strict'

let d = (module) => module && module.default || module

module.exports = {
  get annotateMix () { return d(require('./annotate_mix')) },
  get cloneMix () { return d(require('./clone_mix')) },
  get inboundMix () { return d(require('./inbound_mix')) },
  get outboundMix () { return d(require('./outbound_mix')) },
  get refMix () { return d(require('./ref_mix')) },
  get subMix () { return d(require('./sub_mix')) },
  get throwMix () { return d(require('./throw_mix')) }
}
