/**
 * Mixin for condition
 * @function conditionMix
 * @param {function} BaseClass - Class to mix
 * @returns {function} Mixed class
 */
'use strict'

const {LogPrefixes} = require('clay-constants')
const {RESOURCE_PREFIX} = LogPrefixes
const {refTo} = require('clay-resource-ref')
const {isEntity} = require('clay-entity')

/** @lends conditionMix */
function conditionMix (BaseClass) {
  /** @class ConditionMixed */
  class ConditionMixed extends BaseClass {
    get $$conditionMixed () {
      return true
    }

    constructor () {
      super(...arguments)
    }

    parseConditionFilter (filter) {
      if (!filter) {
        return filter
      }
      if (Array.isArray(filter)) {
        return filter.map((filter) => this.parseConditionFilter(filter))
      }
      for (const name of Object.keys(filter)) {
        filter[name] = this.parseConditionFilterAttribute(name, filter[name])
      }
      return filter
    }

    parseConditionFilterAttribute (name, attribute) {
      if (Array.isArray(attribute)) {
        return attribute.map((attribute) => this.parseConditionFilterAttribute(name, attribute))
      }
      if (isEntity(attribute)) {
        if (!attribute.$$as) {
          console.warn(`${RESOURCE_PREFIX} You cannot use "${attribute}" as ref of "${name}" since it is not annotated`)
          return attribute
        }
        const ref = refTo(attribute.$$as, attribute.id)
        return {$ref: ref}
      }
      return attribute
    }

    parseConditionPage (page = {}) {
      for (const key of ['number', 'size']) {
        if (page.hasOwnProperty(key)) {
          page[key] = Number(page[key])
        }
      }
      return page
    }

    parseConditionSort (sort = []) {
      return sort
    }

    /**
     * Parse list condition
     * @param {ListCondition} condition
     * @returns {ListCondition} - Parsed condition
     */
    parseCondition (condition) {
      const parsed = {}
      for (const key of Object.keys(condition || {})) {
        const value = condition[key]
        switch (key) {
          case 'page': {
            parsed.page = this.parseConditionPage(value)
            break
          }
          case 'sort': {
            parsed.sort = this.parseConditionSort(value)
            break
          }
          case 'filter': {
            parsed.filter = this.parseConditionFilter(value)
            break
          }
          default: {
            let msg = `${RESOURCE_PREFIX} Unknown condition ${key}. Perhaps you mean "{filter: { ${key}: ${JSON.stringify(value)} }" ?`
            console.warn(msg)
            break
          }
        }
      }
      return parsed
    }

    /**
     * Parse list condition array
     * @param {ListCondition[]} conditionArray
     * @returns {ListCondition[]} - Parsed condition array
     */
    parseConditionArray (conditionArray) {
      return conditionArray.map((condition) => this.parseCondition(condition))
    }
  }

  return ConditionMixed
}

module.exports = conditionMix
