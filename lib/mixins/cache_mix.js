/**
 * Mixin for cache
 * @function cacheMix
 * @param {function} BaseClass - Class to mix
 * @returns {function} Mixed class
 */
'use strict'

const clayResourceCache = require('clay-resource-cache')
const clayResourceName = require('clay-resource-name')
const ResourceEvents = require('../resource_events')

const {
  ENTITY_UPDATE,
  ENTITY_UPDATE_BULK,
  ENTITY_DESTROY,
  ENTITY_DESTROY_BULK,
  ENTITY_DROP
} = ResourceEvents

const {
  CLAY_CACHE_CLEAR_DELAY = 10,
  CLAY_CACHE_MAX = 1000
} = process.env

/** @lends cacheMix */
function cacheMix (BaseClass) {
  /** @class CacheMixed */
  class CacheMixed extends BaseClass {
    get $$cacheMixed () {
      return true
    }

    constructor () {
      super(...arguments)
      this._cacheEnabled = false
      const resourceName = clayResourceName(this)
      this._resourceCache = clayResourceCache({
        resourceName,
        max: Number(CLAY_CACHE_MAX)
      })

      this._clearingCaches = {}
      this._cacheListeners = {}
    }

    /**
     * Toggle caching
     * @param {boolean} caches - Should cache or not
     * @returns {CacheMixed} this
     */
    caches (caches) {
      if (arguments.length === 0) {
        return !this._cacheEnabled
      }
      if (caches) {
        this._cacheListeners = {
          [ENTITY_UPDATE]: ({id}) => this.requestCacheClear(id),
          [ENTITY_UPDATE_BULK]: ({ids}) => this.requestCacheClear(ids),
          [ENTITY_DESTROY]: ({id}) => this.requestCacheClear(id),
          [ENTITY_DESTROY_BULK]: ({ids}) => this.requestCacheClear(ids),
          [ENTITY_DROP]: () => this.requestCacheClear()
        }
        for (const event of Object.keys(this._cacheListeners)) {
          this.on(event, this._cacheListeners[event])
        }
      } else {
        for (const event of Object.keys(this._cacheListeners)) {
          this.off(event, this._cacheListeners[event])
        }
        this._cacheListeners = {}
      }
      this._cacheEnabled = caches
      return this
    }

    /**
     * Store an entity into cache
     * @param entity
     */
    storeCache (entity) {
      this._resourceCache.store(entity)
    }

    /**
     * Gain entity from cache
     * @param {ClayId} id
     */
    gainCache (id) {
      return this._resourceCache.gain(id)
    }

    /**
     * Remove entity from cache
     * @param {ClayId} id
     */
    removeCache (id) {
      return this._resourceCache.remove(id)
    }

    /**
     * Request cache clear
     * @param {ClayId|ClayId[]} [ids] - Ids to clear
     */
    requestCacheClear (ids) {
      if (arguments.length === 0) {
        ids = Object.keys(this._clearingCaches)
      }
      for (const id of [].concat(ids).filter(Boolean)) {
        const duplicate = this._clearingCaches[id]
        if (duplicate) {
          return
        }
        this._clearingCaches[id] = setTimeout(() => {
          this._resourceCache.remove(String(id))
          delete this._clearingCaches[id]
        }, CLAY_CACHE_CLEAR_DELAY)
      }
    }
  }

  return CacheMixed
}

module.exports = cacheMix
