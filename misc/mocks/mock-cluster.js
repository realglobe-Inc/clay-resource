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

    await asleep(600)

    A.on(ENTITY_CREATE, ({created}) => {
      console.log(`ENTITY_CREATE on master: "${created.name}"`)
    })
    asleep(10)

    const worker01 = fork({WORKER_NAME: 'worker01'})
    const worker02 = fork({WORKER_NAME: 'worker02'})

    asleep(100)
    await A.create({name: 'a-in-master'})

    await asleep(600)
    worker01.kill()
    worker02.kill()
  } else {
    const {WORKER_NAME} = process.env
    const driver = clayDriverMemory()
    const A = fromDriver(driver, 'A')

    A.on(ENTITY_CREATE, ({created}) => {
      console.log(`ENTITY_CREATE on ${WORKER_NAME}: "${created.name}"`)
    })
    asleep(10)

    switch (WORKER_NAME) {
      case 'worker01':
        await A.create({name: 'a-in-worker01'})
        break
      default:
        break
    }

    await asleep(200)
  }
})()
