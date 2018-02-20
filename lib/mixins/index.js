/**
 * Mixin functions
 * @module mixins
 */

'use strict'

const d = (module) => module && module.default || module

const annotateMix = d(require('./annotate_mix'))
const cacheMix = d(require('./cache_mix'))
const cloneMix = d(require('./clone_mix'))
const clusterMix = d(require('./cluster_mix'))
const collectionMix = d(require('./collection_mix'))
const conditionMix = d(require('./condition_mix'))
const decorateMix = d(require('./decorate_mix'))
const entityMix = d(require('./entity_mix'))
const inboundMix = d(require('./inbound_mix'))
const internalMix = d(require('./internal_mix'))
const outboundMix = d(require('./outbound_mix'))
const policyMix = d(require('./policy_mix'))
const prepareMix = d(require('./prepare_mix'))
const refMix = d(require('./ref_mix'))
const subMix = d(require('./sub_mix'))
const throwMix = d(require('./throw_mix'))

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
