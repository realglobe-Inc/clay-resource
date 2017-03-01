# clay-resource@1.0.3

Resource accessor for ClayDB

+ Functions
  + [create(args)](#clay-resource-function-create)
  + [fromDriver(driver, nameString, options)](#clay-resource-function-from-driver)
+ [`ClayResource`](#clay-resource-classes) Class
  + [new ClayResource(nameString, bounds, options)](#clay-resource-classes-clay-resource-constructor)

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




