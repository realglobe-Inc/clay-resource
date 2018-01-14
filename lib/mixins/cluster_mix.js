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
      this._clusterWorkerListners = {}
    }

    setupCluster () {
      if (cluster.isMaster) {
        const {workers} = cluster
        for (const id of Object.keys(workers || {})) {
          this.bindClusterWorker(workers[id])
        }
        cluster.setMaxListeners(cluster.getMaxListeners() + 2)
        cluster.addListener('online', (worker) => this.bindClusterWorker(worker))
        cluster.addListener('exit', (worker) => this.unbindClusterWorker(worker))
      } else {
        const {worker} = cluster
        this.bindClusterWorker(worker)
      }
    }

    bindClusterWorker (worker) {
      const resourceName = String(clayResourceName(this))
      const listeners = {
        'message': async ({$$clay, $$from, $$resource, event, data}) => {
          if (!$$clay) {
            return
          }
          if (resourceName !== $$resource) {
            return
          }

          if (/^cly:entity/.test(event)) {
            data = await this.restoreClusterEventData(data)
          }
          for (const listener of (this.listeners(event) || [])) {
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
              worker.send({$$clay, $$resource, $$from, event, data})
            }
          }
        }
      }
      this._clusterWorkerListners[worker.id] = listeners
      const events = Object.keys(listeners)
      worker.setMaxListeners(worker.getMaxListeners() + events.length)
      for (const event of events) {
        worker.addListener(event, listeners[event])
      }
    }

    unbindClusterWorker (worker) {
      const listeners = this._clusterWorkerListners[worker.id] || {}
      for (const event of Object.keys(listeners)) {
        worker.removeListener(event, listeners[event])
      }
    }

    emitClusterEvent (event, data) {
      const resourceName = String(clayResourceName(this))
      if (cluster.isMaster) {
        const {workers} = cluster
        for (const id of Object.keys(workers)) {
          const worker = workers[id]
          worker.send({$$clay: true, $$resource: resourceName, event, data})
        }
      } else {
        const {worker} = cluster
        worker.send({$$clay: true, $$resource: resourceName, $$from: worker.id, event, data})
      }
    }

    isClusterMaster () {
      return cluster.isMaster
    }

    async restoreClusterEventData (data) {
      const resourceName = String(clayResourceName(this))
      if (data === null) {
        return null
      }
      if (Array.isArray(data)) {
        return Promise.all(data.map((data) => this.restoreClusterEventData(data)))
      }
      switch (typeof data) {
        case 'undefined':
        case 'string':
        case 'number':
        case 'function':
        case 'boolean':
          return data
        default: {
          if (data.$$entity) {
            const {$$as, id} = data
            const Resource = $$as === resourceName ? this : this.getRef($$as)
            if (Resource) {
              const one = await Resource.one(id, {ignoreCached: true})
              if (!one) {
                console.warn(`[ClayDB][Cluster]Unknown resource "${id}" on ${$$as}`)
              }
              return one
            } else {
              const knownNames = Object.keys(this._refResources)
              console.warn(`Unknown ref: ${$$as}. (Known: ${JSON.stringify(knownNames)} )`)
              return data
            }
          } else {
            for (const key of Object.keys(data)) {
              if (/^[$_]/.test(key)) {
                continue
              }
              data[key] = await this.restoreClusterEventData(data[key])
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