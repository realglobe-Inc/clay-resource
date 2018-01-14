/**
 * Mixin for prepare feature
 * @function prepareMix
 * @param {function} BaseClass - Class to mix
 * @returns {function} Mixed class
 */
'use strict'

const {LogPrefixes} = require('clay-constants')
const {RESOURCE_PREFIX} = LogPrefixes

/** @lends prepareMix */
function prepareMix (BaseClass) {
  /** @class PrepareMixed */
  class PrepareMixed extends BaseClass {
    get $$prepareMixed () {
      return true
    }

    constructor () {
      super(...arguments)
      this._prepareEnabled = false
      this._needsPrepare = false
      this._prepareTasks = {}
    }

    /**
     * Toggle prepare support
     * @param {boolean} prepares - Should prepare or not
     * @returns {PrepareMixed} this
     */
    prepares (prepares) {
      if (arguments.length === 0) {
        return !this._prepareEnabled
      }
      this._prepareEnabled = prepares
      return this
    }

    /**
     * Do prepare if needed
     * @returns {Promise}
     */
    async prepareIfNeeded () {
      if (!this._needsPrepare) {
        return null
      }
      const result = this.prepare()
      this._needsPrepare = false
      return result
    }

    /**
     * Do preparing
     * @returns {Promise.<Object>}
     */
    async prepare () {
      if (!this.prepares()) {
        return false
      }
      const results = {}
      for (const name of Object.keys(this._prepareTasks)) {
        let task = this._prepareTasks[name]
        results[name] = await Promise.resolve(task.call(this, this))
      }
      return results
    }

    /**
     * Add prepare task
     * @param {string} name - Name of task
     * @param {function} task - Task function
     * @returns {PrepareMixed} Returns this
     */
    addPrepareTask (name, task) {
      if (this.hasPrepareTask(name)) {
        throw new Error(`${RESOURCE_PREFIX} Prepare task already registered: ${name}`)
      }
      this._prepareTasks[name] = task
      return this
    }

    /**
     * Check if has task
     * @param {string} name
     * @returns {boolean} Has or not
     */
    hasPrepareTask (name) {
      return !!this._prepareTasks[name]
    }

    /**
     * Remove a task
     * @param {string} name - Name of task
     * @returns {PrepareMixed}
     */
    removePrepareTask (name) {
      delete this._prepareTasks[name]
      return this
    }

    /**
     * Set needs prepare
     * @param {boolean} [needsPrepare=true] - Needs preparing
     * @returns {PrepareMixed} Returns self
     */
    setNeedsPrepare (needsPrepare = true) {
      this._needsPrepare = needsPrepare
      return this
    }
  }

  return PrepareMixed
}

module.exports = prepareMix
