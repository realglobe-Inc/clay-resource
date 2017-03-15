/**
 * Resource accessor
 * @class ClayResource
 * @param {string} nameString - Name string
 * @param {Object.<string, function>} bounds - Method bounds
 * @param {Object} [options={}] - Optional settings
 * @param {boolean} [options.annotates} - Enable annotation
 * @param {ClayResources[]} [options.refs} - Add resource refs
 */
'use strict'

const { EventEmitter } = require('events')
const { decorate, create } = require('clay-entity')
const co = require('co')
const clayResourceName = require('clay-resource-name')
const {
  cloneMix,
  formatMix,
  refMix,
  annotateMix,
  subMix,
  parseMix
} = require('./mixins')

const entity = (attributes) => decorate(create(
  Object.assign({}, attributes, { id: false }))
)

const ClayResourceBase = [
  formatMix,
  parseMix,
  refMix,
  annotateMix,
  subMix
].reduce((Base, mix) => mix(Base), EventEmitter)

/** @lends ClayResource */
class ClayResource extends ClayResourceBase {
  get $$resource () {
    return true
  }

  constructor (nameString, bounds = {}, options = {}) {
    super(...arguments)
    const s = this
    let resourceName = clayResourceName(nameString)
    let {
      name,
      domain
    } = resourceName
    let {
      annotates = true,
      refs = []
    } = options

    // Fallback old signature
    {
      if (options.annotate) {
        console.warn('`options.annotate` is now deprecated. use `options.annotates` instead')
        annotates = options.annotate
      }
    }

    Object.assign(s, {
      name,
      domain,
      bounds,
      _resourceNameString: String(resourceName)
    })

    s.annotates(annotates)
    s.refs(...refs)
  }

  /**
   * Get a resource
   * @param {ClayId} id - Id of the entity
   * @returns {Promise.<ClayEntity>} Found entity
   */
  one (id) {
    const s = this
    return co(function * () {
      let one = yield s.bounds.one(id)
      return s.formatEntity(one)
    })
  }

  /**
   * List entities from resource
   * @param {ListCondition} [condition={}] - List condition query
   * @returns {Promise.<ClayCollection>} Found resource collection
   */
  list (condition = {}) {
    const s = this
    return co(function * () {
      let collection = yield s.bounds.list(condition)
      return s.formatCollection(collection)
    })
  }

  /**
   * Create a new entity with resource
   * @param {Object} attributes - Resource attributes to create
   * @returns {Promise.<ClayEntity>} Created data
   */
  create (attributes = {}) {
    const s = this
    return co(function * () {
      attributes = yield s.parseAttributes(attributes)
      let values = entity().set(attributes).as(s._resourceNameString).toValues()
      let created = yield s.bounds.create(values)
      return s.formatEntity(created)
    })
  }

  /**
   * Update an existing entity in resource
   * @param {ClayId} id - Resource id
   * @param {Object} attributes - Resource attributes to update
   * @returns {Promise.<ClayEntity>} Updated data
   */
  update (id, attributes = {}) {
    const s = this
    return co(function * () {
      attributes = yield s.parseAttributes(attributes)
      let values = entity().set(attributes).as(s._resourceNameString).toValues()
      let updated = yield s.bounds.update(id, values)
      return s.formatEntity(updated)
    })
  }

  /**
   * Delete a entity resource
   * @param {ClayId} id - Resource id
   * @returns {Promise.<number>} Destroyed count (0 or 1)
   */
  destroy (id) {
    const s = this
    return co(function * () {
      let destroyed = yield s.bounds.destroy(id)
      return destroyed
    })
  }

  /**
   * Drop resource
   * @returns {Promise.<boolean>} False if there were nothing to drop
   */
  drop () {
    const s = this
    return s.bounds.drop()
  }

  /**
   * One as bulk
   * @param {ClayId[]} ids - Resource ids
   * @returns {Promise.<Object.<ClayId, ClayEntity>>} Found resources
   */
  oneBulk (ids) {
    const s = this
    return co(function * () {
      let oneHash = yield s.bounds.oneBulk(ids)
      return s.formatEntityHash(oneHash)
    })
  }

