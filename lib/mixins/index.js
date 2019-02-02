/**
 * Mixin functions
 * @module mixins
 */

'use strict'


const annotateMix = require('./annotate_mix')
const cacheMix = require('./cache_mix')
const cloneMix = require('./clone_mix')
const clusterMix = require('./cluster_mix')
const collectionMix = require('./collection_mix')
const conditionMix = require('./condition_mix')
const decorateMix = require('./decorate_mix')
const entityMix = require('./entity_mix')
const inboundMix = require('./inbound_mix')
const internalMix = require('./internal_mix')
const outboundMix = require('./outbound_mix')
const policyMix = require('./policy_mix')
const prepareMix = require('./prepare_mix')
const refMix = require('./ref_mix')
const subMix = require('./sub_mix')
const throwMix = require('./throw_mix')

exports.annotateMix = annotateMix
exports.cacheMix = cacheMix
exports.cloneMix = cloneMix
exports.clusterMix = clusterMix
exports.collectionMix = collectionMix
exports.conditionMix = conditionMix
exports.decorateMix = decorateMix
exports.entityMix = entityMix
exports.inboundMix = inboundMix
exports.internalMix = internalMix
exports.outboundMix = outboundMix
exports.policyMix = policyMix
exports.prepareMix = prepareMix
exports.refMix = refMix
exports.subMix = subMix
exports.throwMix = throwMix

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
