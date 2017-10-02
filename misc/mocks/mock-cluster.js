#!/usr/bin/env/node
'use strict'

const cluster = require('cluster')
const {isMaster, fork} = cluster
const clayDriverSQLite = require('clay-driver-sqlite')
const fromDriver = require('../../lib/from_driver.js')
const asleep = require('asleep')
const {
  ENTITY_CREATE,
  ENTITY_UPDATE,
  ENTITY_CREATE_BULK
} = require('../../lib/resource_events')
const rimraf = require('rimraf')
;(async () => {

  const storage = `${__dirname}/../../tmp/mock-cluster-data.db`
  const driver = clayDriverSQLite(storage)
  const A = fromDriver(driver, 'A')
  const B = fromDriver(driver, 'B')
  const C = fromDriver(driver, 'C')
  B.refs(A)
  B.refs(C)
  A.refs(B)
  A.refs(C)
  C.refs(B)
  C.refs(A)

  if (isMaster) {

    await asleep(600)

    A.on(ENTITY_CREATE, ({created}) => {
      console.log(`ENTITY_CREATE on master: "${created.name}"`)
    })
    A.on(ENTITY_UPDATE, ({updated}) => {
      console.log(`ENTITY_UPDATE on master: "${updated.name}"`)
    })
    asleep(100)

    const worker01 = fork({WORKER_NAME: 'worker01'})
    const worker02 = fork({WORKER_NAME: 'worker02'})

    asleep(300)
    const a = await A.create({name: 'a-in-master'})
    await a.update({name: 'a-in-master-updated'})
    const b = await B.create({a, name: 'b-in-master'})
    await b.update({name: 'b-in-master-updated'})

    await asleep(1900)
    worker01.kill()
    worker02.kill()
  } else {
    const {WORKER_NAME} = process.env

    A.on(ENTITY_CREATE, ({created}) => {
      console.log(`ENTITY_CREATE on ${WORKER_NAME}: "${created.name}"`)
    })
    A.on(ENTITY_UPDATE, ({updated}) => {
      console.log(`ENTITY_UPDATE on ${WORKER_NAME}: "${updated.name}"`)
    })

    A.on(ENTITY_CREATE_BULK, ({created}) => {
      console.log(`ENTITY_CREATE_BULK on ${WORKER_NAME}: "${created.map(({name}) => name)}"`)
    })

    asleep(200)

    switch (WORKER_NAME) {
      case 'worker01':
        const a = await A.create({name: 'a-in-worker01'})
        await C.createBulk([
          {name: 'c-in-worker-01', a},
          {name: 'c-in-worker-02', a},
          {name: 'c-in-worker-03', a}
        ])
        break
      default:
        break
    }

    await asleep(1800)
  }
})()
