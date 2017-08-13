# clay-resource@4.1.1

Resource accessor for ClayDB

+ Functions
  + [create(args)](#clay-resource-function-create)
  + [fromDriver(driver, nameString, options)](#clay-resource-function-from-driver)
+ [`ClayResource`](#clay-resource-class) Class
  + [new ClayResource(nameString, bounds, options)](#clay-resource-class-clay-resource-constructor)
  + [resource.one(id, options)](#clay-resource-class-clay-resource-one)
  + [resource.list(condition)](#clay-resource-class-clay-resource-list)
  + [resource.create(attributes, options)](#clay-resource-class-clay-resource-create)
  + [resource.update(id, attributes, options)](#clay-resource-class-clay-resource-update)
  + [resource.destroy(id)](#clay-resource-class-clay-resource-destroy)
  + [resource.drop()](#clay-resource-class-clay-resource-drop)
  + [resource.oneBulk(ids)](#clay-resource-class-clay-resource-oneBulk)
  + [resource.listBulk(conditionArray)](#clay-resource-class-clay-resource-listBulk)
  + [resource.createBulk(attributesArray, options)](#clay-resource-class-clay-resource-createBulk)
  + [resource.updateBulk(attributesHash, options)](#clay-resource-class-clay-resource-updateBulk)
  + [resource.destroyBulk(ids)](#clay-resource-class-clay-resource-destroyBulk)
  + [resource.cursor(condition)](#clay-resource-class-clay-resource-cursor)
  + [resource.each(handler, condition)](#clay-resource-class-clay-resource-each)
  + [resource.first(filter, options)](#clay-resource-class-clay-resource-first)
  + [resource.only(filter, options)](#clay-resource-class-clay-resource-only)
  + [resource.seal(privateKey, options)](#clay-resource-class-clay-resource-seal)
  + [resource.has(id)](#clay-resource-class-clay-resource-has)
  + [resource.exists(filter)](#clay-resource-class-clay-resource-exists)
  + [resource.count(filter)](#clay-resource-class-clay-resource-count)
  + [resource.of(attributes)](#clay-resource-class-clay-resource-of)
  + [resource.all(filter, options)](#clay-resource-class-clay-resource-all)
  + [resource.one(id, options)](#clay-resource-class-clay-resource-one)
  + [resource.list(condition)](#clay-resource-class-clay-resource-list)
  + [resource.create(attributes, options)](#clay-resource-class-clay-resource-create)
  + [resource.update(id, attributes, options)](#clay-resource-class-clay-resource-update)
  + [resource.destroy(id)](#clay-resource-class-clay-resource-destroy)
  + [resource.drop()](#clay-resource-class-clay-resource-drop)
  + [resource.oneBulk(ids)](#clay-resource-class-clay-resource-oneBulk)
  + [resource.listBulk(conditionArray)](#clay-resource-class-clay-resource-listBulk)
  + [resource.createBulk(attributesArray, options)](#clay-resource-class-clay-resource-createBulk)
  + [resource.updateBulk(attributesHash, options)](#clay-resource-class-clay-resource-updateBulk)
  + [resource.destroyBulk(ids)](#clay-resource-class-clay-resource-destroyBulk)
  + [resource.cursor(condition)](#clay-resource-class-clay-resource-cursor)
  + [resource.each(handler, condition)](#clay-resource-class-clay-resource-each)
  + [resource.first(filter, options)](#clay-resource-class-clay-resource-first)
  + [resource.only(filter, options)](#clay-resource-class-clay-resource-only)
  + [resource.seal(privateKey, options)](#clay-resource-class-clay-resource-seal)
  + [resource.has(id)](#clay-resource-class-clay-resource-has)
  + [resource.exists(filter)](#clay-resource-class-clay-resource-exists)
  + [resource.count(filter)](#clay-resource-class-clay-resource-count)
  + [resource.of(attributes)](#clay-resource-class-clay-resource-of)
  + [resource.all(filter, options)](#clay-resource-class-clay-resource-all)
  + [resource.toggleAnnotate()](#clay-resource-class-clay-resource-toggleAnnotate)
  + [resource.clone()](#clay-resource-class-clay-resource-clone)
  + [resource.addInbound(name, inbound)](#clay-resource-class-clay-resource-addInbound)
  + [resource.hasInbound(name)](#clay-resource-class-clay-resource-hasInbound)
  + [resource.removeInbound(name)](#clay-resource-class-clay-resource-removeInbound)
  + [resource.applyInbound(attributesArray, actionContext)](#clay-resource-class-clay-resource-applyInbound)
  + [resource.inboundAttributes(attributes, actionContext)](#clay-resource-class-clay-resource-inboundAttributes)
  + [resource.inboundAttributesArray(attributesArray, actionContext)](#clay-resource-class-clay-resource-inboundAttributesArray)
  + [resource.inboundAttributesHash(attributesHash, actionContext)](#clay-resource-class-clay-resource-inboundAttributesHash)
  + [resource.addOutbound(name, handler)](#clay-resource-class-clay-resource-addOutbound)
  + [resource.hasOutbound(name)](#clay-resource-class-clay-resource-hasOutbound)
  + [resource.removeOutbound(name)](#clay-resource-class-clay-resource-removeOutbound)
  + [resource.applyOutbound(entities, actionContext)](#clay-resource-class-clay-resource-applyOutbound)
  + [resource.outboundEntity(entity, actionContext)](#clay-resource-class-clay-resource-outboundEntity)
  + [resource.outboundEntityArray(entityArray, actionContext)](#clay-resource-class-clay-resource-outboundEntityArray)
  + [resource.outboundCollection(collection, actionContext)](#clay-resource-class-clay-resource-outboundCollection)
  + [resource.outboundEntityHash(entityHash, actionContext)](#clay-resource-class-clay-resource-outboundEntityHash)
  + [resource.outboundCollectionArray(collectionArray, actionContext)](#clay-resource-class-clay-resource-outboundCollectionArray)
  + [resource.getPolicy()](#clay-resource-class-clay-resource-getPolicy)
  + [resource.setPolicy(policy)](#clay-resource-class-clay-resource-setPolicy)
  + [resource.removePolicy()](#clay-resource-class-clay-resource-removePolicy)
  + [resource.fetchPolicy(digest)](#clay-resource-class-clay-resource-fetchPolicy)
  + [resource.savePolicy(policy)](#clay-resource-class-clay-resource-savePolicy)
  + [resource.addRef(resourceName, resource)](#clay-resource-class-clay-resource-addRef)
  + [resource.hasRef(resourceName)](#clay-resource-class-clay-resource-hasRef)
  + [resource.removeRef(resourceName)](#clay-resource-class-clay-resource-removeRef)
  + [resource.sub(name)](#clay-resource-class-clay-resource-sub)
  + [resource.subNames()](#clay-resource-class-clay-resource-subNames)
  + [resource.throwEntityNotFoundError(id)](#clay-resource-class-clay-resource-throwEntityNotFoundError)
  + [resource.internal(name)](#clay-resource-class-clay-resource-internal)
  + [resource.internalNames()](#clay-resource-class-clay-resource-internalNames)
  + [resource.prepareIfNeeded()](#clay-resource-class-clay-resource-prepareIfNeeded)
  + [resource.prepare()](#clay-resource-class-clay-resource-prepare)
  + [resource.addPrepareTask(name, task)](#clay-resource-class-clay-resource-addPrepareTask)
  + [resource.hasPrepareTask(name)](#clay-resource-class-clay-resource-hasPrepareTask)
  + [resource.removePrepareTask(name)](#clay-resource-class-clay-resource-removePrepareTask)
  + [resource.setNeedsPrepare(needsPrepare)](#clay-resource-class-clay-resource-setNeedsPrepare)
  + [resource.decorate(methodName, decorate)](#clay-resource-class-clay-resource-decorate)
  + [resource.caches(caches)](#clay-resource-class-clay-resource-caches)
  + [resource.storeCache(entity)](#clay-resource-class-clay-resource-storeCache)
  + [resource.gainCache(id)](#clay-resource-class-clay-resource-gainCache)
  + [resource.requestCacheClear(ids)](#clay-resource-class-clay-resource-requestCacheClear)
  + [resource.parseCondition(condition)](#clay-resource-class-clay-resource-parseCondition)
  + [resource.parseConditionArray(conditionArray)](#clay-resource-class-clay-resource-parseConditionArray)

## Functions

<a class='md-heading-link' name="clay-resource-function-create" ></a>

### create(args) -> `ClayResource`

Create a ClayResource instance

| Param | Type | Description |
| ----- | --- | -------- |
| args | * |  |

<a class='md-heading-link' name="clay-resource-function-from-driver" ></a>

### fromDriver(driver, nameString, options) -> `ClayResource`

Create clayResource class from driver

| Param | Type | Description |
| ----- | --- | -------- |
| driver | Driver | Driver to bind |
| nameString | string | Resource name string |
| options | Object | Optional settings |

**Example**:

```javascript
const { fromDriver } = require('clay-resource')
const { SqliteDriver } = require('clay-driver-sqlite')
{
  let driver = new SqliteDriver('var/test.db')
  let resource = fromDriver(driver)
}
```


<a class='md-heading-link' name="clay-resource-class"></a>

## `ClayResource` Class

Resource accessor

**Extends**:

+ `AnnotateMixed`
+ `CloneMixed`
+ `InboundMixed`
+ `OutboundMixed`
+ `PolicyMixed`
+ `RefMixed`
+ `SubMixed`
+ `ThrowMixed`
+ `InternalMixed`
+ `PrepareMixed`
+ `DecorateMixed`
+ `CacheMixed`
+ `ConditionMixed`



<a class='md-heading-link' name="clay-resource-class-clay-resource-constructor" ></a>

### new ClayResource(nameString, bounds, options)

Constructor of ClayResource class

| Param | Type | Description |
| ----- | --- | -------- |
| nameString | string | Name string |
| bounds | Object.&lt;string, function()&gt; | Method bounds |
| options | Object | Optional settings |
| options.annotates | boolean | Enable annotation |
| options.refs | Array.&lt;ClayResource&gt; | Add resource refs |


<a class='md-heading-link' name="clay-resource-class-clay-resource-one" ></a>

### resource.one(id, options) -> `Promise.<Entity>`

Get a resource

| Param | Type | Description |
| ----- | --- | -------- |
| id | ClayId | Id of the entity |
| options | Object | Optional settings |
| options.strict | boolean | If true, throws an error when not found |

**Example**:

```javascript
const Product = lump.resource('Product')
async function tryOne () {
  let product = await Product.one(1) // Find by id
  console.log(product)
}
```

<a class='md-heading-link' name="clay-resource-class-clay-resource-list" ></a>

### resource.list(condition) -> `Promise.<Collection>`

List entities from resource

| Param | Type | Description |
| ----- | --- | -------- |
| condition | ListCondition | List condition query |
| condition.filter | FilterTerm | Filter condition |
| condition.page | PagerTerm | Page condition |
| condition.page.number | number | Number of page, start with 1 |
| condition.page.size | number | Number of resources per page |
| condition.sort | SortTerm | Sort condition |

**Example**:

```javascript
const Product = lump.resource('Product')
async function tryList () {
  let products = await Product.list({
    filter: { type: 'Vehicle' },  // Filter condition
    page: { number: 1, size: 25 }, // Paginate
    sort: [ 'createdAt', '-name' ] // Sort condition
  })
  console.log(products)
}
tryList()
```

<a class='md-heading-link' name="clay-resource-class-clay-resource-create" ></a>

### resource.create(attributes, options) -> `Promise.<Entity>`

Create a new entity with resource

| Param | Type | Description |
| ----- | --- | -------- |
| attributes | Object | Resource attributes to create |
| options | Object | Optional settings |
| options.allowReserved | boolean | Arrow to set reserved attributes (like "id") |
| options.errorNamespace | string | Namespace for error fields |

**Example**:

```javascript
const Product = lump.resource('Product')
async function tryCreate () {
  let product = await Product.create({
    name: 'Super Car',
    type: 'Vehicle'
  })
  console.log(product)
}
tryCreate()
```

<a class='md-heading-link' name="clay-resource-class-clay-resource-update" ></a>

### resource.update(id, attributes, options) -> `Promise.<Entity>`

Update an existing entity in resource

| Param | Type | Description |
| ----- | --- | -------- |
| id | ClayId | Resource id |
| attributes | Object | Resource attributes to update |
| options | Object | Optional settings |
| options.errorNamespace | string | Namespace for error fields |

**Example**:

```javascript
const Product = lump.resource('Product')
async function tryUpdate () {
  let product = await Product.update(1, {
    name: 'Super Super Car'
  })
  console.log(product)
}
tryUpdate()
```

<a class='md-heading-link' name="clay-resource-class-clay-resource-destroy" ></a>

### resource.destroy(id) -> `Promise.<number>`

Delete a entity resource

| Param | Type | Description |
| ----- | --- | -------- |
| id | ClayId | Resource id |

**Example**:

```javascript
const Product = lump.resource('Product')
async function tryDestroy () {
  await Product.destroy(1)
}
tryDestroy()
```

<a class='md-heading-link' name="clay-resource-class-clay-resource-drop" ></a>

### resource.drop() -> `Promise.<boolean>`

Drop resource
**Example**:

```javascript
const Product = lump.resource('Product')
async function tryDrop () {
  await Product.drop()
}
tryDrop()
```

<a class='md-heading-link' name="clay-resource-class-clay-resource-oneBulk" ></a>

### resource.oneBulk(ids) -> `Promise.<Object.<ClayId, Entity>>`

One as bulk

| Param | Type | Description |
| ----- | --- | -------- |
| ids | Array.&lt;ClayId&gt; | Resource ids |

**Example**:

```javascript
const Product = lump.resource('Product')
async function tryOneBulk () {
  let products = await Product.oneBulk([ 1, 5, 10 ])
  console.log(products)
}
tryOneBulk()
```

<a class='md-heading-link' name="clay-resource-class-clay-resource-listBulk" ></a>

### resource.listBulk(conditionArray) -> `Promise.<Array.<Collection>>`

List with multiple conditions

| Param | Type | Description |
| ----- | --- | -------- |
| conditionArray | Array.&lt;ListCondition&gt; |  |

**Example**:

```javascript
const Product = lump.resource('Product')
async function tryListBulk () {
  let [ cars, ships ] = await Product.listBulk([
    { filter: { type: 'CAR' } },
    { filter: { type: 'SHIP' } },
  ])
  console.log(cars)
  console.log(ships)
}
tryListBulk()
```

<a class='md-heading-link' name="clay-resource-class-clay-resource-createBulk" ></a>

### resource.createBulk(attributesArray, options) -> `Promise.<Array.<Entity>>`

Create multiple resources

| Param | Type | Description |
| ----- | --- | -------- |
| attributesArray | Array.&lt;Object&gt; | List of attributes |
| options | Object | Optional settings |
| options.allowReserved | boolean | Arrow to set reserved attributes (like "id") |
| options.errorNamespace | string | Namespace for error fields |

**Example**:

```javascript
const Product = lump.resource('Product')
async function tryCreateBulk () {
  const products = await Product.createBulk([
    { name: 'Super Orange', type: 'CAR' },
    { name: 'Ultra Green', type: 'CAR' },
  ])
  console.log(products)
}
tryCreateBulk()
```

<a class='md-heading-link' name="clay-resource-class-clay-resource-updateBulk" ></a>

### resource.updateBulk(attributesHash, options) -> `Promise.<Object.<ClayId, Entity>>`

Update multiple resources

| Param | Type | Description |
| ----- | --- | -------- |
| attributesHash | Object.&lt;ClayId, Object&gt; | Hash of attributes |
| options | Object | Optional settings |
| options.errorNamespace | string | Namespace for error fields |

**Example**:

```javascript
const Product = lump.resource('Product')
async function tryUpdateBulk () {
  let products = await Product.updateBulk({
    '1': { name: 'Super Super Orange' },
    '2': { name: 'Ultra Ultra Green' },
  })
  console.log(products)
}
tryUpdateBulk()
```

<a class='md-heading-link' name="clay-resource-class-clay-resource-destroyBulk" ></a>

### resource.destroyBulk(ids) -> `Promise.<number>`

Update multiple resources

| Param | Type | Description |
| ----- | --- | -------- |
| ids | Array.&lt;ClayId&gt; | Ids to destroy |

**Example**:

```javascript
const Product = lump.resource('Product')
async function tryDestroyBulk () {
  await Product.destroyBulk([1, 2])
})
tryDestroyBulk()
```

<a class='md-heading-link' name="clay-resource-class-clay-resource-cursor" ></a>

### resource.cursor(condition) -> `Object`

Create cursor to cursor

| Param | Type | Description |
| ----- | --- | -------- |
| condition | Object | Optional settings |
| condition.filter | FilterTerm | Filter condition |
| condition.sort | SortTerm | Sort condition |

**Example**:

```javascript
const Product = lump.resource('Product')
async function tryCursor () {
  let cursor = await Product.cursor({
    filter: { type: 'CAR' }
  })
  console.log(cursor.length) // Number of entities matches the condition
  for (let fetch of cursor) {
    let car = await fetch() // Fetch the pointed entity
    console.log(car)
  }
}
tryCursor()
```

<a class='md-heading-link' name="clay-resource-class-clay-resource-each" ></a>

### resource.each(handler, condition) -> `Promise`

Iterate entities with handler

| Param | Type | Description |
| ----- | --- | -------- |
| handler | function | Entity handler |
| condition | Object | Optional settings |
| condition.filter | FilterTerm | Filter condition |
| condition.sort | SortTerm | Sort condition |

**Example**:

```javascript
const Product = lump.resource('Product')
async function tryEach () {
   async Product.each(async (product) => {
      // Do something with each entity
   }, {
      filter: {price: {$gt: 100}}
   })
}
tryEach()
```

<a class='md-heading-link' name="clay-resource-class-clay-resource-first" ></a>

### resource.first(filter, options) -> `Promise.<?Entity>`

Get the first entity matches filter

| Param | Type | Description |
| ----- | --- | -------- |
| filter | FilterTerm | Listing filter |
| options | Object | Optional settings |
| options.sort | Object | Sort conditions |

**Example**:

```javascript
const Product = lump.resource('Product')
async function tryFirst () {
  let product = Product.first({ name: 'Super Super Orange' })
  console.log(product)
}
tryFirst()
```

<a class='md-heading-link' name="clay-resource-class-clay-resource-only" ></a>

### resource.only(filter, options) -> `Promise.<?Entity>`

Almost same with `.first()`, but throws an error if multiple record hits, or no record found

| Param | Type | Description |
| ----- | --- | -------- |
| filter | FilterTerm | Listing filter |
| options | Object | Optional settings |
| options.strict | boolean | If true, throws an error when not found |

**Example**:

```javascript
const Product = lump.resource('Product')
async function tryFirst () {
  let product = Product.only({ name: 'Super Super Orange' })
  console.log(product)
}
tryFirst()
```

<a class='md-heading-link' name="clay-resource-class-clay-resource-seal" ></a>

### resource.seal(privateKey, options) -> `Promise`

Seal resources

| Param | Type | Description |
| ----- | --- | -------- |
| privateKey | string | RSA Private key |
| options | Object | Optional settings |
| options.by | string | For $$by |

**Example**:

```javascript
const Product = lump.resource('Product')
const privateKey = 'xxxxxxxxxxxxxxxxxxxxxxxxx'
async function trySeal () {
  await Product.seal(privateKey)
}
trySeal()
```

<a class='md-heading-link' name="clay-resource-class-clay-resource-has" ></a>

### resource.has(id) -> `Promise.<boolean>`

Check entity with id exists

| Param | Type | Description |
| ----- | --- | -------- |
| id | ClayId | Id of the entity |

**Example**:

```javascript
const Product = lump.resource('Product')
async function tryHas () {
  let has = await Product.has(1)
  console.log(has)
}
tryHas()
```

<a class='md-heading-link' name="clay-resource-class-clay-resource-exists" ></a>

### resource.exists(filter) -> `Promise.<boolean>`

Check data exists with filter

| Param | Type | Description |
| ----- | --- | -------- |
| filter | FilterTerm | List filter |

**Example**:

```javascript
const Product = lump.resource('Product')
async function tryExists () {
  let exists = await Product.exists({ name: 'Super Super Orange' })
  console.log(exists)
}
tryExists()
```

<a class='md-heading-link' name="clay-resource-class-clay-resource-count" ></a>

### resource.count(filter) -> `Promise.<number>`

Count data matches filter

| Param | Type | Description |
| ----- | --- | -------- |
| filter | FilterTerm | List filter |

**Example**:

```javascript
const Product = lump.resource('Product')
async function tryCount () {
  let count = await Product.count({ type: 'CAR' })
  console.log(count)
}
tryCount()
```

<a class='md-heading-link' name="clay-resource-class-clay-resource-of" ></a>

### resource.of(attributes)

Find entity with attributes and returns if found.
If not found, create and return the one.

| Param | Type | Description |
| ----- | --- | -------- |
| attributes | Object | Attributes |

**Example**:

```javascript
const Product = lump.resource('Product')
async function tryOf () {
  let values = await Product.of({ code: '#1234' })
  console.log(values)
}
tryOf()
```

<a class='md-heading-link' name="clay-resource-class-clay-resource-all" ></a>

### resource.all(filter, options) -> `Promise.<Array.<ClayEntity>>`

Get all entities inside resource which matches the filter

| Param | Type | Description |
| ----- | --- | -------- |
| filter | FilterTerm | Listing filter |
| options | Object | Optional settings |


<a class='md-heading-link' name="clay-resource-class-clay-resource-one" ></a>

### resource.one(id, options) -> `Promise.<Entity>`

Get a resource

| Param | Type | Description |
| ----- | --- | -------- |
| id | ClayId | Id of the entity |
| options | Object | Optional settings |
| options.strict | boolean | If true, throws an error when not found |

**Example**:

```javascript
const Product = lump.resource('Product')
async function tryOne () {
  let product = await Product.one(1) // Find by id
  console.log(product)
}
```

<a class='md-heading-link' name="clay-resource-class-clay-resource-list" ></a>

### resource.list(condition) -> `Promise.<Collection>`

List entities from resource

| Param | Type | Description |
| ----- | --- | -------- |
| condition | ListCondition | List condition query |
| condition.filter | FilterTerm | Filter condition |
| condition.page | PagerTerm | Page condition |
| condition.page.number | number | Number of page, start with 1 |
| condition.page.size | number | Number of resources per page |
| condition.sort | SortTerm | Sort condition |

**Example**:

```javascript
const Product = lump.resource('Product')
async function tryList () {
  let products = await Product.list({
    filter: { type: 'Vehicle' },  // Filter condition
    page: { number: 1, size: 25 }, // Paginate
    sort: [ 'createdAt', '-name' ] // Sort condition
  })
  console.log(products)
}
tryList()
```

<a class='md-heading-link' name="clay-resource-class-clay-resource-create" ></a>

### resource.create(attributes, options) -> `Promise.<Entity>`

Create a new entity with resource

| Param | Type | Description |
| ----- | --- | -------- |
| attributes | Object | Resource attributes to create |
| options | Object | Optional settings |
| options.allowReserved | boolean | Arrow to set reserved attributes (like "id") |
| options.errorNamespace | string | Namespace for error fields |

**Example**:

```javascript
const Product = lump.resource('Product')
async function tryCreate () {
  let product = await Product.create({
    name: 'Super Car',
    type: 'Vehicle'
  })
  console.log(product)
}
tryCreate()
```

<a class='md-heading-link' name="clay-resource-class-clay-resource-update" ></a>

### resource.update(id, attributes, options) -> `Promise.<Entity>`

Update an existing entity in resource

| Param | Type | Description |
| ----- | --- | -------- |
| id | ClayId | Resource id |
| attributes | Object | Resource attributes to update |
| options | Object | Optional settings |
| options.errorNamespace | string | Namespace for error fields |

**Example**:

```javascript
const Product = lump.resource('Product')
async function tryUpdate () {
  let product = await Product.update(1, {
    name: 'Super Super Car'
  })
  console.log(product)
}
tryUpdate()
```

<a class='md-heading-link' name="clay-resource-class-clay-resource-destroy" ></a>

### resource.destroy(id) -> `Promise.<number>`

Delete a entity resource

| Param | Type | Description |
| ----- | --- | -------- |
| id | ClayId | Resource id |

**Example**:

```javascript
const Product = lump.resource('Product')
async function tryDestroy () {
  await Product.destroy(1)
}
tryDestroy()
```

<a class='md-heading-link' name="clay-resource-class-clay-resource-drop" ></a>

### resource.drop() -> `Promise.<boolean>`

Drop resource
**Example**:

```javascript
const Product = lump.resource('Product')
async function tryDrop () {
  await Product.drop()
}
tryDrop()
```

<a class='md-heading-link' name="clay-resource-class-clay-resource-oneBulk" ></a>

### resource.oneBulk(ids) -> `Promise.<Object.<ClayId, Entity>>`

One as bulk

| Param | Type | Description |
| ----- | --- | -------- |
| ids | Array.&lt;ClayId&gt; | Resource ids |

**Example**:

```javascript
const Product = lump.resource('Product')
async function tryOneBulk () {
  let products = await Product.oneBulk([ 1, 5, 10 ])
  console.log(products)
}
tryOneBulk()
```

<a class='md-heading-link' name="clay-resource-class-clay-resource-listBulk" ></a>

### resource.listBulk(conditionArray) -> `Promise.<Array.<Collection>>`

List with multiple conditions

| Param | Type | Description |
| ----- | --- | -------- |
| conditionArray | Array.&lt;ListCondition&gt; |  |

**Example**:

```javascript
const Product = lump.resource('Product')
async function tryListBulk () {
  let [ cars, ships ] = await Product.listBulk([
    { filter: { type: 'CAR' } },
    { filter: { type: 'SHIP' } },
  ])
  console.log(cars)
  console.log(ships)
}
tryListBulk()
```

<a class='md-heading-link' name="clay-resource-class-clay-resource-createBulk" ></a>

### resource.createBulk(attributesArray, options) -> `Promise.<Array.<Entity>>`

Create multiple resources

| Param | Type | Description |
| ----- | --- | -------- |
| attributesArray | Array.&lt;Object&gt; | List of attributes |
| options | Object | Optional settings |
| options.allowReserved | boolean | Arrow to set reserved attributes (like "id") |
| options.errorNamespace | string | Namespace for error fields |

**Example**:

```javascript
const Product = lump.resource('Product')
async function tryCreateBulk () {
  const products = await Product.createBulk([
    { name: 'Super Orange', type: 'CAR' },
    { name: 'Ultra Green', type: 'CAR' },
  ])
  console.log(products)
}
tryCreateBulk()
```

<a class='md-heading-link' name="clay-resource-class-clay-resource-updateBulk" ></a>

### resource.updateBulk(attributesHash, options) -> `Promise.<Object.<ClayId, Entity>>`

Update multiple resources

| Param | Type | Description |
| ----- | --- | -------- |
| attributesHash | Object.&lt;ClayId, Object&gt; | Hash of attributes |
| options | Object | Optional settings |
| options.errorNamespace | string | Namespace for error fields |

**Example**:

```javascript
const Product = lump.resource('Product')
async function tryUpdateBulk () {
  let products = await Product.updateBulk({
    '1': { name: 'Super Super Orange' },
    '2': { name: 'Ultra Ultra Green' },
  })
  console.log(products)
}
tryUpdateBulk()
```

<a class='md-heading-link' name="clay-resource-class-clay-resource-destroyBulk" ></a>

### resource.destroyBulk(ids) -> `Promise.<number>`

Update multiple resources

| Param | Type | Description |
| ----- | --- | -------- |
| ids | Array.&lt;ClayId&gt; | Ids to destroy |

**Example**:

```javascript
const Product = lump.resource('Product')
async function tryDestroyBulk () {
  await Product.destroyBulk([1, 2])
})
tryDestroyBulk()
```

<a class='md-heading-link' name="clay-resource-class-clay-resource-cursor" ></a>

### resource.cursor(condition) -> `Object`

Create cursor to cursor

| Param | Type | Description |
| ----- | --- | -------- |
| condition | Object | Optional settings |
| condition.filter | FilterTerm | Filter condition |
| condition.sort | SortTerm | Sort condition |

**Example**:

```javascript
const Product = lump.resource('Product')
async function tryCursor () {
  let cursor = await Product.cursor({
    filter: { type: 'CAR' }
  })
  console.log(cursor.length) // Number of entities matches the condition
  for (let fetch of cursor) {
    let car = await fetch() // Fetch the pointed entity
    console.log(car)
  }
}
tryCursor()
```

<a class='md-heading-link' name="clay-resource-class-clay-resource-each" ></a>

### resource.each(handler, condition) -> `Promise`

Iterate entities with handler

| Param | Type | Description |
| ----- | --- | -------- |
| handler | function | Entity handler |
| condition | Object | Optional settings |
| condition.filter | FilterTerm | Filter condition |
| condition.sort | SortTerm | Sort condition |

**Example**:

```javascript
const Product = lump.resource('Product')
async function tryEach () {
   async Product.each(async (product) => {
      // Do something with each entity
   }, {
      filter: {price: {$gt: 100}}
   })
}
tryEach()
```

<a class='md-heading-link' name="clay-resource-class-clay-resource-first" ></a>

### resource.first(filter, options) -> `Promise.<?Entity>`

Get the first entity matches filter

| Param | Type | Description |
| ----- | --- | -------- |
| filter | FilterTerm | Listing filter |
| options | Object | Optional settings |
| options.sort | Object | Sort conditions |

**Example**:

```javascript
const Product = lump.resource('Product')
async function tryFirst () {
  let product = Product.first({ name: 'Super Super Orange' })
  console.log(product)
}
tryFirst()
```

<a class='md-heading-link' name="clay-resource-class-clay-resource-only" ></a>

### resource.only(filter, options) -> `Promise.<?Entity>`

Almost same with `.first()`, but throws an error if multiple record hits, or no record found

| Param | Type | Description |
| ----- | --- | -------- |
| filter | FilterTerm | Listing filter |
| options | Object | Optional settings |
| options.strict | boolean | If true, throws an error when not found |

**Example**:

```javascript
const Product = lump.resource('Product')
async function tryFirst () {
  let product = Product.only({ name: 'Super Super Orange' })
  console.log(product)
}
tryFirst()
```

<a class='md-heading-link' name="clay-resource-class-clay-resource-seal" ></a>

### resource.seal(privateKey, options) -> `Promise`

Seal resources

| Param | Type | Description |
| ----- | --- | -------- |
| privateKey | string | RSA Private key |
| options | Object | Optional settings |
| options.by | string | For $$by |

**Example**:

```javascript
const Product = lump.resource('Product')
const privateKey = 'xxxxxxxxxxxxxxxxxxxxxxxxx'
async function trySeal () {
  await Product.seal(privateKey)
}
trySeal()
```

<a class='md-heading-link' name="clay-resource-class-clay-resource-has" ></a>

### resource.has(id) -> `Promise.<boolean>`

Check entity with id exists

| Param | Type | Description |
| ----- | --- | -------- |
| id | ClayId | Id of the entity |

**Example**:

```javascript
const Product = lump.resource('Product')
async function tryHas () {
  let has = await Product.has(1)
  console.log(has)
}
tryHas()
```

<a class='md-heading-link' name="clay-resource-class-clay-resource-exists" ></a>

### resource.exists(filter) -> `Promise.<boolean>`

Check data exists with filter

| Param | Type | Description |
| ----- | --- | -------- |
| filter | FilterTerm | List filter |

**Example**:

```javascript
const Product = lump.resource('Product')
async function tryExists () {
  let exists = await Product.exists({ name: 'Super Super Orange' })
  console.log(exists)
}
tryExists()
```

<a class='md-heading-link' name="clay-resource-class-clay-resource-count" ></a>

### resource.count(filter) -> `Promise.<number>`

Count data matches filter

| Param | Type | Description |
| ----- | --- | -------- |
| filter | FilterTerm | List filter |

**Example**:

```javascript
const Product = lump.resource('Product')
async function tryCount () {
  let count = await Product.count({ type: 'CAR' })
  console.log(count)
}
tryCount()
```

<a class='md-heading-link' name="clay-resource-class-clay-resource-of" ></a>

### resource.of(attributes)

Find entity with attributes and returns if found.
If not found, create and return the one.

| Param | Type | Description |
| ----- | --- | -------- |
| attributes | Object | Attributes |

**Example**:

```javascript
const Product = lump.resource('Product')
async function tryOf () {
  let values = await Product.of({ code: '#1234' })
  console.log(values)
}
tryOf()
```

<a class='md-heading-link' name="clay-resource-class-clay-resource-all" ></a>

### resource.all(filter, options) -> `Promise.<Array.<ClayEntity>>`

Get all entities inside resource which matches the filter

| Param | Type | Description |
| ----- | --- | -------- |
| filter | FilterTerm | Listing filter |
| options | Object | Optional settings |


<a class='md-heading-link' name="clay-resource-class-clay-resource-toggleAnnotate" ></a>

### resource.toggleAnnotate()



<a class='md-heading-link' name="clay-resource-class-clay-resource-clone" ></a>

### resource.clone() -> `Object`

Clone the instance

<a class='md-heading-link' name="clay-resource-class-clay-resource-addInbound" ></a>

### resource.addInbound(name, inbound) -> `InboundMixed`

Add inbound

| Param | Type | Description |
| ----- | --- | -------- |
| name | string | Name of inbound |
| inbound | function | Inbound function |


<a class='md-heading-link' name="clay-resource-class-clay-resource-hasInbound" ></a>

### resource.hasInbound(name) -> `boolean`

Check if has inbound

| Param | Type | Description |
| ----- | --- | -------- |
| name | string | Name of inbound |


<a class='md-heading-link' name="clay-resource-class-clay-resource-removeInbound" ></a>

### resource.removeInbound(name) -> `InboundMixed`

Remove inbound

| Param | Type | Description |
| ----- | --- | -------- |
| name | string | Name of inbound |


<a class='md-heading-link' name="clay-resource-class-clay-resource-applyInbound" ></a>

### resource.applyInbound(attributesArray, actionContext) -> `Promise.<Array.<EntityAttributes>>`

Apply inbound to array of attributes

| Param | Type | Description |
| ----- | --- | -------- |
| attributesArray | Array.&lt;EntityAttributes&gt; | Array of attributes |
| actionContext | ActionContext | Context for resource action |


<a class='md-heading-link' name="clay-resource-class-clay-resource-inboundAttributes" ></a>

### resource.inboundAttributes(attributes, actionContext) -> `Promise.<EntityAttributes>`

Inbound attributes

| Param | Type | Description |
| ----- | --- | -------- |
| attributes | EntityAttributes | Attributes to inbound |
| actionContext | ActionContext | Context for resource action |


<a class='md-heading-link' name="clay-resource-class-clay-resource-inboundAttributesArray" ></a>

### resource.inboundAttributesArray(attributesArray, actionContext) -> `Promise.<Array.<EntityAttributes>>`

Inbound attributes array

| Param | Type | Description |
| ----- | --- | -------- |
| attributesArray | Array.&lt;EntityAttributes&gt; | Attributes array to inbound |
| actionContext | ActionContext | Context for resource action |


<a class='md-heading-link' name="clay-resource-class-clay-resource-inboundAttributesHash" ></a>

### resource.inboundAttributesHash(attributesHash, actionContext) -> `Promise.<AttributesHash>`

Inbound attributes hash

| Param | Type | Description |
| ----- | --- | -------- |
| attributesHash | AttributesHash |  |
| actionContext | ActionContext | Context for resource action |


<a class='md-heading-link' name="clay-resource-class-clay-resource-addOutbound" ></a>

### resource.addOutbound(name, handler) -> `OutboundMixed`

Add outbound

| Param | Type | Description |
| ----- | --- | -------- |
| name | string | Name of outbound |
| handler | function | Format handler function |


<a class='md-heading-link' name="clay-resource-class-clay-resource-hasOutbound" ></a>

### resource.hasOutbound(name) -> `boolean`

Check if has outbound

| Param | Type | Description |
| ----- | --- | -------- |
| name | string | Name of outbound |


<a class='md-heading-link' name="clay-resource-class-clay-resource-removeOutbound" ></a>

### resource.removeOutbound(name) -> `OutboundMixed`

Remove outbound

| Param | Type | Description |
| ----- | --- | -------- |
| name | string | Name of outbound |


<a class='md-heading-link' name="clay-resource-class-clay-resource-applyOutbound" ></a>

### resource.applyOutbound(entities, actionContext) -> `Promise.<Array.<Entity>>`

Apply outbound to entities

| Param | Type | Description |
| ----- | --- | -------- |
| entities | Array.&lt;Entity&gt; | Entities to outbound |
| actionContext | Object |  |


<a class='md-heading-link' name="clay-resource-class-clay-resource-outboundEntity" ></a>

### resource.outboundEntity(entity, actionContext) -> `Promise.<Entity>`

Format entity

| Param | Type | Description |
| ----- | --- | -------- |
| entity | Entity |  |
| actionContext | Object |  |


<a class='md-heading-link' name="clay-resource-class-clay-resource-outboundEntityArray" ></a>

### resource.outboundEntityArray(entityArray, actionContext) -> `Promise.<Array.<Entity>>`

Proses entity array

| Param | Type | Description |
| ----- | --- | -------- |
| entityArray | Array.&lt;Entity&gt; |  |
| actionContext | Object |  |


<a class='md-heading-link' name="clay-resource-class-clay-resource-outboundCollection" ></a>

### resource.outboundCollection(collection, actionContext) -> `Promise.<Collection>`

Format entity collection

| Param | Type | Description |
| ----- | --- | -------- |
| collection | Collection |  |
| actionContext | Object |  |


<a class='md-heading-link' name="clay-resource-class-clay-resource-outboundEntityHash" ></a>

### resource.outboundEntityHash(entityHash, actionContext) -> `Promise.<EntityHash>`

Format entity hash

| Param | Type | Description |
| ----- | --- | -------- |
| entityHash | EntityHash |  |
| actionContext | Object |  |


<a class='md-heading-link' name="clay-resource-class-clay-resource-outboundCollectionArray" ></a>

### resource.outboundCollectionArray(collectionArray, actionContext) -> `Promise.<CollectionArray>`

Format collection array

| Param | Type | Description |
| ----- | --- | -------- |
| collectionArray | CollectionArray |  |
| actionContext | Object |  |


<a class='md-heading-link' name="clay-resource-class-clay-resource-getPolicy" ></a>

### resource.getPolicy() -> `ClayPolicy`

Get the policy

<a class='md-heading-link' name="clay-resource-class-clay-resource-setPolicy" ></a>

### resource.setPolicy(policy) -> `PolicyMix`

Set policy

| Param | Type | Description |
| ----- | --- | -------- |
| policy |  |  |


<a class='md-heading-link' name="clay-resource-class-clay-resource-removePolicy" ></a>

### resource.removePolicy()

Remove policy

<a class='md-heading-link' name="clay-resource-class-clay-resource-fetchPolicy" ></a>

### resource.fetchPolicy(digest) -> `Promise.<ClayPolicy>`

Fetch policy from db

| Param | Type | Description |
| ----- | --- | -------- |
| digest | string |  |


<a class='md-heading-link' name="clay-resource-class-clay-resource-savePolicy" ></a>

### resource.savePolicy(policy) -> `Promise.<string>`

Save policy

| Param | Type | Description |
| ----- | --- | -------- |
| policy | ClayPolicy |  |


<a class='md-heading-link' name="clay-resource-class-clay-resource-addRef" ></a>

### resource.addRef(resourceName, resource)

Add resource ref

| Param | Type | Description |
| ----- | --- | -------- |
| resourceName | string |  |
| resource | ClayResource |  |


<a class='md-heading-link' name="clay-resource-class-clay-resource-hasRef" ></a>

### resource.hasRef(resourceName) -> `boolean`

has resources ref

| Param | Type | Description |
| ----- | --- | -------- |
| resourceName | string |  |


<a class='md-heading-link' name="clay-resource-class-clay-resource-removeRef" ></a>

### resource.removeRef(resourceName) -> `FormatMix`

Remove resource ref

| Param | Type | Description |
| ----- | --- | -------- |
| resourceName | string |  |


<a class='md-heading-link' name="clay-resource-class-clay-resource-sub" ></a>

### resource.sub(name) -> `ClayResource`

Get sub resource

| Param | Type | Description |
| ----- | --- | -------- |
| name | string |  |


<a class='md-heading-link' name="clay-resource-class-clay-resource-subNames" ></a>

### resource.subNames() -> `Promise.<Array.<string>>`

Get names of sub resources

<a class='md-heading-link' name="clay-resource-class-clay-resource-throwEntityNotFoundError" ></a>

### resource.throwEntityNotFoundError(id)

Throw entity not found error

| Param | Type | Description |
| ----- | --- | -------- |
| id | ClayId |  |


<a class='md-heading-link' name="clay-resource-class-clay-resource-internal" ></a>

### resource.internal(name) -> `ClayResource`

Get internal resource

| Param | Type | Description |
| ----- | --- | -------- |
| name | string |  |


<a class='md-heading-link' name="clay-resource-class-clay-resource-internalNames" ></a>

### resource.internalNames() -> `Promise.<Array.<string>>`

Get names of internal resources

<a class='md-heading-link' name="clay-resource-class-clay-resource-prepareIfNeeded" ></a>

### resource.prepareIfNeeded() -> `Promise`

Do prepare if needed

<a class='md-heading-link' name="clay-resource-class-clay-resource-prepare" ></a>

### resource.prepare() -> `Promise.<Object>`

Do preparing

<a class='md-heading-link' name="clay-resource-class-clay-resource-addPrepareTask" ></a>

### resource.addPrepareTask(name, task) -> `PrepareMixed`

Add prepare task

| Param | Type | Description |
| ----- | --- | -------- |
| name | string | Name of task |
| task | function | Task function |


<a class='md-heading-link' name="clay-resource-class-clay-resource-hasPrepareTask" ></a>

### resource.hasPrepareTask(name) -> `boolean`

Check if has task

| Param | Type | Description |
| ----- | --- | -------- |
| name | string |  |


<a class='md-heading-link' name="clay-resource-class-clay-resource-removePrepareTask" ></a>

### resource.removePrepareTask(name) -> `PrepareMixed`

Remove a task

| Param | Type | Description |
| ----- | --- | -------- |
| name | string | Name of task |


<a class='md-heading-link' name="clay-resource-class-clay-resource-setNeedsPrepare" ></a>

### resource.setNeedsPrepare(needsPrepare) -> `PrepareMixed`

Set needs prepare

| Param | Type | Description |
| ----- | --- | -------- |
| needsPrepare | boolean | Needs preparing |


<a class='md-heading-link' name="clay-resource-class-clay-resource-decorate" ></a>

### resource.decorate(methodName, decorate) -> `DecorateMixed`

Decorate a method

| Param | Type | Description |
| ----- | --- | -------- |
| methodName | string | Name of method |
| decorate | function | Decorate function |


<a class='md-heading-link' name="clay-resource-class-clay-resource-caches" ></a>

### resource.caches(caches) -> `CacheMixed`

Toggle caching

| Param | Type | Description |
| ----- | --- | -------- |
| caches | boolean | Should cache or not |


<a class='md-heading-link' name="clay-resource-class-clay-resource-storeCache" ></a>

### resource.storeCache(entity)

Store an entity into cache

| Param | Type | Description |
| ----- | --- | -------- |
| entity |  |  |


<a class='md-heading-link' name="clay-resource-class-clay-resource-gainCache" ></a>

### resource.gainCache(id)

Gain entity from cache

| Param | Type | Description |
| ----- | --- | -------- |
| id | ClayId |  |


<a class='md-heading-link' name="clay-resource-class-clay-resource-requestCacheClear" ></a>

### resource.requestCacheClear(ids)

Request cache clear

| Param | Type | Description |
| ----- | --- | -------- |
| ids | ClayId,Array.&lt;ClayId&gt; | Ids to clear |


<a class='md-heading-link' name="clay-resource-class-clay-resource-parseCondition" ></a>

### resource.parseCondition(condition) -> `ListCondition`

Parse list condition

| Param | Type | Description |
| ----- | --- | -------- |
| condition | ListCondition |  |


<a class='md-heading-link' name="clay-resource-class-clay-resource-parseConditionArray" ></a>

### resource.parseConditionArray(conditionArray) -> `Array.<ListCondition>`

Parse list condition array

| Param | Type | Description |
| ----- | --- | -------- |
| conditionArray | Array.&lt;ListCondition&gt; |  |




