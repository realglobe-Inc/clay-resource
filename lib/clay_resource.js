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
 * @augments ConditionMixed
 * @augments ClusterMixed
 * @param {string} nameString - Name string
 * @param {Object.<string, function>} bounds - Method bounds
 * @param {Object} [options={}] - Optional settings
 * @param {boolean} [options.annotates] - Enable annotation
 * @param {ClayResource[]} [options.refs] - Add resource refs
 */
'use strict'

const {EventEmitter} = require('events')
const asleep = require('asleep')
const ResourceEvents = require('./resource_events')
const clayResourceName = require('clay-resource-name')
const clayResourceRef = require('clay-resource-ref')
const {DriverSpec} = require('clay-constants')
const {RESOURCE_BINDABLE_METHODS} = DriverSpec
const clayCollection = require('clay-collection')
const {NotFoundError, SituationError} = require('clay-errors')
const {
  cloneMix,
  inboundMix,
  internalMix,
  clusterMix,
  outboundMix,
  refMix,
  annotateMix,
  subMix,
  throwMix,
  prepareMix,
  policyMix,
  decorateMix,
  cacheMix,
  conditionMix,
  entityMix,
  collectionMix
} = require('./mixins')
const {
  ENTITY_CREATE,
  ENTITY_CREATE_BULK,
  ENTITY_UPDATE,
  ENTITY_UPDATE_BULK,
  ENTITY_DESTROY,
  ENTITY_DESTROY_BULK,
  ENTITY_DROP,
  INVALIDATE,
  INVALIDATE_BULK,
} = ResourceEvents

const {sureId, asEntity} = require('./helpers')

const {
  CLAY_CACHE_CLEAR_DELAY = 10
} = process.env

const tick = () => asleep(CLAY_CACHE_CLEAR_DELAY + 1)

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
  cacheMix,
  conditionMix,
  entityMix,
  collectionMix,
  clusterMix
].reduce((Base, mix) => mix(Base), EventEmitter)

const actionContextFor = (action, values) => Object.assign({}, values, {
  action,
  resolvedRefs: {}
})

/** @lends ClayResource */
class ClayResource extends ClayResourceBase {
  get $$resource () {
    return true
  }

  constructor (nameString, bounds = {}, options = {}) {
    super(...arguments)
    const s = this
    const resourceName = clayResourceName(nameString)
    const {
      name,
      domain
    } = resourceName
    const {
      annotates = true,
      caches = true,
      prepares = s.isClusterMaster(),
      refs = [],
      policy = null
    } = options

    Object.assign(s, {
      name,
      domain,
      bounds,
      _formatId: (id) => sureId(id, {prefix: nameString}),
      _resourceNameString: String(resourceName)
    })

    s.annotates(annotates)
    s.refs(...refs)
    s.policy(policy)
    s.caches(caches)
    s.prepares(prepares)

    s.setupCluster()

  }

  emit (event, data) {
    const s = this
    super.emit.call(s, event, data)
    s.emitClusterEvent(event, data)
  }

  /**
   * Get a resource
   * @param {ClayId} id - Id of the entity
   * @param {Object} [options={}] - Optional settings
   * @param {string|[]} [options.skipResolvingRefFor] - Attributes to skip resolving refs
   * @param {boolean} [options.ignoreCached] - Ignore cached data
   * @param {boolean} [options.strict] - If true, throws an error when not found
   * @returns {Promise.<Entity>} Found entity
   * @example
   * const Product = lump.resource('Product')
   * async function tryOne () {
   *   const product = await Product.one(1) // Find by id
   *   console.log(product)
   * }
   */
  async one (id, options = {}) {
    const s = this
    const {
      skipResolvingRefFor = [],
      ignoreCached = false,
      strict = false
    } = options
    await s.prepareIfNeeded()
    const actionContext = actionContextFor('one', {
      id,
      ignoreCached,
      skipResolvingRefFor: [].concat(skipResolvingRefFor).filter(Boolean)
    })
    id = s._formatId(id)
    const cached = !ignoreCached && s.gainCache(id)
    if (cached) {
      return s.outboundEntity(cached, actionContext)
    }
    const one = await s.bounds.one(id)
    if (one) {
      s.storeCache(one)
    } else {
      s.removeCache(id)
      if (strict) {
        throw new NotFoundError(`Entity not found for: "${id}"`)
      }
    }
    return s.outboundEntity(one, actionContext)
  }

