/**
 * Resource accessor
 * @class ClayResource
 * @param {string} nameString - Name string
 * @param {Object.<string, function>} bounds - Method bounds
 * @param {Object} [options={}] - Optional settings
 */
'use strict'

const { EventEmitter } = require('events')
const { decorate, create } = require('clay-entity')
const clayResourceName = require('clay-resource-name')
const { cloneMix, annotateMix } = require('./mixins')

const entity = () => decorate(create({ id: false }))

const ClayResourceBase = [
  cloneMix,
  annotateMix
].reduce((Base, mix) => mix(Base), EventEmitter)

/** @lends ClayResource */
class ClayResource extends ClayResourceBase {
  get $$resource () {
    return true
  }

  constructor (nameString, bounds = {}, options = {}) {
    let args = [ ...arguments ]
    super(...args)
    const s = this
    let {
      name,
      domain
    } = clayResourceName(nameString)
    let {
      annotate = false
    } = options
    Object.assign(s, {
      name,
      domain,
      bounds,
      annotate,
      args
    })
  }

  /**
   * Get a resource
   * @param {ClayId} id - Id of the entity
   * @returns {Promise.<ClayEntity>} Found entity
   */
  one (id) {
    const s = this
    return s.bounds.one(id).then((one) => s.processAnnotateForEntity(one))
  }

  /**
   * List entities from resource
   * @param {ListCondition} [condition={}] - List condition query
   * @returns {Promise.<ClayCollection>} Found resource collection
   */
  list (condition = {}) {
    const s = this
    return s.bounds.list(condition).then((collection) => s.processAnnotateForCollection(collection))
  }

  /**
   * Create a new entity with resource
   * @param {Object} attributes - Resource attributes to create
   * @returns {Promise.<ClayEntity>} Created data
   */
  create (attributes = {}) {
    const s = this
    let { values } = entity().set(attributes)
    return s.bounds.create(values).then((created) => s.processAnnotateForEntity(created))
  }

  /**
   * Update an existing entity in resource
   * @param {ClayId} id - Resource id
   * @param {Object} attributes - Resource attributes to update
   * @returns {Promise.<ClayEntity>} Updated data
   */
  update (id, attributes = {}) {
    const s = this
    let { values } = entity().set(attributes)
    return s.bounds.update(id, values).then((updated) => s.processAnnotateForEntity(updated))
  }

  /**
   * Delete a entity resource
   * @param {ClayId} id - Resource id
   * @returns {Promise.<number>} Destroyed count (0 or 1)
   */
  destroy (id) {
    const s = this
    return s.bounds.destroy(id)
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
    return s.bounds.oneBulk(ids).then((oneHash) => s.processAnnotateForEntityHash(oneHash))
  }

  /**
   * List with multiple conditions
   * @param {ListCondition[]} conditionArray
   * @returns {Promise.<ClayCollection[]>} Found resource collections
   */
  listBulk (conditionArray = []) {
    const s = this
    return s.bounds.listBulk(conditionArray).then((collectionAlly) =>
      s.processAnnotateForCollectionArray(collectionAlly)
    )
  }

  /**
   * Create multiple resources
   * @param {Object[]} attributesArray - List of attributes
   * @returns {Promise.<ClayEntity[]>} Created resources
   */
  createBulk (attributesArray = []) {
    const s = this
    let valuesArray = attributesArray.map((attributes) => entity().set(attributes).values)
    return s.bounds.createBulk(valuesArray).then((createdArray) => s.processAnnotateForEntityArray(createdArray))
  }

  /**
   * Update multiple resources
   * @param {Object.<ClayId, Object>} attributesHash - Hash of attributes
   * @returns {Promise.<Object.<ClayId, ClayEntity>>} Updated resources
   */
  updateBulk (attributesHash = {}) {
    const s = this
    let valuesHash = Object.keys(attributesHash).reduce((valuesHash, id) => Object.assign(valuesHash, {
      [id]: entity().set(attributesHash[ id ]).values
    }), {})
    return s.bounds.updateBulk(valuesHash).then((updatedHash) => s.processAnnotateForEntityHash(updatedHash))
  }

  /**
   * Update multiple resources
   * @param {ClayId[]} ids - Ids to destroy
   * @returns {Promise.<number>} Destroyed counts
   */
  destroyBulk (ids = []) {
    const s = this
    return s.bounds.destroyBulk(ids)
  }

  /**
   * Create cursor to cursor
   * @param {Object} [options={}] - Optional settings
   * @returns {Object} {Promise.<[Symbol.iterator], function>} Iterable cursor
   */
  cursor (options = {}) {
    const s = this
    return s.bounds.cursor(options)
  }

  /**
   * Seal resources
   * @param {string} privateKey
   * @returns {Promise}
   */
  seal (privateKey) {
    // TODO seal処理を実装する
    throw new Error('Not implemented!')
  }
}

module.exports = ClayResource

/**
 * Conditions of list
 * @typedef {Object} ListCondition
 * @property {Object} [filter={}] - Filter condition
 * @property {Object} [page={}] - Page condition
 * @property {number} [page.number=1] - Number of page, start with 1
 * @property {number} [page.size=100] - Number of resources per page
 */
