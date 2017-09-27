/**
 * Mixin for cluster
 * @function clusterMix
 * @param {function} BaseClass - Class to mix
 * @returns {function} Mixed class
 */
'use strict'

const cluster = require('cluster')

/** @lends clusterMix */
function clusterMix (BaseClass) {
  /** @class ClusterMixed */
  class ClusterMixed extends BaseClass {
    get $$clusterMixed () {
      return true
    }

    constructor () {
      super(...arguments)
      const s = this
    }

    setupCluster () {
      const s = this
      const {isMaster, workers} = cluster
      if (isMaster) {
        for (const id of Object.keys(workers || {})) {
          s.bindClusterWorker(workers[id])
        }
        cluster.on('online', (worker) => {
          s.bindClusterWorker(worker)
        })
        cluster.on('exit', (worker) => {
          s.unbindClusterWorker(worker)
        })
      }
    }

    bindClusterWorker (worker) {
      const s = this
      worker.process.on('message', ({$$clay, event, data}) => {
        if (!$$clay) {
          return
        }
        for (const listener of s.listeners(event)) {
          listener(data)
        }
      })
    }

    unbindClusterWorker (worker) {
      const s = this
    }

    emitClusterEvent (event, data) {
      const s = this
      process.send && process.send({$$clay: true, event, data})
    }
  }

  return ClusterMixed
}

module.exports = clusterMix