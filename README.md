# ObjectStorage OVH
__Package__ : node-ovh-objectstorage
__Description__ : Simple library to use OVH Public Cloud Object Storage.
__Usage__ : Manage objects and privata container in OVH Openstack (Public Cloud).

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
