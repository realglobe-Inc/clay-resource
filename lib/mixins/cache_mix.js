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
  CLAY_CACHE_MAX_SIZE = 1000,
  CLAY_CACHE_BUFFER_SIZE = 100
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
      const s = this

      s._cacheEnabled = false
      let resourceName = clayResourceName(s)
      s._resourceCache = clayResourceCache({
        resourceName,
        maxSize: Number(CLAY_CACHE_MAX_SIZE),
        bufferSize: Number(CLAY_CACHE_BUFFER_SIZE)
      })

      s._clearingCaches = {}
      s._cacheListeners = {}
    }

    /**
     * Toggle caching
     * @param {boolean} caches - Should cache or not
     * @returns {CacheMixed} this
     */
    caches (caches) {
      const s = this
      if (arguments.length === 0) {
        return !s._cacheEnabled
      }
      if (caches) {
        s._cacheListeners = {
          [ENTITY_UPDATE]: ({id}) => s.requestCacheClear(id),
          [ENTITY_UPDATE_BULK]: ({ids}) => s.requestCacheClear(ids),
          [ENTITY_DESTROY]: ({id}) => s.requestCacheClear(id),
          [ENTITY_DESTROY_BULK]: ({ids}) => s.requestCacheClear(ids),
          [ENTITY_DROP]: () => s.requestCacheClear()
        }
        for (let event of Object.keys(s._cacheListeners)) {
          s.on(event, s._cacheListeners[event])
        }
      } else {
        for (let event of Object.keys(s._cacheListeners)) {
          s.off(event, s._cacheListeners[event])
        }
        s._cacheListeners = {}
      }
      s._cacheEnabled = caches
      return s
    }

    /**
     * Store an entity into cache
     * @param entity
     */
    storeCache (entity) {
      const s = this
      s._resourceCache.store(entity)
    }

    /**
     * Gain entity from cache
     * @param {ClayId} id
     */
    gainCache (id) {
      const s = this
      return s._resourceCache.gain(id)
    }

    /**
     * Remove entity from cache
     * @param {ClayId} id
     */
    removeCache (id) {
      const s = this
      return s._resourceCache.remove(id)
    }

    /**
     * Request cache clear
     * @param {ClayId|ClayId[]} [ids] - Ids to clear
     */
    requestCacheClear (ids) {
      const s = this
      if (arguments.length === 0) {
        ids = Object.keys(s._clearingCaches)
      }
      for (const id of [].concat(ids).filter(Boolean)) {
        const duplicate = s._clearingCaches[id]
        if (duplicate) {
          return
        }
        s._clearingCaches[id] = setTimeout(() => {
          s._resourceCache.remove(String(id))
          delete s._clearingCaches[id]
        }, CLAY_CACHE_CLEAR_DELAY)
      }
    }
  }

  return CacheMixed
}

module.exports = cacheMix
