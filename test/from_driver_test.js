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
const co = require('co')
const {DataTypes} = clayPolicy

describe('from-driver', function () {
  this.timeout(30000)

  before(() => co(function * () {

  }))

  after(() => co(function * () {

  }))

  it('From driver', () => co(function * () {
    let driver = clayDriverMemory()
    let resource = fromDriver(driver, 'hogehoge', {annotates: true})

    ok(!(yield resource.exists({foo: 'bar'})))

    let created = yield resource.create({foo: 'bar'})
    ok(created)
    ok(created.id)
    ok(created.$$at)

    ok(yield resource.exists({foo: 'bar'}))

    equal(yield resource.count(), 1)

    let {id} = created

    let one = yield resource.one(id)
    equal(one.foo, 'bar')
    equal(String(one.id), String(id))

    yield asleep(10)

    let updated = yield resource.update(id, {foo2: 'bar2'})
    ok(updated)
    equal(updated.foo, 'bar')
    equal(updated.foo2, 'bar2')
    ok(updated.$$at > created.$$at)

    let first = yield resource.first({foo2: 'bar2'})
    ok(first)
    ok(first.foo2, 'bar2')

    let only = yield resource.only({foo2: 'bar2'})
    ok(only)
    ok(only.foo2, 'bar2')

    yield resource.destroy(id)

    // Sub resource
    {
      let hogeResource = resource.sub('hoge')
      ok(hogeResource)
      yield hogeResource.create({fooSub: 'barSub'})

      strictEqual(resource.sub('hoge'), resource.sub('hoge'), 'Using cache')

      equal(hogeResource.name, 'hogehogehoge')
      ok(hogeResource.refs()['hogehoge'])
    }

    {
      let caught
      try {
        yield resource.update('__invalid_id__', {})
      } catch (thrown) {
        caught = thrown
      }
      ok(caught)
      equal(caught.name, 'NotFoundError')
    }
  }))

  it('From driver without annotate', () => co(function * () {
    let driver = clayDriverMemory()
    let resource = fromDriver(driver, 'hogehoge').annotates(false)

    let created = yield resource.create({foo: 'bar'})

    let {id} = created

    let one = yield resource.one(id)
    equal(one.foo, 'bar')
    equal(String(one.id), String(id))
    ok(!one.$$at)

    // One without ID
    {
      let caught
      try {
        yield resource.one()
      } catch (e) {
        caught = e
      }
      ok(caught)
      equal(caught.message, '[Clay][hogehoge] id is required')
    }

    let updated = yield resource.update(id, {foo2: 'bar2'})
    ok(updated)
    equal(updated.foo, 'bar')
    equal(updated.foo2, 'bar2')
    ok(!updated.$$at)

    yield resource.destroy(id)

    // Bulk
    {
      let [created] = yield resource.createBulk([{foo: 'bar'}])
      ok(created)
      ok(created.id)
      ok(!created.$$at)

      let {id} = created
      let one = (yield resource.oneBulk([id]))[id]
      equal(one.foo, 'bar')
      equal(String(one.id), String(created.id))

      yield asleep(10)

      let updated = (yield resource.updateBulk({[id]: {foo2: 'bar2'}}))[id]
      ok(updated)
      equal(updated.foo, 'bar')
      equal(updated.foo2, 'bar2')
      ok(!updated.$$at)

      equal((yield resource.all())[0].foo, 'bar')

      let count = yield resource.destroyBulk([created.id])
      equal(count, 1)

    }
  }))

  it('From driver bulk', () => co(function * () {
    let driver = clayDriverMemory()
    let resource = fromDriver(driver, 'hogehoge', {annotate: true})

    let [created] = yield resource.createBulk([{foo: 'bar'}])
    ok(created)
    ok(created.id)
    ok(created.$$at)

    let {id} = created
    let one = (yield resource.oneBulk([id]))[id]
    equal(one.foo, 'bar')
    equal(String(one.id), String(created.id))

    yield asleep(10)

    let updated = (yield resource.updateBulk({[id]: {foo2: 'bar2'}}))[id]
    ok(updated)
    equal(updated.foo, 'bar')
    equal(updated.foo2, 'bar2')
    ok(updated.$$at > created.$$at)

    let count = yield resource.destroyBulk([created.id])
    equal(count, 1)
  }))

  it('From driver seal', () => co(function * () {
    let driver = clayDriverMemory()
    let resource = fromDriver(driver, 'hogehoge').clone().annotates(true)
    let created = yield resource.create({foo: 'bar'})
    let {id} = created

    let {privateKey, publicKey} = generateKeys()
    yield resource.seal(privateKey, {by: 'foo!'})

    let one = yield resource.one(id)
    ok(one.$$seal)
    equal(one.$$as, 'hogehoge')
    equal(one.$$by, 'foo!')

    ok(decorate(one).verify(publicKey))
    one.hoge = 'fuge'
    ok(!decorate(one).verify(publicKey))
  }))

  it('Resolve refs', () => co(function * () {
    let driver = clayDriverMemory()
    let Org = fromDriver(driver, 'Org')
    let User = fromDriver(driver, 'User').refs(Org)
    let org01 = yield Org.create({name: 'org01'})
    let user01 = yield User.create({
      name: 'user01',
      org: {$ref: refTo(Org, org01.id)}
    })
    equal(user01.org.name, 'org01')
    let user02 = yield User.create({
      name: 'user02',
      org: org01
    })
    equal(user02.org.name, 'org01')

    equal(driver._storages.User[String(user02.id)].org.$ref, `Org#${org01.id}`)

    let Team = fromDriver(driver, 'Team').refs(User)
    let team01 = yield Team.create({
      name: 'Team01',
      users: [{$ref: refTo(User, user01.id)}]
    })
    ok(team01)
    equal(team01.users[0].name, 'user01')
  }))

  it('Policy check', () => co(function * () {
    const {STRING, DATE} = clayPolicy.DataTypes
    let driver = clayDriverMemory()
    let User = fromDriver(driver, 'User')

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
      yield User.create({
        username: 'hoge',
        rank: 'SUPER'
      })
    } catch (thrown) {
      caught = thrown
    }
    ok(caught)
    deepEqual(caught.detail.failures.rank, {
      reason: 'UNEXPECTED_VALUE_ERROR',
      actual: 'SUPER',
      expects: {oneOf: ['GOLD', 'SLIVER', 'BRONZE']}
    })

    let user02 = yield User.create({username: '  hoge  '})
    equal(user02.username, 'hoge', 'Should be trimmed')
  }))

  it('of', () => co(function * () {
    let driver = clayDriverMemory()
    let Product = fromDriver(driver, 'Product')
    let product01 = yield Product.of({code: '#1234'})
    equal(product01.code, '#1234')
    let product02 = yield Product.of({code: '#1234'})
    equal(String(product01).id, String(product02).id)
    yield Product.drop()
  }))

  it('Unique', () => co(function * () {
    let driver = clayDriverMemory()
    let Fruit = fromDriver(driver, 'Fruit')
    Fruit.policy({
      name: {
        type: DataTypes.STRING,
        unique: true
      }
    })
    yield Fruit.create({name: 'banana'})
    let caught
    try {
      yield Fruit.create({name: 'banana'})
    } catch (thrown) {
      caught = thrown
    }
    ok(caught)
    yield Fruit.drop()
  }))

  it('Default', () => co(function * () {
    let driver = clayDriverMemory()
    let Box = fromDriver(driver, 'Box')
    Box.policy({
      type: {
        type: DataTypes.STRING,
        default: 'Wood'
      }
    })
    let toyBox = yield Box.create({name: 'toy'})
    equal(toyBox.type, 'Wood')
    Box.policy({
      type: {
        type: DataTypes.STRING,
        default: 'Steal'
      }
    })
    let toyBox2 = yield Box.update(toyBox.id, {name: 'toy2'})
    equal(toyBox2.type, 'Wood')
    let toyBox3 = yield Box.create({name: 'toy3'})
    equal(toyBox3.type, 'Steal')
  }))

  it('Save/Fetch policy', () => co(function * () {
    let driver = clayDriverMemory()
    let Fruit = fromDriver(driver, 'Fruit')
    let policy = clayPolicy({
      name: {
        type: DataTypes.STRING,
        unique: true
      }
    })
    let digest = yield Fruit.savePolicy(policy)
    let fetched = yield Fruit.fetchPolicy(digest)
    ok(fetched)
    ok(fetched.hasRestrictionFor('name'))
  }))

  it('Using cache', () => co(function * () {
    let driver = clayDriverMemory()
    let Fruit = fromDriver(driver, 'Fruit')

    let orange01 = yield Fruit.create({name: 'orange'})
    let banana01 = yield Fruit.create({name: 'banana'})

    yield Fruit.one(orange01.id)
    yield Fruit.one(orange01.id)
    equal(Fruit._resourceCache.size, 1)
    yield Fruit.one(banana01.id)
    equal(Fruit._resourceCache.size, 2)

    yield Fruit.update(orange01.id, {vr: 2})
    equal(Fruit._resourceCache.size, 1)
    let orange01Again = yield Fruit.one(orange01.id)
    equal(orange01Again.vr, 2)
    yield Fruit.one(orange01.id)
    equal(Fruit._resourceCache.size, 2)

    yield Fruit.destroy(orange01.id)
    let orange01AgainAgain = yield Fruit.one(orange01.id)
    equal(orange01AgainAgain, null)
  }))

  it('Search by ref', () => co(function * () {
    let drivers = [
      clayDriverMemory(),
      clayDriverSqlite(`${__dirname}/../tmp/search-by-ref.db`)
    ]
    for (let driver of drivers) {
      let Org = fromDriver(driver, 'Org')
      let User = fromDriver(driver, 'User')
      Org.refs(User)
      User.refs(Org)

      let org01 = yield Org.create({name: 'org01'})
      let org02 = yield Org.create({name: 'org02'})
      yield User.create({name: 'user01', org: org01})
      yield User.create({name: 'user02', org: org02})

      let {meta, entities, demand} = yield User.list({filter: {org: org01}})
      equal(meta.length, 1)
      let [user] = entities
      equal(user.name, 'user01')
      equal(demand.filter.org.$ref, `Org#${org01.id}`)

      {
        let [{meta, entities, demand}] = yield User.listBulk([{filter: {org: org01}}])
        equal(meta.length, 1)
        let [user] = entities
        equal(user.name, 'user01')
        equal(demand.filter.org.$ref, `Org#${org01.id}`)
      }
    }
  }))

  it('Circular refs', () => co(function * () {
    let driver = clayDriverMemory()
    let Toy = fromDriver(driver, 'Toy')
    let House = fromDriver(driver, 'House')

    Toy.refs(House)
    House.refs(Toy)

    let house01 = yield House.create({name: 'house01'})

    let toy01 = yield Toy.create({name: 'toy01', house: house01})
    let toy02 = yield Toy.create({name: 'toy02', house: house01})

    yield House.update(house01.id, {toys: [toy01, toy02]})

    let house01Again = yield House.one(house01.id)
    equal(house01Again.toys[0].house.$ref, `House#${house01.id}`)

    let toy01Again = yield Toy.one(toy01.id)
    equal(toy01Again.house.toys[0].$ref, `Toy#${toy01.id}`)
  }))

  // https://github.com/realglobe-Inc/claydb/issues/8
  it('claydb/issues/8', () => co(function * () {
    let driver = clayDriverMemory()
    let Org = fromDriver(driver, 'Org')
    let User = fromDriver(driver, 'User')
    Org.refs(User)
    User.refs(Org)
    let realglobe = yield Org.create({name: 'realglobe'})
    let realglobeObj = Object(realglobe)
    let user = yield User.create({name: 'fuji', org: realglobeObj})
    ok(user.org.$$entity)
  }))

  it('Add invalid ref', () => co(function * () {
    let driver = clayDriverMemory()
    let Org = fromDriver(driver, 'Org')
    let User = fromDriver(driver, 'User')
    Org.refs(User)
    User.refs(Org)
    let org01 = yield Org.create({name: 'FantasticPark'})
    let user01 = yield User.create({
      name: 'Rider01',
      org: {
        '$$as': org01.$$as,
        'id': 'hogehoge'
      }
    })
    ok(user01)
  }))

  it('Convert id', () => co(function * () {
    let driver = clayDriverMemory()
    let User = fromDriver(driver, 'User')
    let user01 = yield User.create({name: 'Rider01'})

    yield User.update(user01, {name: 'Updated Rider01'})

    equal((yield User.one(user01)).name, 'Updated Rider01')

    ok(yield User.has(user01))
    yield User.destroy(user01)
    ok(!(yield User.has(user01)))
  }))

  it('Using entity bind', () => co(function * () {
    let driver = clayDriverMemory()
    let User = fromDriver(driver, 'User')
    let user01 = yield User.create({name: 'Rider01'})
    ok(user01.update)
    ok(user01.destroy)
    ok(Object.assign({}, user01).name)
    ok(!Object.assign({}, user01).update)
    ok(!Object.assign({}, user01).destroy)

    yield user01.update({version: 2})
    yield User.update(user01, {foo: 'bar'})
    yield user01.sync()
    equal(user01.foo, 'bar')
    equal(user01.version, 2)

    yield user01.destroy()

    equal(yield User.count(), 0)

    {
      let caught
      try {
        yield user01.update({foo: 'bar'})
      } catch (e) {
        caught = e
      }
      ok(caught)
    }
  }))

  it('Use strict options', () => co(function * () {
    let driver = clayDriverMemory()
    let User = fromDriver(driver, 'User')
    let user01 = yield User.create({name: 'Rider01'})
    yield User.one(user01.id, {strict: false})
    yield User.one(user01.id, {strict: true})

    yield User.one('__invalid_id__', {strict: false})
    let caught
    try {
      yield User.one('__invalid_id__', {strict: true})
    } catch (e) {
      caught = e
    }
    ok(caught)
  }))

  it('Use resource collection', () => co(function * () {
    const driver = clayDriverMemory()
    const User = fromDriver(driver, 'User')
    for (let i = 0; i < 102; i++) {
      yield User.create({
        name: `user-${i}`,
        group: i % 2 === 0 ? 'yellow' : 'green'
      })
    }
    let users = yield User.list({filter: {group: 'green'}, page: {number: 1, size: 25}})
    let counts = []
    while (users.hasNext) {
      counts.push(users.meta)
      users = yield users.next()
    }
    counts.push(users.meta)
    deepEqual(counts, [
      {offset: 0, limit: 25, length: 25, total: 51},
      {offset: 25, limit: 25, length: 25, total: 51},
      {offset: 50, limit: 25, length: 1, total: 51}
    ])

    {
      const every = []
      yield User.each((entity) => {
        every.push(entity)
      })
      equal(every.length, 102)
    }
  }))

  it('Enhance entity', () => co(function * () {
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

    let user01 = yield User.create({firstName: 'Taka', familyName: 'Okunishi'})
    equal(user01.fullName, 'Taka Okunishi')
  }))

  it('Enhance collection', () => co(function * () {
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

    yield User.create({name: 'user01'})
    yield User.create({name: 'user02'})
    yield User.create({name: 'user03'})

    let users = yield User.list({
      page: {
        size: 2,
        number: 1
      },
      sort: ['-name']
    })
    equal((yield users.nextOne()).name, 'user01')
  }))

  // https://github.com/realglobe-Inc/clay-resource/issues/51
  it('issues/51', () => co(function * () {
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
    let user = yield User.create(userData)
    ok(user)

    let liveData = {
      name: 'Universe',
      createdBy: user
    }
    let live = yield Live.create(liveData)
    ok(live)

    equal(live.createdBy.userKey, 'miyazaki')
  }))

  it('Numeric id', () => co(function * () {
    const driver = clayDriverMemory()
    const Ball = fromDriver(driver, 'Ball')

    let created = yield Ball.create({id: 1}, {allowReserved: true})
    strictEqual(String(created.id), '1')
  }))
})

/* global describe, before, after, it */
