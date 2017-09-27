#!/usr/bin/env/node
'use strict'

const cluster = require('cluster')
const {isMaster, fork} = cluster
const clayDriverMemory = require('clay-driver-memory')
const fromDriver = require('../../lib/from_driver.js')
const asleep = require('asleep')
const {ENTITY_CREATE} = require('../../lib/resource_events')

;(async () => {

  if (isMaster) {
    const driver = clayDriverMemory()
    const A = fromDriver(driver, 'A')

    await asleep(1000)

    cluster.on('listening', () => console.log('!!!l'))

    A.on(ENTITY_CREATE, ({created}) => {
      console.log('ENTITY_CREATE on master:', created.name)
    })
    asleep(10)

    const worker = fork({})

    asleep(100)
    await A.create({name: 'a-in-master'})

    await asleep(2000)
    worker.kill()
  } else {
    const driver = clayDriverMemory()
    const A = fromDriver(driver, 'A')

    A.on(ENTITY_CREATE, ({created}) => {
      console.log('ENTITY_CREATE on worker:', created.name)
    })
    asleep(10)
    await A.create({name: 'a-in-worker'})

    await asleep(500)
  }
})()
