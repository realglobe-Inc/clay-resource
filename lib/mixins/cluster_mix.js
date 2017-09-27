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
      s._clusterWorkerListners = {}
    }

    setupCluster () {
      const s = this
      if (cluster.isMaster) {
        const {workers} = cluster
        for (const id of Object.keys(workers || {})) {
          s.bindClusterWorker(workers[id])
        }
        cluster.setMaxListeners(cluster.getMaxListeners() + 2)
        cluster.addListener('online', (worker) => s.bindClusterWorker(worker))
        cluster.addListener('exit', (worker) => s.unbindClusterWorker(worker))
      } else {
        const {worker} = cluster
        s.bindClusterWorker(worker)
      }
    }

    bindClusterWorker (worker) {
      const s = this
      const listeners = {
        'message': ({$$clay, $$from, event, data}) => {
          if (!$$clay) {
            return
          }
          for (const listener of s.listeners(event)) {
            listener(data)
          }
          if (cluster.isMaster) {
            const {workers} = cluster
            for (const id of Object.keys(workers)) {
              const worker = workers[id]
              const skip = String(id) === String($$from)
              if (skip) {
                continue
              }
              worker.send({$$clay, $$from, event, data})
            }
          }
        }
      }
      s._clusterWorkerListners[worker.id] = listeners
      for (const event of Object.keys(listeners)) {
        worker.addListener(event, listeners[event])
      }
    }

    unbindClusterWorker (worker) {
      const s = this
      const listeners = s._clusterWorkerListners[worker.id] || {}
      for (const event of Object.keys(listeners)) {
        worker.removeListener(event, listeners[event])
      }
    }

    emitClusterEvent (event, data) {
      const s = this
      if (cluster.isMaster) {
        const {workers} = cluster
        for (const id of Object.keys(workers)) {
          const worker = workers[id]
          worker.send({$$clay: true, event, data})
        }
      } else {
        const {worker} = cluster
        worker.send({$$clay: true, $$from: worker.id, event, data})
      }
    }
  }

  return ClusterMixed
}

module.exports = clusterMix