# ObjectStorage OVH

![Release : 2.0 ](https://img.shields.io/github/package-json/v/dimer47/node-ovh-objectstorage?color=red&style=flat-square) ![Last update](https://img.shields.io/github/last-commit/dimer47/node-ovh-objectstorage?color=yellow&label=Last%20update&style=flat-square) ![Dependency size](https://img.shields.io/bundlephobia/minzip/node-ovh-objectstorage?color=green&label=dependency%20size&style=flat-square) ![Repo size](https://img.shields.io/github/repo-size/dimer47/node-ovh-objectstorage?style=flat-square) ![Downloads](https://img.shields.io/npm/dt/node-ovh-objectstorage?style=flat-square) ![License](https://img.shields.io/github/license/dimer47/node-ovh-objectstorage?style=flat-square)

Simple library to use OVH Public Cloud Object Storage. <br> <br>
Create and manage containers (public, private or static), add and manage objects in OVH Public Cloud (OpenStack).

__Based on__  [developer.openstack.org](https://developer.openstack.org/api-ref/object-storage/?expanded=) official
documentation.

A complete JSDoc is
available [here](https://htmlpreview.github.io/?https://raw.githubusercontent.com/dimer47/node-ovh-objectstorage/master/doc/index.html)
.
<br>

**⚠️ Warning :** This version introduces `some breakpoints`, if you want to use this version, it's recommended to
refactoring all your projects. <br>
To use the previous version (V1), go
on [#v1.0.x branch](https://github.com/dimer47/node-ovh-objectstorage/releases/tag/v1.0.2).

## 🎉 Features

- Get account details and manage metas (create, update, has, get or delete),
- Create, list, get details or delete containers,
- Check if object exist in a container,
- Define metas (create, update, has, get or delete) for container,
- List files on a container,
- Import object on container
- Download or get content of object,
- Get temporary download link object,
- Delete all object in containers,
- Program automatic delete of an object on datetime or after seconds,
- Manage metas on objects (create, update, has, get or delete).

## 📍 Install via npm

```sh
npm install node-ovh-objectstorage --save
```

## 🧮 Examples :

### Authentification

Requesting a token to make operations on container.

```javascript
var OVHStorage = require('node-ovh-objectstorage');
var config = {
  username: '******',
  password: '******',
  authURL: 'https://auth.cloud.ovh.net/v3/auth',
  tenantId: '******',
  region: 'SBG',
  // key is optional
  key: "Temporary key (optional), for generate temporary download link", 
  // options is optional
  options: {
    slugify : true, // true, by default 
    check_exists: true, // true, by default
  }
};

(async () => {
  try {
    let storage = new OVHStorage(config);
    await storage.connection();
  } catch (e) {
    // throw e
  }
})();
```

### Account

Available methods :

- **all()** _: Object of account details and list containers (Promise)_
- **details()** _: Object (Promise)_
- **containers()** _: Array of each container object (Promise)_
- **generateKey()** _: Array with key and header response object (Promise)_
- **metas()**
    - **create(** container, key, value **)** _: Header response (Promise)_
    - **create_with_result(** container, key, value **)** _: Boolean (Promise)_
    - **update(** container, key, value **)** _: Header response (Promise)_
    - **update_with_result(** container, key, value **)** _: Boolean (Promise)_
    - **delete(** container, key **)** _: Header response (Promise)_
    - **delete_with_result(** container, key **)** _: Boolean (Promise)_
    - **all(** container **)** _: Object of metas (Promise)_
    - **has(** container, key **)** _: Boolean (Promise)_
    - **get(** container, key **)** _: String or null (Promise)_

#### Get account details and list containers

```javascript
var OVHStorage = require('node-ovh-objectstorage');
var config = {
  ...
};

(async () => {
  try {
    let storage = new OVHStorage(config);
    await storage.connection();

    // account details and list containers
    await storage.account().all();

    // or only account details
    await storage.account().details();

    // or only containers list
    await storage.account().containers();
  } catch (e) {
    // throw e
  }
})();
```

#### Generate key for download file as temporary url

ℹ️️ You can define the key directly in the configuration and not generate a key with this method. The key must be in the
Hexadecimal SHA1 format.

```javascript
var OVHStorage = require('node-ovh-objectstorage');
var config = {
  ...
};

(async () => {
  try {
    let storage = new OVHStorage(config);
    await storage.connection();

    // account details and list containers
    let {key, headers} = await storage.account().generateKey();
    
    // IMPORTANT : you can save key in the configuration to avoid regenerating it and also avoid losing the temporary links already generated.
    
  } catch (e) {
    // throw e
  }
})();
```

#### Meta information of account

```javascript
var OVHStorage = require('node-ovh-objectstorage');
var config = {
  ...
};

(async () => {
  try {
    let storage = new OVHStorage(config);
    await storage.connection();

    // list all metas of container
    await storage.account().metas().all("assets");

    // create a new meta author
    await storage.account().metas().create("assets", "author", "me");

    // retrieve value of author meta
    console.log(await storage.account().metas().get("assets", "author"));

    // update value of author meta
    await storage.account().metas().update("assets", "author", 'unknown');

    // if meta author exist on container name "assets", remove it
    if (await storage.account().metas().has("assets", "author"))
      await storage.account().metas().delete("assets", "author");
  } catch (e) {
    // throw e
  }
})();
```

### Containers

Available methods :

- **create(** container, types, web_content_pages **)** _: Header response (Promise)_
- **create_with_result(** container, types, web_content_pages **)** _: Boolean_
- **list(** container **)** _: Object (Promise)_
- **exist(** container **)** _: Boolean (Promise)_
- **info(** container **)** _: Header response (Promise)_
- **delete_objects(** container **)** _: Object (Promise)_
- **delete_objects_with_result(** container **)** _: Boolean (Promise)_
- **delete(** container, force=false **)** _: Header response (Promise)_
- **delete_with_result(** container, force=false **)** _: Boolean (Promise)_
- **metas()**
    - **create(** container, key, value **)** _: Header response (Promise)_
    - **create_with_result(** container, key, value **)** _: Boolean (Promise)_
    - **update(** container, key, value **)** _: Header response (Promise)_
    - **update_with_result(** container, key, value **)** _: Boolean (Promise)_
    - **delete(** container, key **)** _: Header response (Promise)_
    - **delete_with_result(** container, key **)** _: Boolean (Promise)_
    - **all(** container **)** _: Object of metas (Promise)_
    - **has(** container, key **)** _: Boolean (Promise)_
    - **get(** container, key **)** _: String or null (Promise)_

#### Create

```javascript
var OVHStorage = require('node-ovh-objectstorage');
var config = {
  ...
};

(async () => {
  try {
    let storage = new OVHStorage(config);
    await storage.connection();

    await storage.containers().create("private-files");
    await storage.containers().create("assets", "static", {
      index: 'index.html',
      css: 'style.css',
      error: 'error.html',
    });
    // or with boolean result
    console.log(await storage.containers().create_with_result("images", "public"));
  } catch (e) {
    // throw e
  }
})();
```

#### Delete

```javascript
var OVHStorage = require('node-ovh-objectstorage');
var config = {
  ...
};

(async () => {
  try {
    let storage = new OVHStorage(config);
    await storage.connection();

    await storage.containers().delete("assets");
    // or with boolean result
    console.log(await storage.containers().delete_with_result("images"));

  } catch (e) {
    // throw e
  }
})();
```

#### Delete (container and all objects inside)

```javascript
var OVHStorage = require('node-ovh-objectstorage');
var config = {
  ...
};

(async () => {
  try {
    let storage = new OVHStorage(config);
    await storage.connection();

    await storage.containers().delete("assets", true);
    // or with boolean result
    console.log(await storage.containers().delete_with_result("images", true));

  } catch (e) {
    // throw e
  }
})();
```

#### Remove all object in container

```javascript
var OVHStorage = require('node-ovh-objectstorage');
var config = {
  ...
};

(async () => {
  try {
    let storage = new OVHStorage(config);
    await storage.connection();

    await storage.containers().delete_objects("assets");
    // or with boolean result
    console.log(await storage.containers().delete_objects_with_result("images"));

  } catch (e) {
    // throw e
  }
})();
```

#### List all object in container

```javascript
var OVHStorage = require('node-ovh-objectstorage');
var config = {
  ...
};

(async () => {
  try {
    let storage = new OVHStorage(config);
    await storage.connection();

    let objects = await storage.containers().list("assets");
    console.log(objects);
  } catch (e) {
    // throw e
  }
})();

```

#### Check if container exist

```javascript
var OVHStorage = require('node-ovh-objectstorage');
var config = {
  ...
};

(async () => {
  try {
    let storage = new OVHStorage(config);
    await storage.connection();

    if (await storage.containers().exist("assets"))
      console.log("Assets container exist !");
  } catch (e) {
    // throw e
  }
})();
```

#### Details about container

```javascript
var OVHStorage = require('node-ovh-objectstorage');
var config = {
  ...
};

(async () => {
  try {
    let storage = new OVHStorage(config);
    await storage.connection();

    let details = await storage.containers().info("assets");
    console.log(details);
  } catch (e) {
    // throw e
  }
})();
```

#### Meta information of container

```javascript
var OVHStorage = require('node-ovh-objectstorage');
var config = {
  ...
};

(async () => {
  try {
    let storage = new OVHStorage(config);
    await storage.connection();

    // list all metas of container
    await storage.containers().metas().all("assets");

    // create a new meta author
    await storage.containers().metas().create("assets", "author", "me");

    // retrieve value of author meta
    console.log(await storage.containers().metas().get("assets", "author"));

    // update value of author meta
    await storage.containers().metas().update("assets", "author", 'unknown');

    // if meta author exist on container name "assets", remove it
    if (await storage.containers().metas().has("assets", "author"))
      await storage.containers().metas().delete("assets", "author");
  } catch (e) {
    // throw e
  }
})();
```

### Objects

- **save(** file, path **)** _: Header response (Promise)_
- **save_with_result(** file, path **)** _: Header response (Promise)_
- **set(** file, path **)** _: Header response (Promise)_
- **set_with_result(** file, path **)** _: Header response (Promise)_
- **exist(** path **)** _: Boolean (Promise)_
- **info(** path **)** _: Header response (Promise)_
- **get(** path **)** _: Object with content and header response (Promise)_
- **getTempLink(** path, validityDurationInSeconds, checkContainer = true **)** _: Temporary download URL (Promise)_
- **download(** path, pathLocal **)** _: Boolean (Promise)_
- **copy(** pathOrigin, pathToPaste **)** _: Header response (Promise)_
- **copy_with_result()** _: Boolean (Promise)_
- **delete(** path, checkContainer = true **)** _: Header response (Promise)_
- **delete_with_result(** path, checkContainer = true **)** _: Boolean (Promise)_
- **deletes(** path, checkContainer = true **)** _: Header response of all deleted files (Promise)_
- **deletes_with_result(** path, checkContainer = true **)** _: Boolean (Promise)_
- **expire_at(** path, expire_date **)** _: Header response (Promise)_
- **expire_at_with_result(** path, expire_date **)** _: Boolean (Promise)_
- **expire_after(** path, delete_seconds **)** _: Header response (Promise)_
- **expire_after_with_result(** path, delete_seconds **)** _: Boolean (Promise)_
- **metas()**
    - **create(** path, key, value **)** _: Header response (Promise)_
    - **create_with_result(** path, key, value **)** _: Boolean (Promise)_
    - **update(** path, key, value **)** _: Header response (Promise)_
    - **update_with_result(** path, key, value **)** _: Boolean (Promise)_
    - **delete(** path, key **)** _: Header response (Promise)_
    - **delete_with_result(** path, key **)** _: Boolean (Promise)_
    - **all(** path **)** _: Object of metas (Promise)_
    - **has(** path, key **)** _: Boolean (Promise)_
    - **get(** path, key **)** _: String or null (Promise)_

#### Download object

```javascript
var OVHStorage = require('node-ovh-objectstorage');
var config = {
  ...
};

(async () => {
  try {
    let storage = new OVHStorage(config);
    await storage.connection();

    await storage.objects().download("/assets/IMG_1145.jpg", "./IMG_1145.jpg")
  } catch (e) {
    // throw e
  }
})();
```

#### Get object content

```javascript
(async () => {
  try {
    let storage = new OVHStorage(config);
    await storage.connection();

    let rqt = await storage.objects().get("/assets/IMG_1145.jpg");
    console.log(rqt.content);
  } catch (e) {
    // throw e
  }
})();
```

#### Get temporary download object url

```javascript
(async () => {
  try {
    let storage = new OVHStorage(config);
    await storage.connection();

    await storage.account().generateKey(); // if you have not defined a key in the configurations

    let url = await storage.objects().getTempLink("/assets/IMG_1145.jpg", 60 * 60); // expire after 1h
    console.log(url);
  } catch (e) {
    // throw e
  }
})();
```

#### Add object

```javascript
(async () => {
  try {
    let storage = new OVHStorage(config);
    await storage.connection();

    await storage.objects().save("./IMG_1145.jpg", "/assets/IMG_1145.jpg")
    // or with boolean result
    console.log(await storage.objects().save_with_result("./IMG_1145.jpg", "/assets/IMG_1145.jpg"))
  } catch (e) {
    // throw e
  }
})();
```

#### Clone object

```javascript
(async () => {
  try {
    let storage = new OVHStorage(config);
    await storage.connection();

    await storage.objects().copy("/assets/IMG_1145.jpg", "/assets/IMG_1145_2.jpg")
    // or with boolean result
    console.log(await storage.objects().copy_with_result("/assets/IMG_1145.jpg", "/assets/IMG_1145_2.jpg"))
  } catch (e) {
    // throw e
  }
})();
```

#### Delete object

```javascript
(async () => {
  try {
    let storage = new OVHStorage(config);
    await storage.connection();

    await storage.objects().delete("/assets/IMG_1145_2.jpg")
    // or with boolean result
    console.log(await storage.objects().delete_with_result("/assets/IMG_1145_2.jpg"))
  } catch (e) {
    // throw e
  }
})();
```

#### Details about object

```javascript
(async () => {
  try {
    let storage = new OVHStorage(config);
    await storage.connection();

    let details = await storage.objects().info("/assets/IMG_1145.jpg")
    console.log(details);
  } catch (e) {
    // throw e
  }
})();
```

#### Programming object expiration at datetime (need momentjs)

```javascript
(async () => {
  try {
    let storage = new OVHStorage(config);
    await storage.connection();

    await storage.objects().expire_at("/assets/IMG_1145.jpg", moment().add("7", "days"))
    // or with boolean result
    console.log(await storage.objects().expire_at_with_result("/assets/IMG_1145.jpg", moment().add("7", "days")));
  } catch (e) {
    // throw e
  }
})();
```

#### Programming object expiration after seconds

```javascript
(async () => {
  try {
    let storage = new OVHStorage(config);
    await storage.connection();

    await storage.objects().expire_after("/assets/IMG_1145.jpg", 180)
    // or with boolean result
    console.log(await storage.objects().expire_after_with_result("/assets/IMG_1145.jpg", 180));
  } catch (e) {
    // throw e
  }
})();
```

#### Meta information of container

```javascript
var OVHStorage = require('node-ovh-objectstorage');
var config = {
  ...
};

(async () => {
  try {
    let storage = new OVHStorage(config);
    await storage.connection();

    // list all metas of object
    await storage.objects().metas().all("/assets/IMG_1145.jpg");

    // create a new meta author
    await storage.objects().metas().create("/assets/IMG_1145.jpg", "author", "me");

    // retrieve value of author meta
    console.log(await storage.objects().metas().get("/assets/IMG_1145.jpg", "author"));

    // update value of author meta
    await storage.objects().metas().update("/assets/IMG_1145.jpg", "author", 'unknown');

    // if meta author exist on object, remove it
    if (await storage.objects().metas().has("/assets/IMG_1145.jpg", "author"))
      await storage.objects().metas().delete("/assets/IMG_1145.jpg", "author");
  } catch (e) {
    // throw e
  }
})();
```

## 🧾 License

[Creative Commons Attribution Share Alike 4.0 International](LICENSE)

