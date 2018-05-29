/**
 * Test case for fromDriver.
 * Runs with mocha.
 */
'use strict'

const fromDriver = require('../lib/from_driver.js')
const clayDriverMemory = require('clay-driver-memory')
const clayDriverSqlite = require('clay-driver-sqlite')
const {decorate} = require('clay-entity')
const {ok, equal, strictEqual, deepEqual} = require('assert')
const asleep = require('asleep')
const clayPolicy = require('clay-policy')
const {refTo} = require('clay-resource-ref')
const {generate: generateKeys, verify} = require('clay-crypto')

const {DataTypes} = clayPolicy

describe('from-driver', function () {
  this.timeout(30000)

  before(async () => {

  })

  after(async () => {

  })

  it('From driver', async () => {
    let driver = clayDriverMemory()
    let resource = fromDriver(driver, 'hogehoge', {annotates: true})

    ok(!(await resource.exists({foo: 'bar'})))

    let created = await resource.create({foo: 'bar'})
    ok(created)
    ok(created.id)
    ok(created.$$at)

    ok(await resource.exists({foo: 'bar'}))

    equal(await resource.count(), 1)

    let {id} = created

    let one = await resource.one(id)
    equal(one.foo, 'bar')
    equal(String(one.id), String(id))

    await asleep(10)

    let updated = await resource.update(id, {foo2: 'bar2'})
    ok(updated)
    equal(updated.foo, 'bar')
    equal(updated.foo2, 'bar2')
    ok(updated.$$at > created.$$at)

    let first = await resource.first({foo2: 'bar2'})
    ok(first)
    ok(first.foo2, 'bar2')

    let only = await resource.only({foo2: 'bar2'})
    ok(only)
    ok(only.foo2, 'bar2')

    await resource.destroy(id)

    // Sub resource
    {
      let hogeResource = resource.sub('hoge')
      ok(hogeResource)
      await hogeResource.create({fooSub: 'barSub'})

      strictEqual(resource.sub('hoge'), resource.sub('hoge'), 'Using cache')

      equal(hogeResource.name, 'hogehogehoge')
      ok(hogeResource.refs()['hogehoge'])
    }

    {
      let caught
      try {
        await resource.update('__invalid_id__', {})
      } catch (thrown) {
        caught = thrown
      }
      ok(caught)
      equal(caught.name, 'NotFoundError')
    }
  })

  it('From driver without annotate', async () => {
    let driver = clayDriverMemory()
    let resource = fromDriver(driver, 'hogehoge').annotates(false)

    let created = await resource.create({foo: 'bar'})

    let {id} = created

    let one = await resource.one(id)
    equal(one.foo, 'bar')
    equal(String(one.id), String(id))
    ok(!one.$$at)

    // One without ID
    {
      let caught
      try {
        await resource.one()
      } catch (e) {
        caught = e
      }
      ok(caught)
      equal(caught.message, '[Clay][hogehoge] id is required')
    }

    const updated = await resource.update(id, {foo2: 'bar2'})
    ok(updated)
    equal(updated.foo, 'bar')
    equal(updated.foo2, 'bar2')
    ok(!updated.$$at)

    await resource.destroy(id)

    // Bulk
    {
      let [created] = await resource.createBulk([{foo: 'bar'}])
      ok(created)
      ok(created.id)
      ok(!created.$$at)

      let {id} = created
      let one = (await resource.oneBulk([id]))[id]
      equal(one.foo, 'bar')
      equal(String(one.id), String(created.id))

      await asleep(10)

      let updated = (await resource.updateBulk({[id]: {foo2: 'bar2'}}))[id]
      ok(updated)
      equal(updated.foo, 'bar')
      equal(updated.foo2, 'bar2')
      ok(!updated.$$at)

      equal((await resource.all())[0].foo, 'bar')

      let count = await resource.destroyBulk([created.id])
      equal(count, 1)

    }
  })

  it('From driver bulk', async () => {
    let driver = clayDriverMemory()
    let resource = fromDriver(driver, 'hogehoge', {annotate: true})

    let [created] = await resource.createBulk([{foo: 'bar'}])
    ok(created)
    ok(created.id)
    ok(created.$$at)

    let {id} = created
    let one = (await resource.oneBulk([id]))[id]
    equal(one.foo, 'bar')
    equal(String(one.id), String(created.id))

    await asleep(10)

    let updated = (await resource.updateBulk({[id]: {foo2: 'bar2'}}))[id]
    ok(updated)
    equal(updated.foo, 'bar')
    equal(updated.foo2, 'bar2')
    ok(updated.$$at > created.$$at)

    let count = await resource.destroyBulk([created.id])
    equal(count, 1)
  })

  it('From driver seal', async () => {
    let driver = clayDriverMemory()
    let resource = fromDriver(driver, 'hogehoge').clone().annotates(true)
    let created = await resource.create({foo: 'bar'})
    let {id} = created

    let {privateKey, publicKey} = generateKeys()
    await resource.seal(privateKey, {by: 'foo!'})

    let one = await resource.one(id)
    ok(one.$$seal)
    equal(one.$$as, 'hogehoge')
    equal(one.$$by, 'foo!')

    ok(decorate(one).verify(publicKey))
    one.hoge = 'fuge'
    ok(!decorate(one).verify(publicKey))
  })

  it('Resolve refs', async () => {
    let driver = clayDriverMemory()
    let Org = fromDriver(driver, 'Org')
    let User = fromDriver(driver, 'User').refs(Org)
    let org01 = await Org.create({name: 'org01'})
    let user01 = await User.create({
      name: 'user01',
      org: {$ref: refTo(Org, org01.id)}
    })
    equal(user01.org.name, 'org01')
    let user02 = await User.create({
      name: 'user02',
      org: org01
    })
    equal(user02.org.name, 'org01')

    equal(driver._storages.User[String(user02.id)].org.$ref, `Org#${org01.id}`)

    let Team = fromDriver(driver, 'Team').refs(User)
    let team01 = await Team.create({
      name: 'Team01',
      users: [{$ref: refTo(User, user01.id)}]
    })
    ok(team01)
    equal(team01.users[0].name, 'user01')
  })

  it('Policy check', async () => {
    const {STRING, DATE} = clayPolicy.DataTypes
    const driver = clayDriverMemory()
    const User = fromDriver(driver, 'User')

    User.setPolicy({
      username: {
        type: STRING,
        required: true,
        trim: true
      },
      birthday: {
        type: DATE
      },
      rank: {
        type: STRING,
        oneOf: ['GOLD', 'SLIVER', 'BRONZE']
      }
    })

    let caught
    try {
      await User.create({
        username: 'hoge',
        rank: 'SUPER'
      })
    } catch (thrown) {
      caught = thrown
    }
    ok(caught)

    {
      let caught
      try {
        await User.create({
          username: 'hoge',
          rank: 'SUPER'
        }, {errorNamespace: 'joined'})
      } catch (thrown) {
        caught = thrown
      }
      deepEqual(Object.keys(caught.detail.failures), ['joined.rank'])
      ok(caught)
    }
    deepEqual(caught.detail.failures.rank, {
      reason: 'UNEXPECTED_VALUE_ERROR',
      actual: 'SUPER',
      expects: {oneOf: ['GOLD', 'SLIVER', 'BRONZE']}
    })

    let user02 = await User.create({username: '  hoge  '})
    equal(user02.username, 'hoge', 'Should be trimmed')

    {
      await user02.update({v: 2})
    }
  })

  it('of', async () => {
    let driver = clayDriverMemory()
    let Product = fromDriver(driver, 'Product')
    let product01 = await Product.of({code: '#1234'})
    equal(product01.code, '#1234')
    let product02 = await Product.of({code: '#1234'})
    equal(String(product01).id, String(product02).id)
    await Product.drop()
  })

  it('Unique', async () => {
    const driver = clayDriverMemory()
    const Fruit = fromDriver(driver, 'Fruit')
    Fruit.policy({
      name: {
        type: DataTypes.STRING,
        unique: true
      }
    })
    await Fruit.create({name: null})
    await Fruit.create({name: null})
    await Fruit.create({name: 'banana'})
    let caught
    try {
      await Fruit.create({name: 'banana'})
    } catch (thrown) {
      caught = thrown
    }
    ok(caught)

    await Fruit.create({name: 'orange'})
    await Fruit.create({name: 'apple'})
    await Fruit.drop()
  })

  it('Default', async () => {
    let driver = clayDriverMemory()
    let Box = fromDriver(driver, 'Box')
    Box.policy({
      type: {
        type: DataTypes.STRING,
        default: 'Wood'
      }
    })
    let toyBox = await Box.create({name: 'toy'})
    equal(toyBox.type, 'Wood')
    Box.policy({
      type: {
        type: DataTypes.STRING,
        default: 'Steal'
      }
    })
    let toyBox2 = await Box.update(toyBox.id, {name: 'toy2'})
    equal(toyBox2.type, 'Wood')
    let toyBox3 = await Box.create({name: 'toy3'})
    equal(toyBox3.type, 'Steal')
  })

  it('Save/Fetch policy', async () => {
    let driver = clayDriverMemory()
    let Fruit = fromDriver(driver, 'Fruit')
    let policy = clayPolicy({
      name: {
        type: DataTypes.STRING,
        unique: true
      }
    })
    let digest = await Fruit.savePolicy(policy)
    let fetched = await Fruit.fetchPolicy(digest)
    ok(fetched)
    ok(fetched.hasRestrictionFor('name'))
  })

  it('Using cache', async () => {
    let driver = clayDriverMemory()
    let Fruit = fromDriver(driver, 'Fruit')

    let orange01 = await Fruit.create({name: 'orange'})
    let banana01 = await Fruit.create({name: 'banana'})

    await Fruit.one(orange01.id)
    await Fruit.one(orange01.id)
    equal(Fruit._resourceCache.size, 1)
    await Fruit.one(banana01.id)
    equal(Fruit._resourceCache.size, 2)

    await Fruit.update(orange01.id, {vr: 2})
    equal(Fruit._resourceCache.size, 1)
    let orange01Again = await Fruit.one(orange01.id)
    equal(orange01Again.vr, 2)
    await Fruit.one(orange01.id)
    equal(Fruit._resourceCache.size, 2)

    await Fruit.destroy(orange01.id)
    let orange01AgainAgain = await Fruit.one(orange01.id)
    equal(orange01AgainAgain, null)
  })

  it('Search by ref', async () => {
    const drivers = [
      clayDriverMemory(),
      clayDriverSqlite(`${__dirname}/../tmp/search-by-ref.db`)
    ]
    for (const driver of drivers) {
      const Org = fromDriver(driver, 'Org')
      const User = fromDriver(driver, 'User')
      Org.refs(User)
      User.refs(Org)

      const org01 = await Org.create({name: 'org01'})
      const org02 = await Org.create({name: 'org02'})
      await User.create({name: 'user01', org: org01})
      await User.create({name: 'user02', org: org02})

      const org01onceJSON = JSON.parse(JSON.stringify(org01))
      const {meta, entities, demand} = await User.list({filter: {org: org01onceJSON}})
      equal(meta.length, 1)
      const [user] = entities
      equal(user.name, 'user01')
      equal(demand.filter.org.$ref, `Org#${org01.id}`)

      {
        let [{meta, entities, demand}] = await User.listBulk([{filter: {org: org01}}])
        equal(meta.length, 1)
        let [user] = entities
        equal(user.name, 'user01')
        equal(demand.filter.org.$ref, `Org#${org01.id}`)
      }
    }
  })

  it('Circular refs', async () => {
    const driver = clayDriverMemory()
    const Toy = fromDriver(driver, 'Toy')
    const House = fromDriver(driver, 'House')

    Toy.refs(House)
    House.refs(Toy)

    let house01 = await House.create({name: 'house01'})

    let toy01 = await Toy.create({name: 'toy01', house: house01})
    let toy02 = await Toy.create({name: 'toy02', house: house01})

    await House.update(house01.id, {toys: [toy01, toy02]})

    let house01Again = await House.one(house01.id)
    equal(house01Again.toys[0].house.$ref, `House#${house01.id}`)

    let toy01Again = await Toy.one(toy01.id)
    equal(toy01Again.house.toys[0].$ref, `Toy#${toy01.id}`)
  })

  // https://github.com/realglobe-Inc/claydb/issues/8
  it('claydb/issues/8', async () => {
    let driver = clayDriverMemory()
    let Org = fromDriver(driver, 'Org')
    let User = fromDriver(driver, 'User')
    Org.refs(User)
    User.refs(Org)
    let realglobe = await Org.create({name: 'realglobe'})
    let realglobeObj = Object(realglobe)
    let user = await User.create({name: 'fuji', org: realglobeObj})
    ok(user.org.$$entity)
  })

  it('Add invalid ref', async () => {
    let driver = clayDriverMemory()
    let Org = fromDriver(driver, 'Org')
    let User = fromDriver(driver, 'User')
    Org.refs(User)
    User.refs(Org)
    let org01 = await Org.create({name: 'FantasticPark'})
    let user01 = await User.create({
      name: 'Rider01',
      org: {
        '$$as': org01.$$as,
        'id': 'hogehoge'
      }
    })
    ok(user01)
  })

  it('Convert id', async () => {
    let driver = clayDriverMemory()
    let User = fromDriver(driver, 'User')
    let user01 = await User.create({name: 'Rider01'})

    await User.update(user01, {name: 'Updated Rider01'})

    equal((await User.one(user01)).name, 'Updated Rider01')

    ok(await User.has(user01))
    await User.destroy(user01)
    ok(!(await User.has(user01)))
  })

  it('Using entity bind', async () => {
    const driver = clayDriverMemory()
    let User = fromDriver(driver, 'User')
    let user01 = await User.create({name: 'Rider01'})
    ok(user01.update)
    ok(user01.destroy)
    ok(Object.assign({}, user01).name)
    ok(!Object.assign({}, user01).update)
    ok(!Object.assign({}, user01).destroy)

    await user01.update({version: 2})
    await User.update(user01, {foo: 'bar'})
    await user01.sync()
    equal(user01.foo, 'bar')
    equal(user01.version, 2)

    await user01.destroy()

    equal(await User.count(), 0)

    {
      let caught
      try {
        await user01.update({foo: 'bar'})
      } catch (e) {
        caught = e
      }
      ok(caught)
    }

    await driver.close()
  })

  it('Use strict options', async () => {
    const driver = clayDriverMemory()
    let User = fromDriver(driver, 'User')
    let user01 = await User.create({name: 'Rider01'})
    await User.one(user01.id, {strict: false})
    await User.one(user01.id, {strict: true})

    await User.one('__invalid_id__', {strict: false})
    let caught
    try {
      await User.one('__invalid_id__', {strict: true})
    } catch (e) {
      caught = e
    }
    ok(caught)

    await driver.close()
  })

  it('Use resource collection', async () => {
    const driver = clayDriverMemory()
    const Org = fromDriver(driver, 'Org')
    const User = fromDriver(driver, 'User')

    Org.refs(User)
    User.refs(Org)

    const org01 = await Org.create({name: 'org01'})
    const org02 = await Org.create({name: 'org02'})
    for (let i = 0; i < 102; i++) {
      await User.create({
        name: `user-${i}`,
        group: i % 2 === 0 ? 'yellow' : 'green',
        org: i % 2 === 0 ? org01 : org02
      })
    }
    let users = await User.list({filter: {group: 'green'}, page: {number: 1, size: '25'}})
    let counts = []
    while (users.hasNext) {
      counts.push(users.meta)
      users = await users.next()
    }
    counts.push(users.meta)
    deepEqual(counts, [
      {offset: 0, limit: 25, length: 25, total: 51},
      {offset: 25, limit: 25, length: 25, total: 51},
      {offset: 50, limit: 25, length: 1, total: 51}
    ])

    {
      const eachUsers = []
      await User.each((user) => {
        ok(user.org)
        eachUsers.push(user)
      }, {filter: {org: org01}})
      equal(eachUsers.length, 51)
    }

    {
      equal((await User.count({org: org01})), 51)
    }

    await driver.close()
  })

  it('Enhance entity', async () => {
    const driver = clayDriverMemory()
    const User = fromDriver(driver, 'User')
    User.enhanceResourceEntity((UserEntity) =>
      class EnhancedUserEntity extends UserEntity {
        get fullName () {
          let {familyName, firstName} = this
          return [firstName, familyName].filter(Boolean).join(' ')
        }
      }
    )

    let user01 = await User.create({firstName: 'Taka', familyName: 'Okunishi'})
    equal(user01.fullName, 'Taka Okunishi')

    await driver.close()
  })

  it('Enhance collection', async () => {
    const driver = clayDriverMemory()
    const User = fromDriver(driver, 'User')
    User.enhanceResourceCollection((UserCollection) =>
      class EnhancedUserCollection extends UserCollection {
        nextOne () {
          let {demand, page} = this
          return User.first(demand.filter, {
            sort: demand.sort,
            skip: page.size * page.number
          })
        }
      }
    )

    await User.create({name: 'user01'})
    await User.create({name: 'user02'})
    await User.create({name: 'user03'})

    let users = await User.list({
      page: {
        size: 2,
        number: 1
      },
      sort: ['-name']
    })
    equal((await users.nextOne()).name, 'user01')

    await driver.close()
  })

  // https://github.com/realglobe-Inc/clay-resource/issues/51
  it('issues/51', async () => {
    const driver = clayDriverMemory()
    const User = fromDriver(driver, 'User')
    const UserAuth = fromDriver(driver, 'UserAuth')
    const Live = fromDriver(driver, 'Live')

    Live.refs(User, UserAuth)
    User.refs(UserAuth, Live)
    UserAuth.refs(User, Live)

    let userData = {
      userKey: 'miyazaki',
      name: 'miyazaki'
    }
    let user = await User.create(userData)
    ok(user)

    let liveData = {
      name: 'Universe',
      createdBy: user
    }
    let live = await Live.create(liveData)
    ok(live)

    equal(live.createdBy.userKey, 'miyazaki')

    await driver.close()
  })

  it('Numeric id', async () => {
    const driver = clayDriverMemory()
    const Ball = fromDriver(driver, 'Ball')

    let created = await Ball.create({id: 1}, {allowReserved: true})
    strictEqual(String(created.id), '1')

    await driver.close()
  })

  it('Save ref', async () => {
    const driver = clayDriverMemory()
    const Ball = fromDriver(driver, 'Ball')
    const Box = fromDriver(driver, 'Box')
    Box.refs(Ball)
    Ball.refs(Box)

    const created = await Ball.create({
      box: {
        $$as: 'Box',
        name: 'box01'
      }
    })
    equal(created.box.name, 'box01')

    let one = await Ball.one(created.id)
    equal(one.box.name, 'box01')

    await driver.close()
  })

  it('Using nested ref', async () => {
    const driver = clayDriverSqlite(`${__dirname}/../tmp/nested-ref.db`)
    const Ball = fromDriver(driver, 'Ball')
    const Box = fromDriver(driver, 'Box')
    Box.refs(Ball)
    Ball.refs(Box)
    await Ball.drop()
    await Box.drop()

    const ball01 = await Ball.create({name: 'ball01'})
    await Box.create({
      name: 'box01',
      contents: {
        ball: ball01
      }
    })
    {
      const [box] = await Box.all()
      console.log(box.contents.ball)
      equal(String(box.contents.ball.id), String(ball01.id))
    }

    await driver.close()
  })

  // https://github.com/realglobe-Inc/claydb/issues/10
  it('Indirect circular ref', async () => {
    const driver = clayDriverMemory()
    const A = fromDriver(driver, 'A')
    const B = fromDriver(driver, 'B')
    const C = fromDriver(driver, 'C')

    A.refs(B)
    A.refs(C)
    B.refs(C)
    B.refs(A)
    C.refs(B)
    C.refs(A)

    const c = await C.create({})
    const b = await B.create({c})
    const a = await A.create({b})
    await C.update(c.id, {a})

    {
      const a = await A.first()
      ok(a.b)
      ok(a.b.c)
      ok(a.b.c.a)
      equal(a.b.c.a.$ref, `A#${String(a.id)}`)
    }

    await driver.close()

  })

  it('Using cluster', async () => {
    const {fork} = require('child_process')

    const forked = fork(
      require.resolve('../misc/mocks/mock-cluster')
    )

    await asleep(6000)

    forked.kill()
  })

  it('First/last method', async () => {
    const driver = clayDriverMemory()
    const A = fromDriver(driver, 'A')
    equal(await A.first(), null)
    equal(await A.last(), null)
    for (let i = 0; i < 100; i++) {
      await A.create({i})
    }
    equal((await A.first({})).i, 0)
    equal((await A.first({}, {skip: 3})).i, 3)
    equal((await A.last({})).i, 99)
    equal((await A.last({}, {skip: 3})).i, 96)

    await driver.close()
  })

  it('Nested policies', async () => {
    const {STRING, ENTITY, REF} = clayPolicy.DataTypes
    const driver = clayDriverMemory()
    const User = fromDriver(driver, 'User')
    const Org = fromDriver(driver, 'Org')

    User.setPolicy({
      username: {
        type: STRING,
        required: true,
        trim: true
      },
      org: {
        type: [ENTITY, REF],
        required: true
      }
    })

    Org.setPolicy({
      name: {
        type: STRING,
        minLength: 2,
        required: true
      }
    })

    Org.refs(User)
    User.refs(Org)

    const org01 = await Org.of({name: 'org01'})
    ok(org01)
    const user01 = await User.of({username: 'user01', org: org01})
    ok(user01)

  })

  it('Array filter of ref', async () => {
    let filename = `${__dirname}/../tmp/array-filter.db`
    const driver = clayDriverSqlite(filename)
    const A = fromDriver(driver, 'A')
    const B = fromDriver(driver, 'B')
    await A.drop()
    await asleep(100)
    await B.drop()
    await asleep(100)
    const b01 = await B.create({name: 'b01'})
    await asleep(100)
    await A.createBulk([
      {
        name: 'a01',
        b: b01
      },
      {
        name: 'a02',
        b: b01
      }
    ])
    await asleep(10)

    equal(await A.count({b: b01}), 2)
    await asleep(10)
    equal(await A.count({b: [b01]}), 2)

    await asleep(10)
    equal(await A.count([{b: b01}]), 2)

    await driver.close()
    await asleep(100)
  })
})

/* global describe, before, after, it */
