# ObjectStorage OVH
__Package__ : node-ovh-objectstorage
__Description__ : Simple library to use OVH Public Cloud Object Storage.
__Usage__ : Manage objects and privaea container in OVH Openstack (Public Cloud).
__Based on__ : https://developer.openstack.org/api-ref/object-storage/?expanded=

## Install via npm
```sh
npm install node-ovh-objectstorage --save
```

## Example usage :
### Authentification
Requesting a token to make operations on container.
```javascript
var OVHStorage = require('node-ovh-objectstorage');
var config = {
  username: '******',
  password: '******',
  authURL:  'https://auth.cloud.ovh.net/v2.0',
  tenantId: '******',
  region:   'SBG1'
};

var storage = new OVHStorage(config);
storage.connection(
    function() {
      // connected
    }
    function(err){
      // connection error
    }
  );
```

### Containers
#### Create
```javascript
var OVHStorage = require('node-ovh-objectstorage');
var config = {
    ...
};

var storage = new OVHStorage(config);
storage.connection(
    function() {
      // connected
      storage.container().create('name', function() {
        // success
      },
      function(err){
        // error
      })
    }
    function(err){}
  );
```
#### Delete
```javascript
storage.container().delete('name', function(result) {
    console.log(result);
},
function(err){
    // error
}, true)
```
#### Delete (Force)
```javascript
storage.container().deleteForce('name', function(result) {
    console.log(result);
},
function(err){
    // error
}, true)
```
#### Make empty (delete all objects)
```javascript
storage.container().deleteAllObjects('name', function(result) {
    console.log(result);
},
function(err){
    // error
})
```
#### List object in container
```javascript
storage.container().list('name', function(objects) {
    console.log(objects);
},
function(err){
    // error
})
```
#### Meta informations of container
```javascript
storage.container().info('name', function(metas) {
    console.log(metas);
},
function(err){
    // error
})
```

### Objects
#### Get object
```javascript
storage.object().get('/container/file.ext', './localfolder/file.ext', function(file_content, file_meta) {
    console.log(file_content);
    console.log(file_meta);
},
function(err){
    // error
})
```
#### Get object content
```javascript
storage.object().get('/container/file.ext', null, function(file_content, file_meta) {
    console.log(file_content);
    console.log(file_meta);
},
function(err){
    // error
})
```
#### Put object
```javascript
storage.object().set('./localfolder/file.ext', '/container/file.ext', function(data) {
    console.log(data);
},
function(err){
    // error
})
```
#### Clone object
```javascript
storage.object().copy('/container/file.ext', '/container/file_duplicated.ext', function(data) {
    console.log(data);
},
function(err){
    // error
})
```
#### Delete object
```javascript
storage.object().delete('/container/file.ext', function(data) {
    console.log(data);
},
function(err){
    // error
})
```
#### Meta informations of object
```javascript
storage.object().info('/container/file.ext', function(metas) {
    console.log(metas);
},
function(err){
    // error
})
```
