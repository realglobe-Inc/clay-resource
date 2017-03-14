# clay-resource@2.3.1

Resource accessor for ClayDB

+ Functions
  + [create(args)](#clay-resource-function-create)
  + [fromDriver(driver, nameString, options)](#clay-resource-function-from-driver)
+ [`ClayResource`](#clay-resource-classes) Class
  + [new ClayResource(nameString, bounds, options)](#clay-resource-classes-clay-resource-constructor)
  + [resource.one(id)](#clay-resource-classes-clay-resource-one)
  + [resource.list(condition)](#clay-resource-classes-clay-resource-list)
  + [resource.create(attributes)](#clay-resource-classes-clay-resource-create)
  + [resource.update(id, attributes)](#clay-resource-classes-clay-resource-update)
  + [resource.destroy(id)](#clay-resource-classes-clay-resource-destroy)
  + [resource.drop()](#clay-resource-classes-clay-resource-drop)
  + [resource.oneBulk(ids)](#clay-resource-classes-clay-resource-oneBulk)
  + [resource.listBulk(conditionArray)](#clay-resource-classes-clay-resource-listBulk)
  + [resource.createBulk(attributesArray)](#clay-resource-classes-clay-resource-createBulk)
  + [resource.updateBulk(attributesHash)](#clay-resource-classes-clay-resource-updateBulk)
  + [resource.destroyBulk(ids)](#clay-resource-classes-clay-resource-destroyBulk)
  + [resource.cursor(options)](#clay-resource-classes-clay-resource-cursor)
  + [resource.first(filter)](#clay-resource-classes-clay-resource-first)
  + [resource.seal(privateKey, options)](#clay-resource-classes-clay-resource-seal)
  + [resource.exists(filter)](#clay-resource-classes-clay-resource-exists)
  + [resource.count(filter)](#clay-resource-classes-clay-resource-count)

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



<a class='md-heading-link' name="clay-resource-classes"></a>

## `ClayResource` Class

Resource accessor




<a class='md-heading-link' name="clay-resource-classes-clay-resource-constructor" ></a>

### new ClayResource(nameString, bounds, options)

Constructor of ClayResource class

| Param | Type | Description |
| ----- | --- | -------- |
| nameString | string | Name string |
| bounds | Object.&lt;string, function()&gt; | Method bounds |
| options | Object | Optional settings |
| options.annotates} | boolean | Enable annotation |
| options.refs} | Array.&lt;ClayResources&gt; | Add resource refs |


<a class='md-heading-link' name="clay-resource-classes-clay-resource-one" ></a>

### resource.one(id) -> `Promise.<ClayEntity>`

Get a resource

| Param | Type | Description |
| ----- | --- | -------- |
| id | ClayId | Id of the entity |


<a class='md-heading-link' name="clay-resource-classes-clay-resource-list" ></a>

### resource.list(condition) -> `Promise.<ClayCollection>`

List entities from resource

| Param | Type | Description |
| ----- | --- | -------- |
| condition | ListCondition | List condition query |


<a class='md-heading-link' name="clay-resource-classes-clay-resource-create" ></a>

### resource.create(attributes) -> `Promise.<ClayEntity>`

Create a new entity with resource

| Param | Type | Description |
| ----- | --- | -------- |
| attributes | Object | Resource attributes to create |


<a class='md-heading-link' name="clay-resource-classes-clay-resource-update" ></a>

### resource.update(id, attributes) -> `Promise.<ClayEntity>`

Update an existing entity in resource

| Param | Type | Description |
| ----- | --- | -------- |
| id | ClayId | Resource id |
| attributes | Object | Resource attributes to update |


<a class='md-heading-link' name="clay-resource-classes-clay-resource-destroy" ></a>

### resource.destroy(id) -> `Promise.<number>`

Delete a entity resource

| Param | Type | Description |
| ----- | --- | -------- |
| id | ClayId | Resource id |


<a class='md-heading-link' name="clay-resource-classes-clay-resource-drop" ></a>

### resource.drop() -> `Promise.<boolean>`

Drop resource

<a class='md-heading-link' name="clay-resource-classes-clay-resource-oneBulk" ></a>

### resource.oneBulk(ids) -> `Promise.<Object.<ClayId, ClayEntity>>`

One as bulk

| Param | Type | Description |
| ----- | --- | -------- |
| ids | Array.&lt;ClayId&gt; | Resource ids |


<a class='md-heading-link' name="clay-resource-classes-clay-resource-listBulk" ></a>

### resource.listBulk(conditionArray) -> `Promise.<Array.<ClayCollection>>`

List with multiple conditions

| Param | Type | Description |
| ----- | --- | -------- |
| conditionArray | Array.&lt;ListCondition&gt; |  |


<a class='md-heading-link' name="clay-resource-classes-clay-resource-createBulk" ></a>

### resource.createBulk(attributesArray) -> `Promise.<Array.<ClayEntity>>`

Create multiple resources

| Param | Type | Description |
| ----- | --- | -------- |
| attributesArray | Array.&lt;Object&gt; | List of attributes |


<a class='md-heading-link' name="clay-resource-classes-clay-resource-updateBulk" ></a>

### resource.updateBulk(attributesHash) -> `Promise.<Object.<ClayId, ClayEntity>>`

Update multiple resources

| Param | Type | Description |
| ----- | --- | -------- |
| attributesHash | Object.&lt;ClayId, Object&gt; | Hash of attributes |


<a class='md-heading-link' name="clay-resource-classes-clay-resource-destroyBulk" ></a>

### resource.destroyBulk(ids) -> `Promise.<number>`

Update multiple resources

| Param | Type | Description |
| ----- | --- | -------- |
| ids | Array.&lt;ClayId&gt; | Ids to destroy |


<a class='md-heading-link' name="clay-resource-classes-clay-resource-cursor" ></a>

### resource.cursor(options) -> `Object`

Create cursor to cursor

| Param | Type | Description |
| ----- | --- | -------- |
| options | Object | Optional settings |


<a class='md-heading-link' name="clay-resource-classes-clay-resource-first" ></a>

### resource.first(filter) -> `Promise.<?ClayEntity>`

Get the first entity matches filter

| Param | Type | Description |
| ----- | --- | -------- |
| filter | ListFilter | Listing filter |


<a class='md-heading-link' name="clay-resource-classes-clay-resource-seal" ></a>

### resource.seal(privateKey, options) -> `Promise`

Seal resources

| Param | Type | Description |
| ----- | --- | -------- |
| privateKey | string | RSA Private key |
| options | Object | Optional settings |
| options.by | string | For $$by |


<a class='md-heading-link' name="clay-resource-classes-clay-resource-exists" ></a>

### resource.exists(filter) -> `Promise.<boolean>`

Check data exists

| Param | Type | Description |
| ----- | --- | -------- |
| filter | ListFilter | List filter |


<a class='md-heading-link' name="clay-resource-classes-clay-resource-count" ></a>

### resource.count(filter) -> `Promise.<number>`

Count data matches filter

| Param | Type | Description |
| ----- | --- | -------- |
| filter | ListFilter | List filter |




