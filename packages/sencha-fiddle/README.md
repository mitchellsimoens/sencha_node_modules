# sencha-fiddle

Package to manage all things Sencha Fiddle from CRUD operations to running a fiddle.

## Seperation of concerns

This package has separated logic into separate classes to handle the different operations needed.
When retreiving a fiddle or framework, there are child data that needs to be combined into a
single object nested in specific keys. Each CRUD operation has it's own class and namespaced according.

### Combiners

The purpose of the combiners is to combine data retrieved from the database and combine it into a single
object and nesting the associated child datas.

 - [`Fiddle`](https://gitlab.com/mitchellsimoens/sencha-fiddle/blob/master/combiner/Fiddle.js) combiner will combine a fiddle's file assets, mock data assets and framework together.
 - [`Framework`](https://gitlab.com/mitchellsimoens/sencha-fiddle/blob/master/combiner/Framework.js) combiner will combine a framework's assets and packages together.

### Getters

Each required data will have a getter class that will add it's database queries to a batch. When the
`Fiddle` or `Framework` class has added all the getters to the batch, that batch will then be passed
to the database connection for execution. This means the getter classes only are concerned with adding
queries to the batch for their own purpose, nothing more.

## `Fiddle` class

The `Fiddle` class is the entry point to do all CRUD operations on a fiddle and to run the fiddle. This
class will use the following getters when loading a fiddle:

 - [`mysql/fiddle/asset/get`](https://gitlab.com/mitchellsimoens/sencha-fiddle/blob/master/mysql/fiddle/asset/get.js)
 - [`mysql/fiddle/mockdata/get`](https://gitlab.com/mitchellsimoens/sencha-fiddle/blob/master/mysql/fiddle/mockdata/get.js)
 - [`mysql/fiddle/get`](https://gitlab.com/mitchellsimoens/sencha-fiddle/blob/master/mysql/fiddle/get.js)

Also when loading a fiddle, it will ask the `Framework` class to load the association framework. This will
all be added to the same batch and will take a single database transaction to load everything.

## `Framework` class

The `Framework` class is the entry poin to do all CRUD operations on a framework. This class will use the
following getters when loading a framework:

 - [`mysql/framework/asset/get`](https://gitlab.com/mitchellsimoens/sencha-fiddle/blob/master/mysql/framework/asset/get.js)
 - [`mysql/framework/package/asset/get`](https://gitlab.com/mitchellsimoens/sencha-fiddle/blob/master/mysql/framework/package/asset/get.js)
 - [`mysql/framework/package/get`](https://gitlab.com/mitchellsimoens/sencha-fiddle/blob/master/mysql/framework/package/get.js)
 - [`mysql/framework/get`](https://gitlab.com/mitchellsimoens/sencha-fiddle/blob/master/mysql/framework/get.js)