  /**
   * List entities from resource
   * @param {ListCondition} [condition={}] - List condition query
   * @param {FilterTerm} [condition.filter={}] - Filter condition
   * @param {PagerTerm} [condition.page={}] - Page condition
   * @param {number} [condition.page.number=1] - Number of page, start with 1
   * @param {number} [condition.page.size=100] - Number of resources per page
   * @param {SortTerm} [condition.sort=[]] - Sort condition
   * @param {Object} [options={}] - Optional settings
   * @param {string|[]} [options.skipResolvingRefFor] - Attributes to skip resolving refs
   * @returns {Promise.<Collection>} Found resource collection
   * @example
   * const Product = lump.resource('Product')
   * async function tryList () {
   *   const products = await Product.list({
   *     filter: { type: 'Vehicle' },  // Filter condition
   *     page: { number: 1, size: 25 }, // Paginate
   *     sort: [ 'createdAt', '-name' ] // Sort condition
   *   })
   *   console.log(products)
   * }
   * tryList()
   */
  async list (condition = {}, options = {}) {
    const s = this
    const {
      skipResolvingRefFor = []
    } = options
    await s.prepareIfNeeded()
    const actionContext = actionContextFor('list', {
      condition,
      skipResolvingRefFor: [].concat(skipResolvingRefFor).filter(Boolean)
    })
    const collection = await s.bounds.list(
      s.parseCondition(condition)
    )
    Object.assign(collection, {demand: condition})
    return s.outboundCollection(collection, actionContext)
  }

  /**
   * Create a new entity with resource
   * @param {Object} attributes - Resource attributes to create
   * @param {Object} [options={}] - Optional settings
   * @param {boolean} [options.allowReserved] - Arrow to set reserved attributes (like "id")
   * @param {string} [options.errorNamespace] - Namespace for error fields
   * @returns {Promise.<Entity>} Created data
   * @example
   * const Product = lump.resource('Product')
   * async function tryCreate () {
   *   const product = await Product.create({
   *     name: 'Super Car',
   *     type: 'Vehicle'
   *   })
   *   console.log(product)
   * }
   * tryCreate()
   */
  async create (attributes = {}, options = {}) {
    const {
      allowReserved = false,
      errorNamespace
    } = options
    const s = this

    await s.prepareIfNeeded()
    const actionContext = actionContextFor('create', {errorNamespace})
    attributes = await s.inboundAttributes(attributes, actionContext)
    if (allowReserved) {
      if (typeof attributes.id !== 'string') {
        attributes.id = String(attributes.id)
      }
    }
    const values = asEntity().set(attributes, {allowReserved}).as(s._resourceNameString).toValues()
    const raw = await s.bounds.create(values)
    const created = await s.outboundEntity(raw, actionContext)
    s.emit(ENTITY_CREATE, {created})
    await tick()
    return created
  }

