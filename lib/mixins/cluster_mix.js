/**
 * Mixin for cluster
 * @function clusterMix
 * @param {function} BaseClass - Class to mix
 * @returns {function} Mixed class
 */
'use strict'

const cluster = require('cluster')
const clayResourceName = require('clay-resource-name')

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
        'message': async ({$$clay, $$from, event, data}) => {
          if (!$$clay) {
            return
          }
          if (/^cly:entity/.test(event)) {
            data = await s.restoreClusterEventData(data)
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
      const events = Object.keys(listeners)
      worker.setMaxListeners(worker.getMaxListeners() + events.length)
      for (const event of events) {
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

    async restoreClusterEventData (data) {
      const s = this
      const resourceName = String(clayResourceName(s))
      if (data === null) {
        return null
      }
      if (Array.isArray(data)) {
        return Promise.all(data.map((data) => s.restoreClusterEventData(data)))
      }
      switch (typeof data) {
        case 'string':
        case 'number':
        case 'boolean':
          return data
        default: {
          if (data.$$entity) {
            const {$$as, id} = data
            const Resource = $$as === resourceName ? s : s.getRef($$as)
            if (Resource) {
              const one = await Resource.one(id)
              if (!one) {
                console.warn(`[ClayDB][Cluster]Unknown resource "${id}" on ${$$as}`)
              }
              return one
            } else {
              const knownNames = Object.keys(s._refResources)
              console.warn(`Unknown ref: ${$$as}. (Known: ${JSON.stringify(knownNames)} )`)
              return data
            }
          } else {
            for (const key of Object.keys(data)) {
              if (/^[$_]/.test(key)) {
                continue
              }
              data[key] = await s.restoreClusterEventData(data[key])
            }
          }
        }
      }
      return data
    }
  }

  return ClusterMixed
}

module.exports = clusterMix