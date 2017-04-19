/**
 * Mixin functions
 * @module mixins
 */

'use strict'

let d = (module) => module && module.default || module

module.exports = {
  get annotateMix () { return d(require('./annotate_mix')) },
  get cacheMix () { return d(require('./cache_mix')) },
  get cloneMix () { return d(require('./clone_mix')) },
  get conditionMix () { return d(require('./condition_mix')) },
  get decorateMix () { return d(require('./decorate_mix')) },
  get inboundMix () { return d(require('./inbound_mix')) },
  get internalMix () { return d(require('./internal_mix')) },
  get outboundMix () { return d(require('./outbound_mix')) },
  get policyMix () { return d(require('./policy_mix')) },
  get prepareMix () { return d(require('./prepare_mix')) },
  get refMix () { return d(require('./ref_mix')) },
  get subMix () { return d(require('./sub_mix')) },
  get throwMix () { return d(require('./throw_mix')) }
}