  /**
   * Update an existing entity in resource
   * @param {ClayId} id - Resource id
   * @param {Object} attributes - Resource attributes to update
   * @param {Object} [options={}] - Optional settings
   * @param {boolean} [options.allowReserved] - Arrow to set reserved attributes (like "id")
   * @param {string} [options.errorNamespace] - Namespace for error fields
   * @throws {NotFoundError} - Throw error when entity not found for the id
   * @returns {Promise.<Entity>} Updated data
   * @example
   * const Product = lump.resource('Product')
   * async function tryUpdate () {
   *   const product = await Product.update(1, {
   *     name: 'Super Super Car'
   *   })
   *   console.log(product)
   * }
   * tryUpdate()
   *
   */
  async update (id, attributes = {}, options = {}) {
    const s = this
    const {
      allowReserved = false,
      errorNamespace
    } = options
    await s.prepareIfNeeded()
    id = s._formatId(id)
    const actionContext = actionContextFor('update', {id, errorNamespace})
    attributes = await s.inboundAttributes(attributes, actionContext)
    const has = await s.has(id)
    if (!has) {
      throw s.throwEntityNotFoundError(id)
    }
    const old = await s.one(id)
    const values = asEntity().set(attributes, {allowReserved}).as(s._resourceNameString).toValues()
    const raw = await s.bounds.update(id, values)
    const updated = await s.outboundEntity(raw, actionContext)
    s.emit(ENTITY_UPDATE, {id, old, updated})
    s.emit(INVALIDATE, {id})
    await tick()
    return updated
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
  async destroy (id) {
    const s = this

    await s.prepareIfNeeded()
    id = s._formatId(id)
    const destroyed = await s.bounds.destroy(id)
    s.emit(ENTITY_DESTROY, {id, destroyed})
    s.emit(INVALIDATE, {id})
    await tick()
    return destroyed
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
  async drop () {
    const s = this
    const dropped = await s.bounds.drop()
    s.emit(ENTITY_DROP, {dropped})
    await tick()
    return dropped
  }

  /**
   * One as bulk
   * @param {ClayId[]} ids - Resource ids
   * @returns {Promise.<Object.<ClayId, Entity>>} Found resources
   * @example
   * const Product = lump.resource('Product')
   * async function tryOneBulk () {
   *   const products = await Product.oneBulk([ 1, 5, 10 ])
   *   console.log(products)
   * }
   * tryOneBulk()
   */
  async oneBulk (ids) {
    const s = this

    await s.prepareIfNeeded()
    const actionContext = actionContextFor('oneBulk', {ids})
    const oneHash = await s.bounds.oneBulk(ids)
    return s.outboundEntityHash(oneHash, actionContext)
  }

  /**
   * List with multiple conditions
   * @param {ListCondition[]} conditionArray
   * @returns {Promise.<Collection[]>} Found resource collections
   * @example
   * const Product = lump.resource('Product')
   * async function tryListBulk () {
   *   const [ cars, ships ] = await Product.listBulk([
   *     { filter: { type: 'CAR' } },
   *     { filter: { type: 'SHIP' } },
   *   ])
   *   console.log(cars)
   *   console.log(ships)
   * }
   * tryListBulk()
   */
  async listBulk (conditionArray = []) {
    const s = this

    await s.prepareIfNeeded()
    const actionContext = actionContextFor('listBulk', {conditionArray})
    const collectionArray = (await s.bounds.listBulk(
      s.parseConditionArray(conditionArray)
    ))
    collectionArray.map((collection, i) => Object.assign(collection, {
      demand: conditionArray[i]
    }))
    return s.outboundCollectionArray(collectionArray, actionContext)
  }

  /**
   * Create multiple resources
   * @param {Object[]} attributesArray - List of attributes
   * @param {Object} [options={}] - Optional settings
   * @param {boolean} [options.allowReserved] - Arrow to set reserved attributes (like "id")
   * @param {string} [options.errorNamespace] - Namespace for error fields
   * @returns {Promise.<Entity[]>} Created resources
   * @example
   * const Product = lump.resource('Product')
   * async function tryCreateBulk () {
   *   const products = await Product.createBulk([
   *     { name: 'Super Orange', type: 'CAR' },
   *     { name: 'Ultra Green', type: 'CAR' },
   *   ])
   *   console.log(products)
   * }
   * tryCreateBulk()
   */
  async createBulk (attributesArray = [], options = {}) {
    const s = this
    const {
      allowReserved = false,
      errorNamespace
    } = options
    await s.prepareIfNeeded()
    const actionContext = actionContextFor('createBulk', {allowReserved, errorNamespace})
    attributesArray = await s.inboundAttributesArray(attributesArray, actionContext)
    const valuesArray = attributesArray.map((attributes) => asEntity().set(attributes).as(s._resourceNameString).toValues())
    const raw = await s.bounds.createBulk(valuesArray)
    const created = await s.outboundEntityArray(raw, actionContext)
    s.emit(ENTITY_CREATE_BULK, {created})
    await tick()
    return created
  }

  /**
   * Update multiple resources
   * @param {Object.<ClayId, Object>} attributesHash - Hash of attributes
   * @param {Object} [options={}] - Optional settings
   * @param {boolean} [options.allowReserved] - Arrow to set reserved attributes (like "id")
   * @param {string} [options.errorNamespace] - Namespace for error fields
   * @throws {NotFoundError} - Throw error when entity not found for the id
   * @returns {Promise.<Object.<ClayId, Entity>>} Updated resources
   * @example
   * const Product = lump.resource('Product')
   * async function tryUpdateBulk () {
   *   const products = await Product.updateBulk({
   *     '1': { name: 'Super Super Orange' },
   *     '2': { name: 'Ultra Ultra Green' },
   *   })
   *   console.log(products)
   * }
   * tryUpdateBulk()
   */
  async updateBulk (attributesHash = {}, options = {}) {
    const s = this
    const {
      errorNamespace,
      allowReserved = false
    } = options
    await s.prepareIfNeeded()
    const ids = Object.keys(attributesHash)
    const actionContext = actionContextFor('updateBulk', {ids, errorNamespace})
    attributesHash = await s.inboundAttributesHash(attributesHash, actionContext)
    for (const id of ids) {
      const has = await s.has(id)
      if (!has) {
        throw s.throwEntityNotFoundError(id)
      }
    }
    const old = await Promise.all(ids.map((id) => s.one(id)))
    const valuesHash = ids.reduce((valuesHash, id) => Object.assign(valuesHash, {
      [id]: asEntity().set(attributesHash[id], {allowReserved}).as(s._resourceNameString).toValues()
    }), {})
    const raw = await s.bounds.updateBulk(valuesHash)
    const updated = await s.outboundEntityHash(raw, actionContext)
    s.emit(ENTITY_UPDATE_BULK, {ids, updated, old})
    s.emit(INVALIDATE_BULK, {ids})
    await tick()
    return updated
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
  async destroyBulk (ids = []) {
    const s = this

    await s.prepareIfNeeded()
    ids = ids.map(sureId)
    const destroyed = await s.bounds.destroyBulk(ids)
    s.emit(ENTITY_DESTROY_BULK, {ids, destroyed})
    s.emit(INVALIDATE_BULK, {ids})
    await tick()
    return destroyed
  }

  /**
   * Create cursor to cursor
   * @param {Object} [condition={}] - Optional settings
   * @param {FilterTerm} [condition.filter={}] - Filter condition
   * @param {SortTerm} [condition.sort=[]] - Sort condition
   * @returns {Object} {Promise.<[Symbol.iterator], function>} Iterable cursor
   * @example
   * const Product = lump.resource('Product')
   * async function tryCursor () {
   *   const cursor = await Product.cursor({
    *     filter: { type: 'CAR' }
   *   })
   *   console.log(cursor.length) // Number of entities matches the condition
   *   for (const fetch of cursor) {
   *     const car = await fetch() // Fetch the pointed entity
   *     console.log(car)
   *   }
   * }
   * tryCursor()
   */
  async cursor (condition = {}) {
    const s = this

    await s.prepareIfNeeded()
    const actionContext = actionContextFor('cursor', {condition})
    const {sort, filter} = s.parseCondition(condition)
    const parser = (entities) =>
      s.outboundCollection(
        clayCollection({entities, demand: condition}),
        actionContext
      ).then(({entities}) => entities)
    return await s.bounds.cursor({sort, filter, parser})
  }

  /**
   * Iterate entities with handler
   * @param {function} handler - Entity handler
   * @param {Object} [condition={}] - Optional settings
   * @param {FilterTerm} [condition.filter={}] - Filter condition
   * @param {SortTerm} [condition.sort=[]] - Sort condition
   * @example
   * const Product = lump.resource('Product')
   * async function tryEach () {
   *    await Product.each(async (product) => {
   *       // Do something with each entity
   *    }, {
   *       filter: {price: {$gt: 100}}
   *    })
   * }
   * tryEach()
   * @returns {Promise}
   */
  async each (handler, condition = {}) {
    const s = this

    await s.prepareIfNeeded()
    const cursor = await s.cursor(condition)
    let i = 0
    for (const fetch of cursor) {
      const entity = await fetch()
      if (!entity) {
        continue
      }
      await Promise.resolve(
        handler(entity, i)
      )
      i++
    }
  }

  /**
   * Get the first entity matches filter
   * @param {FilterTerm} [filter={}] - Listing filter
   * @param {Object} [options={}] - Optional settings
   * @param {Object} [options.sort=[]] - Sort conditions
   * @returns {Promise.<?Entity>} Found one
   * @example
   * const Product = lump.resource('Product')
   * async function tryFirst () {
   *   const product = Product.first({ name: 'Super Super Orange' })
   *   console.log(product)
   * }
   * tryFirst()
   */
  async first (filter, options = {}) {
    const s = this
    const {
      sort = '$$at',
      skip = 0,
      skipResolvingRefFor = []
    } = options
    const actionContext = actionContextFor('first', {skipResolvingRefFor})

    await s.prepareIfNeeded()
    const page = {size: 1, number: 1 + skip}
    const {entities} = await s.list({filter, page, sort}, {skipResolvingRefFor})
    return await s.outboundEntity(entities[0], actionContext)
  }

  /**
   * Get the last entity matches filter
   * @param {FilterTerm} [filter={}] - Listing filter
   * @param {Object} [options={}] - Optional settings
   * @param {Object} [options.sort=[]] - Sort conditions
   * @returns {Promise.<?Entity>} Found one
   */
  async last (filter, options = {}) {
    const s = this
    const {
      sort = '$$at',
      skip = 0,
      skipResolvingRefFor = []
    } = options
    const total = await s.count(filter)
    return s.first(filter, {
      sort,
      skip: (total - 1) - skip,
      skipResolvingRefFor
    })
  }

  /**
   * Almost same with `.first()`, but throws an error if multiple record hits, or no record found
   * @param {FilterTerm} [filter={}] - Listing filter
   * @param {Object} [options={}] - Optional settings
   * @param {boolean} [options.strict] - If true, throws an error when not found
   * @returns {Promise.<?Entity>} Found one
   * @example
   * const Product = lump.resource('Product')
   * async function tryOnly () {
   *   const product = Product.only({ name: 'Super Super Orange' })
   *   console.log(product)
   * }
   * tryOnly()
   */
  async only (filter, options = {}) {
    const s = this
    const {
      strict = false
    } = options

    await s.prepareIfNeeded()
    const count = await s.count(filter)
    if (count > 1) {
      throw new SituationError(`Multiple entity found for only entity`, {
        count,
        filter
      })
    }
    const found = await s.first(filter)
    if (!found && strict) {
      throw new NotFoundError(`Entity not found for: ${JSON.stringify(filter)}`)
    }
    return found
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
  async seal (privateKey, options = {}) {
    const s = this
    const {by = null} = options

    await s.prepareIfNeeded()
    const cursor = await s.cursor({
      // TODO Filter with seal
    })
    for (const fetch of cursor) {
      const fetched = await fetch()
      const {id} = fetched
      const {$$seal, $$by} = asEntity(fetched)
        .by(by)
        .seal(privateKey).toValues()
      await s.bounds.update(id, {$$seal, $$by})
    }
  }

  /**
   * Check entity with id exists
   * @param {ClayId} id - Id of the entity
   * @returns {Promise.<boolean>} Exists or not
   * @example
   * const Product = lump.resource('Product')
   * async function tryHas () {
   *   const has = await Product.has(1)
   *   console.log(has)
   * }
   * tryHas()
   */
  async has (id) {
    const s = this

    await s.prepareIfNeeded()
    id = s._formatId(id)
    const one = await s.one(id, {strict: false})
    return !!one
  }

  /**
   * Check data exists with filter
   * @param {FilterTerm} [filter={}] - List filter
   * @returns {Promise.<boolean>} Exists or not
   * @example
   * const Product = lump.resource('Product')
   * async function tryExists () {
   *   const exists = await Product.exists({ name: 'Super Super Orange' })
   *   console.log(exists)
   * }
   * tryExists()
   */
  async exists (filter = {}) {
    const s = this

    await s.prepareIfNeeded()
    const count = await s.count(filter)
    return count > 0
  }

  /**
   * Count data matches filter
   * @param {FilterTerm} [filter={}] - List filter
   * @returns {Promise.<number>} Number of entities
   * @example
   * const Product = lump.resource('Product')
   * async function tryCount () {
   *   const count = await Product.count({ type: 'CAR' })
   *   console.log(count)
   * }
   * tryCount()
   */
  async count (filter = {}) {
    const s = this

    await s.prepareIfNeeded()
    const {meta} = await s.list({page: {number: 1, size: 1}, filter})
    return meta.total
  }

  /**
   * Find entity with attributes and returns if found.
   * If not found, create and return the one.
   * @param {Object} attributes - Attributes
   * @example
   * const Product = lump.resource('Product')
   * async function tryOf () {
   *   const values = await Product.of({ code: '#1234' })
   *   console.log(values)
   * }
   * tryOf()
   */
  async of (attributes = {}) {
    const s = this

    await s.prepareIfNeeded()
    const found = await s.first(attributes)
    if (found) {
      return found
    }
    await s.create(attributes)
    return await s.of(attributes)
  }

  /**
   * Get all entities inside resource which matches the filter
   * @param {FilterTerm} [filter={}] - Listing filter
   * @param {Object} [options={}] - Optional settings
   * @param {string|string[]} [options.sort=[]] - Sort attribute
   * @param {number} [options.iterateSize] - Size to iterate
   * @param {string|[]} [options.skipResolvingRefFor] - Attributes to skip resolving refs
   * @returns {Promise.<ClayEntity[]>} Entities
   */
  async all (filter, options = {}) {
    const s = this
    const {
      sort = [],
      iterateSize = 100,
      skipResolvingRefFor = []
    } = options
    const actionContext = actionContextFor('all', {})

    await s.prepareIfNeeded()
    let found = []
    let pageNumber = 1
    let hasMore = true
    do {
      const {entities, meta} = await s.list({
        filter,
        sort,
        page: {
          number: pageNumber,
          size: iterateSize
        }
      }, {
        skipResolvingRefFor
      })
      found = found.concat(entities)
      const {offset, limit, total} = meta
      hasMore = offset + limit < total
      pageNumber++
    } while (hasMore)
    return s.outboundEntityArray(found, actionContext)
  }

  /**
   * Get resource ref string for this resource
   * @param {ClayId|string} id - Resource id
   * @returns {string} - Ref string
   */
  refOf (id) {
    const s = this
    return clayResourceRef.refTo(s, id)
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
    const resourceName = String(clayResourceName(nameString))
    const bounds = RESOURCE_BINDABLE_METHODS.split(',')
      .reduce((bounds, methodName) => Object.assign(bounds, {
        [methodName]: driver[methodName].bind(driver, resourceName)
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