  /**
   * List with multiple conditions
   * @param {ListCondition[]} conditionArray
   * @returns {Promise.<ClayCollection[]>} Found resource collections
   */
  listBulk (conditionArray = []) {
    const s = this
    return co(function * () {
      let collectionAlly
      yield s.bounds.listBulk(conditionArray)
      return s.formatCollectionArray(collectionAlly)
    })
  }

  /**
   * Create multiple resources
   * @param {Object[]} attributesArray - List of attributes
   * @returns {Promise.<ClayEntity[]>} Created resources
   */
  createBulk (attributesArray = []) {
    const s = this
    return co(function * () {
      attributesArray = yield s.parseAttributesArray(attributesArray)
      let valuesArray = attributesArray.map((attributes) => entity().set(attributes).as(s._resourceNameString).toValues())
      let createdArray = yield s.bounds.createBulk(valuesArray)
      return s.formatEntityArray(createdArray)
    })
  }

  /**
   * Update multiple resources
   * @param {Object.<ClayId, Object>} attributesHash - Hash of attributes
   * @returns {Promise.<Object.<ClayId, ClayEntity>>} Updated resources
   */
  updateBulk (attributesHash = {}) {
    const s = this
    return co(function * () {
      attributesHash = yield s.parseAttributesHash(attributesHash)
      let valuesHash = Object.keys(attributesHash).reduce((valuesHash, id) => Object.assign(valuesHash, {
        [id]: entity().set(attributesHash[ id ]).as(s._resourceNameString).toValues()
      }), {})
      let updatedHash = yield s.bounds.updateBulk(valuesHash)
      return s.formatEntityHash(updatedHash)
    })
  }

  /**
   * Update multiple resources
   * @param {ClayId[]} ids - Ids to destroy
   * @returns {Promise.<number>} Destroyed counts
   */
  destroyBulk (ids = []) {
    const s = this
    return co(function * () {
      let destroyed = yield s.bounds.destroyBulk(ids)
      return destroyed
    })
  }

  /**
   * Create cursor to cursor
   * @param {Object} [options={}] - Optional settings
   * @returns {Object} {Promise.<[Symbol.iterator], function>} Iterable cursor
   */
  cursor (options = {}) {
    const s = this
    return co(function * () {
      let cursor = yield s.bounds.cursor(options)
      return cursor
    })
  }

  /**
   * Get the first entity matches filter
   * @param {ListFilter} [filter={}] - Listing filter
   * @returns {Promise.<?ClayEntity>} Found one
   */
  first (filter) {
    const s = this
    return co(function * () {
      let { entities } = yield s.list({ filter, page: { size: 1, number: 1 } })
      return s.formatEntity(entities[ 0 ])
    })
  }

  /**
   * Seal resources
   * @param {string} privateKey - RSA Private key
   * @param {Object} [options={}] - Optional settings
   * @param {string} [options.by=null] - For $$by
   * @returns {Promise}
   */
  seal (privateKey, options = {}) {
    const s = this
    let { by = null } = options
    return co(function * () {
      let cursor = yield s.cursor({
        // TODO Filter with seal
      })
      for (let fetch of cursor) {
        let fetched = yield fetch()
        let { id } = fetched
        let { $$seal, $$by } = entity(fetched)
          .by(by)
          .seal(privateKey).toValues()
        yield s.bounds.update(id, { $$seal, $$by })
      }
    })
  }

  /**
   * Check data exists
   * @param {ListFilter} [filter={}] - List filter
   * @returns {Promise.<boolean>} Exists or not
   */
  exists (filter = {}) {
    const s = this
    return co(function * () {
      let count = yield s.count(filter)
      return count > 0
    })
  }

  /**
   * Count data matches filter
   * @param {ListFilter} [filter={}] - List filter
   * @returns {Promise.<number>} Number of entities
   */
  count (filter = {}) {
    const s = this
    return co(function * () {
      let { meta } = yield s.list({ page: { number: 1, size: 1 }, filter })
      return meta.total
    })
  }
}

module.exports = cloneMix(ClayResource)

/**
 * Conditions of list
 * @typedef {Object} ListCondition
 * @property {ListFilter} [filter={}] - Filter condition
 * @property {Object} [page={}] - Page condition
 * @property {number} [page.number=1] - Number of page, start with 1
 * @property {number} [page.size=100] - Number of resources per page
 */

/**
 * Filter of list
 * @typedef {Object} ListFilter
 */
