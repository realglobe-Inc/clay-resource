/**
 * Resource accessor
 * @class ClayResource
 * @augments AnnotateMixed
 * @augments CloneMixed
 * @augments InboundMixed
 * @augments OutboundMixed
 * @augments PolicyMixed
 * @augments RefMixed
 * @augments SubMixed
 * @augments ThrowMixed
 * @augments InternalMixed
 * @augments PrepareMixed
 * @augments DecorateMixed
 * @augments CacheMixed
 * @param {string} nameString - Name string
 * @param {Object.<string, function>} bounds - Method bounds
 * @param {Object} [options={}] - Optional settings
 * @param {boolean} [options.annotates] - Enable annotation
 * @param {ClayResource[]} [options.refs] - Add resource refs
 */
'use strict'

const { EventEmitter } = require('events')
const { decorate, create } = require('clay-entity')
const co = require('co')
const ResourceEvents = require('./resource_events')
const clayResourceName = require('clay-resource-name')
const { DriverSpec } = require('clay-constants')
const { RESOURCE_BINDABLE_METHODS } = DriverSpec
const {
  cloneMix,
  inboundMix,
  internalMix,
  outboundMix,
  refMix,
  annotateMix,
  subMix,
  throwMix,
  prepareMix,
  policyMix,
  decorateMix,
  cacheMix
} = require('./mixins')
const {
  ENTITY_CREATE,
  ENTITY_CREATE_BULK,
  ENTITY_UPDATE,
  ENTITY_UPDATE_BULK,
  ENTITY_DESTROY,
  ENTITY_DESTROY_BULK,
  ENTITY_DROP
} = ResourceEvents

const entity = (attributes) => decorate(create(
  Object.assign({}, attributes, { id: false }))
)

const assertId = (id) => {
  if (!id) {
    throw new Error('[Clay-Resource] id is required')
  }
}

const ClayResourceBase = [
  prepareMix,
  internalMix,
  outboundMix,
  inboundMix,
  refMix,
  annotateMix,
  subMix,
  throwMix,
  policyMix,
  decorateMix,
  cacheMix
].reduce((Base, mix) => mix(Base), EventEmitter)

