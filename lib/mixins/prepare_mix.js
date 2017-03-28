/**
 * Mixin for prepare feature
 * @function prepareMix
 * @param {function} BaseClass - Class to mix
 * @returns {function} Mixed class
 */
'use strict'

const co = require('co')
const { LogPrefixes } = require('clay-constants')
const { RESOURCE_PREFIX } = LogPrefixes

/** @lends prepareMix */
function prepareMix (BaseClass) {
  /** @class PrepareMixed */
  class PrepareMixed extends BaseClass {
    get $$prepareMixed () {
      return true
    }

    constructor () {
      super(...arguments)
      const s = this
      s._needsPrepare = false
      s._prepareTasks = {}
    }

    /**
     * Do prepare if needed
     * @returns {Promise}
     */
    prepareIfNeeded () {
      const s = this
      return co(function * () {
        if (!s._needsPrepare) {
          return null
        }
        let result = s.prepare()
        s._needsPrepare = false
        return result
      })
    }

    /**
     * Do preparing
     * @returns {Promise.<Object>}
     */
    prepare () {
      const s = this
      return co(function * () {
        let results = {}
        for (let name of Object.keys(s._prepareTasks)) {
          let task = s._prepareTasks[ name ]
          results[ name ] = yield Promise.resolve(task.call(s, s))
        }
        return results
      })
    }

    /**
     * Add prepare task
     * @param {string} name - Name of task
     * @param {function} task - Task function
     * @returns {PrepareMixed} Returns this
     */
    addPrepareTask (name, task) {
      const s = this
      if (s.hasPrepareTask(name)) {
        throw new Error(`${RESOURCE_PREFIX} Prepare task already registered: ${name}`)
      }
      s._prepareTasks[ name ] = task
      return s
    }

    /**
     * Check if has task
     * @param {string} name
     * @returns {boolean} Has or not
     */
    hasPrepareTask (name) {
      const s = this
      return !!s._prepareTasks[ name ]
    }

    /**
     * Remove a task
     * @param {string} name - Name of task
     * @returns {PrepareMixed}
     */
    removePrepareTask (name) {
      const s = this
      delete s._prepareTasks[ name ]
      return s
    }

    /**
     * Set needs prepare
     * @param {boolean} [needsPrepare=true] - Needs preparing
     * @returns {PrepareMixed} Returns self
     */
    setNeedsPrepare (needsPrepare = true) {
      const s = this
      s._needsPrepare = needsPrepare
      return s
    }

  }

  return PrepareMixed
}

module.exports = prepareMix

