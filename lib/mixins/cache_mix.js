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
  ENTITY_CREATE,
  ENTITY_CREATE_BULK,
  ENTITY_UPDATE,
  ENTITY_UPDATE_BULK,
  ENTITY_DESTROY,
  ENTITY_DESTROY_BULK,
  ENTITY_DROP
} = ResourceEvents

const CACHE_CLEAR_DELAY = 10

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
      let resourceName = clayResourceName(s)
      s._resourceCache = clayResourceCache({ resourceName })

      s._clearingCaches = {}

      s.on(ENTITY_CREATE, ({ created }) => s.clearCache(created.id))
      s.on(ENTITY_CREATE_BULK, ({ created }) => s.clearCache(created.map(({ id }) => id)))
      s.on(ENTITY_UPDATE, ({ id }) => s.clearCache(id))
      s.on(ENTITY_UPDATE_BULK, ({ ids }) => s.clearCache(ids))
      s.on(ENTITY_DESTROY, ({ id }) => s.clearCache(id))
      s.on(ENTITY_DESTROY_BULK, ({ ids }) => s.clearCache(ids))
      s.on(ENTITY_DROP, () => s.clearCache())
    }

    storeCache (entity) {
      const s = this
      return s._resourceCache.store(entity)
    }

    gainCache (id) {
      const s = this
      return s._resourceCache.get(id)
    }

    clearCache (ids) {
      const s = this
      if (arguments.length === 0) {
        ids = Object.keys(s._clearingCaches)
      }
      for (let id of [].concat(ids).filter(Boolean)) {
        let duplicate = s._clearingCaches[ id ]
        if (duplicate) {
          return
        }
        s._clearingCaches[ id ] = setTimeout(() => {
          s._resourceCache.remove(id)
          delete s._clearingCaches[ id ]
        }, CACHE_CLEAR_DELAY)
      }
    }
  }

  return CacheMixed
}

module.exports = cacheMix