let actionContextFor = (action, values) => Object.assign({}, values, { action })

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
      caches = true,
      refs = [],
      policy = null
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
    s.policy(policy)
    s.caches(caches)
  }

  /**
   * Get a resource
   * @param {ClayId} id - Id of the entity
   * @returns {Promise.<ClayEntity>} Found entity
   * @example
   * const Product = lump.resource('Product')
   * async function tryOne () {
   *   let product = await Product.one(1) // Find by id
   *   console.log(product)
   * }
   */
  one (id) {
    const s = this
    return co(function * () {
      yield s.prepareIfNeeded()
      assertId(id)
      let cached = s.gainCache(id)
      if (cached) {
        return s.outboundEntity(cached)
      }
      let one = yield s.bounds.one(id)
      if (one) {
        s.storeCache(one)
      }
      return s.outboundEntity(one)
    })
  }

  /**
   * List entities from resource
   * @param {ListCondition} [condition={}] - List condition query
   * @param {FilterTerm} [condition.filter={}] - Filter condition
   * @param {PagerTerm} [condition.page={}] - Page condition
   * @param {number} [condition.page.number=1] - Number of page, start with 1
   * @param {number} [condition.page.size=100] - Number of resources per page
   * @param {SortTerm} [condition.sort=[]] - Sort condition
   * @returns {Promise.<ClayCollection>} Found resource collection
   * @example
   * const Product = lump.resource('Product')
   * async function tryList () {
   *   let products = await Product.list({
   *     filter: { type: 'Vehicle' },  // Filter condition
   *     page: { number: 1, size: 25 }, // Paginate
   *     sort: [ 'createdAt', '-name' ] // Sort condition
   *   })
   *   console.log(products)
   * }
   * tryList()
   */
  list (condition = {}) {
    const s = this
    return co(function * () {
      yield s.prepareIfNeeded()
      let collection = yield s.bounds.list(condition)
      return s.outboundCollection(collection)
    })
  }

  /**
   * Create a new entity with resource
   * @param {Object} attributes - Resource attributes to create
   * @returns {Promise.<ClayEntity>} Created data
   * @example
   * const Product = lump.resource('Product')
   * async function tryCreate () {
   *   let product = await Product.create({
   *     name: 'Super Car',
   *     type: 'Vehicle'
   *   })
   *   console.log(product)
   * }
   * tryCreate()
   */
  create (attributes = {}) {
    const s = this
    return co(function * () {
      yield s.prepareIfNeeded()
      let actionContext = actionContextFor('create', {})
      attributes = yield s.inboundAttributes(attributes, actionContext)
      let values = entity().set(attributes).as(s._resourceNameString).toValues()
      let raw = yield s.bounds.create(values)
      let created = yield s.outboundEntity(raw, actionContext)
      s.emit(ENTITY_CREATE, { created })
      return created
    })
  }

  /**
   * Update an existing entity in resource
   * @param {ClayId} id - Resource id
   * @param {Object} attributes - Resource attributes to update
   * @throws {NotFoundError} - Throw error when entity not found for the id
   * @returns {Promise.<ClayEntity>} Updated data
   * @example
   * const Product = lump.resource('Product')
   * async function tryUpdate () {
   *   let product = await Product.update(1, {
   *     name: 'Super Super Car'
   *   })
   *   console.log(product)
   * }
   * tryUpdate()
   *
   */
  update (id, attributes = {}) {
    const s = this
    return co(function * () {
      yield s.prepareIfNeeded()
      assertId(id)
      let actionContext = actionContextFor('update', {})
      attributes = yield s.inboundAttributes(attributes, actionContext)
      let has = yield s.has(id)
      if (!has) {
        throw s.throwEntityNotFoundError(id)
      }
      let values = entity().set(attributes).as(s._resourceNameString).toValues()
      let raw = yield s.bounds.update(id, values)
      let updated = yield s.outboundEntity(raw, actionContext)
      s.emit(ENTITY_UPDATE, { id, updated })
      return updated
    })
  }

  /**
   * Delete a entity resource
   * @param {ClayId} id - Resource id
   * @returns {Promise.<number>} Destroyed count (0 or 1)
   * @example
   * const Product = lump.resource('Product')
   * async function tryDestroy () {
   *   await Product.destroy(1)
   * }
   * tryDestroy()
   */
  destroy (id) {
    const s = this
    return co(function * () {
      yield s.prepareIfNeeded()
      assertId(id)
      let destroyed = yield s.bounds.destroy(id)
      s.emit(ENTITY_DESTROY, { id, destroyed })
      return destroyed
    })
  }

  /**
   * Drop resource
   * @returns {Promise.<boolean>} False if there were nothing to drop
   * @example
   * const Product = lump.resource('Product')
   * async function tryDrop () {
   *   await Product.drop()
   * }
   * tryDrop()
   */
  drop () {
    const s = this
    let dropped = s.bounds.drop()
    s.emit(ENTITY_DROP, { dropped })
    return dropped
  }

  /**
   * One as bulk
   * @param {ClayId[]} ids - Resource ids
   * @returns {Promise.<Object.<ClayId, ClayEntity>>} Found resources
   * @example
   * const Product = lump.resource('Product')
   * async function tryOneBulk () {
   *   let products = await Product.oneBulk([ 1, 5, 10 ])
   *   console.log(products)
   * }
   * tryOneBulk()
   */
  oneBulk (ids) {
    const s = this
    return co(function * () {
      yield s.prepareIfNeeded()
      let actionContext = actionContextFor('oneBulk', {})
      let oneHash = yield s.bounds.oneBulk(ids)
      return s.outboundEntityHash(oneHash, actionContext)
    })
  }

  /**
   * List with multiple conditions
   * @param {ListCondition[]} conditionArray
   * @returns {Promise.<ClayCollection[]>} Found resource collections
   * @example
   * const Product = lump.resource('Product')
   * async function tryListBulk () {
   *   let [ cars, ships ] = await Product.listBulk([
   *     { filter: { type: 'CAR' } },
   *     { filter: { type: 'SHIP' } },
   *   ])
   *   console.log(cars)
   *   console.log(ships)
   * }
   * tryListBulk()
   */
  listBulk (conditionArray = []) {
    const s = this
    return co(function * () {
      yield s.prepareIfNeeded()
      let actionContext = actionContextFor('listBulk', {})
      let collectionAlly = yield s.bounds.listBulk(conditionArray)
      return s.outboundCollectionArray(collectionAlly, actionContext)
    })
  }

  /**
   * Create multiple resources
   * @param {Object[]} attributesArray - List of attributes
   * @returns {Promise.<ClayEntity[]>} Created resources
   * @example
   * const Product = lump.resource('Product')
   * async function tryCreateBulk () {
   *   let products = await Product.createBulk([
   *     { name: 'Super Orange', type: 'CAR' },
   *     { name: 'Ultra Green', type: 'CAR' },
   *   ])
   *   console.log(products)
   * }
   * tryCreateBulk()
   */
  createBulk (attributesArray = []) {
    const s = this
    return co(function * () {
      yield s.prepareIfNeeded()
      let actionContext = actionContextFor('createBulk', {})
      attributesArray = yield s.inboundAttributesArray(attributesArray, actionContext)
      let valuesArray = attributesArray.map((attributes) => entity().set(attributes).as(s._resourceNameString).toValues())
      let raw = yield s.bounds.createBulk(valuesArray)
      let created = yield s.outboundEntityArray(raw, actionContext)
      s.emit(ENTITY_CREATE_BULK, { created })
      return created
    })
  }

  /**
   * Update multiple resources
   * @param {Object.<ClayId, Object>} attributesHash - Hash of attributes
   * @throws {NotFoundError} - Throw error when entity not found for the id
   * @returns {Promise.<Object.<ClayId, ClayEntity>>} Updated resources
   * @example
   * const Product = lump.resource('Product')
   * async function tryUpdateBulk () {
   *   let products = await Product.updateBulk({
   *     '1': { name: 'Super Super Orange' },
   *     '2': { name: 'Ultra Ultra Green' },
   *   })
   *   console.log(products)
   * }
   * tryUpdateBulk()
   */
  updateBulk (attributesHash = {}) {
    const s = this
    return co(function * () {
      yield s.prepareIfNeeded()
      let actionContext = actionContextFor('updateBulk', {})
      attributesHash = yield s.inboundAttributesHash(attributesHash, actionContext)
      let ids = Object.keys(attributesHash)
      for (let id of ids) {
        let has = yield s.has(id)
        if (!has) {
          throw s.throwEntityNotFoundError(id)
        }
      }
      let valuesHash = ids.reduce((valuesHash, id) => Object.assign(valuesHash, {
        [id]: entity().set(attributesHash[ id ]).as(s._resourceNameString).toValues()
      }), {})
      let raw = yield s.bounds.updateBulk(valuesHash)
      let updated = yield s.outboundEntityHash(raw, actionContext)
      s.emit(ENTITY_UPDATE_BULK, { ids, updated })
      return updated
    })
  }

  /**
   * Update multiple resources
   * @param {ClayId[]} ids - Ids to destroy
   * @returns {Promise.<number>} Destroyed counts
   * @example
   * const Product = lump.resource('Product')
   * async function tryDestroyBulk () {
   *   await Product.destroyBulk([1, 2])
   * })
   * tryDestroyBulk()
   */
  destroyBulk (ids = []) {
    const s = this
    return co(function * () {
      yield s.prepareIfNeeded()
      let destroyed = yield s.bounds.destroyBulk(ids)
      s.emit(ENTITY_DESTROY_BULK, { ids, destroyed })
      return destroyed
    })
  }

  /**
   * Create cursor to cursor
   * @param {Object} [options={}] - Optional settings
   * @param {FilterTerm} [options.filter={}] - Filter condition
   * @param {SortTerm} [options.sort=[]] - Sort condition
   * @returns {Object} {Promise.<[Symbol.iterator], function>} Iterable cursor
   * @example
   * const Product = lump.resource('Product')
   * async function tryCursor () {
   *   let cursor = await Product.cursor({
    *     filter: { type: 'CAR' }
   *   })
   *   console.log(cursor.length) // Number of entities matches the condition
   *   for (let fetch of cursor) {
   *     let car = yield fetch() // Fetch the pointed entity
   *     console.log(car)
   *   }
   * }
   * tryCursor()
   */
  cursor (options = {}) {
    const s = this
    return co(function * () {
      yield s.prepareIfNeeded()
      let cursor = yield s.bounds.cursor(options)
      return cursor
    })
  }

  /**
   * Get the first entity matches filter
   * @param {FilterTerm} [filter={}] - Listing filter
   * @param {Object} [options={}] - Optional settings
   * @param {Object} [options.sort=[]] - Sort conditions
   * @returns {Promise.<?ClayEntity>} Found one
   * @example
   * const Product = lump.resource('Product')
   * async function tryFirst () {
   *   let product = Product.first({ name: 'Super Super Orange' })
   *   console.log('product')
   * }
   * tryFirst()
   */
  first (filter, options = {}) {
    const s = this
    let { sort = [] } = options
    let actionContext = actionContextFor('first', {})
    return co(function * () {
      yield s.prepareIfNeeded()
      let { entities } = yield s.list({ filter, page: { size: 1, number: 1 }, sort })
      return yield s.outboundEntity(entities[ 0 ], actionContext)
    })
  }

  /**
   * Seal resources
   * @param {string} privateKey - RSA Private key
   * @param {Object} [options={}] - Optional settings
   * @param {string} [options.by=null] - For $$by
   * @returns {Promise}
   * @example
   * const Product = lump.resource('Product')
   * const privateKey = 'xxxxxxxxxxxxxxxxxxxxxxxxx'
   * async function trySeal () {
   *   await Product.seal(privateKey)
   * }
   * trySeal()
   */
  seal (privateKey, options = {}) {
    const s = this
    let { by = null } = options
    return co(function * () {
      yield s.prepareIfNeeded()
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
   * Check entity with id exists
   * @param {ClayId} id - Id of the entity
   * @returns {Promise.<boolean>} Exists or not
   * @example
   * const Product = lump.resource('Product')
   * async function tryHas () {
   *   let has = await Product.has(1)
   *   console.log(has)
   * }
   * tryHas()
   */
  has (id) {
    const s = this
    return co(function * () {
      yield s.prepareIfNeeded()
      assertId(id)
      let one = yield s.one(id)
      return !!one
    })
  }

  /**
   * Check data exists with filter
   * @param {FilterTerm} [filter={}] - List filter
   * @returns {Promise.<boolean>} Exists or not
   * @example
   * const Product = lump.resource('Product')
   * async function tryExists () {
   *   let exists = await Product.exists({ name: 'Super Super Orange' })
   *   console.log(exists)
   * }
   * tryExists()
   */
  exists (filter = {}) {
    const s = this
    return co(function * () {
      yield s.prepareIfNeeded()
      let count = yield s.count(filter)
      return count > 0
    })
  }

  /**
   * Count data matches filter
   * @param {FilterTerm} [filter={}] - List filter
   * @returns {Promise.<number>} Number of entities
   * @example
   * const Product = lump.resource('Product')
   * async function tryCount () {
   *   let count = await Product.count({ type: 'CAR' })
   *   console.log(count)
   * }
   * tryCount()
   */
  count (filter = {}) {
    const s = this
    return co(function * () {
      yield s.prepareIfNeeded()
      let { meta } = yield s.list({ page: { number: 1, size: 1 }, filter })
      return meta.total
    })
  }

  /**
   * Find entity with attributes and returns if found.
   * If not found, create and return the one.
   * @param {Object} attributes - Attributes
   * @example
   * const Product = lump.resource('Product')
   * async function tryOf () {
   *   let values = await Product.of({ code: '#1234' })
   *   console.log(values)
   * }
   * tryOf()
   */
  of (attributes = {}) {
    const s = this
    return co(function * () {
      yield s.prepareIfNeeded()
      let found = yield s.first(attributes)
      if (found) {
        return found
      }
      yield s.create(attributes)
      return yield s.of(attributes)
    })
  }

  /**
   * @function fromDriver
   * @param {Driver} driver - Driver to bind
   * @param {string} nameString - Resource name string
   * @param {Object} [options={}] - Optional settings
   * @returns {ClayResource} Resource instance
   */
  static fromDriver (driver, nameString, options = {}) {
    const Clazz = this
    let resourceName = String(clayResourceName(nameString))
    let bounds = RESOURCE_BINDABLE_METHODS.split(',')
      .reduce((bounds, methodName) => Object.assign(bounds, {
        [methodName]: driver[ methodName ].bind(driver, resourceName)
      }), {})
    return new Clazz(resourceName, bounds, options)
  }
}

module.exports = cloneMix(ClayResource)

/**
 * Conditions of list
 * @typedef {Object} ListCondition
 * @property {FilterTerm} [filter={}] - Filter condition
 * @property {PagerTerm} [page={}] - Page condition
 * @property {number} [page.number=1] - Number of page, start with 1
 * @property {number} [page.size=100] - Number of resources per page
 * @property {SortTerm} [sort=[]] - Sort condition
 */

/**
 * Filter of condition
 * @typedef {Object} FilterTerm
 */

/**
 * Page of condition
 * @typedef {Object} PagerTerm
 */

/**
 * Sort of condition
 * @typedef {string[]} SortTerm
 */

/**
 * Context of resource action
 * @typedef {Object} ActionContext
 * @property {string} action - Name of action
 */