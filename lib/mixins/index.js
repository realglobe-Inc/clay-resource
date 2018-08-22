/**
 * Mixin functions
 * @module mixins
 */

'use strict'

const _d = (module) => module && module.default || module

const annotateMix = _d(require('./annotate_mix'))
const cacheMix = _d(require('./cache_mix'))
const cloneMix = _d(require('./clone_mix'))
const clusterMix = _d(require('./cluster_mix'))
const collectionMix = _d(require('./collection_mix'))
const conditionMix = _d(require('./condition_mix'))
const decorateMix = _d(require('./decorate_mix'))
const entityMix = _d(require('./entity_mix'))
const inboundMix = _d(require('./inbound_mix'))
const internalMix = _d(require('./internal_mix'))
const outboundMix = _d(require('./outbound_mix'))
const policyMix = _d(require('./policy_mix'))
const prepareMix = _d(require('./prepare_mix'))
const refMix = _d(require('./ref_mix'))
const subMix = _d(require('./sub_mix'))
const throwMix = _d(require('./throw_mix'))

module.exports = {
  annotateMix,
  cacheMix,
  cloneMix,
  clusterMix,
  collectionMix,
  conditionMix,
  decorateMix,
  entityMix,
  inboundMix,
  internalMix,
  outboundMix,
  policyMix,
  prepareMix,
  refMix,
  subMix,
  throwMix
}
