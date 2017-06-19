// DEFINES
var OVHStorage_DEBUG = false;

// REQUIRES
var fs        = require('fs');
var _         = require('lodash');
var request   = require('request');
var md5       = require('md5');

// DEBUG
if(OVHStorage_DEBUG){
  require('request').debug = true;
  require('request-debug')(request);
  require('request-debug')(request, function(type, data, r) {
    console.log(type, data, r);
  });
}

// CLASS
class OVHStorage {
  // TODO : Suppression des fichier des sous dossier et des sous dossiers.
  // TODO : Intégrer le system de meta object/container
  // TODO : Regarder si le fichier existe

  constructor(config) {
    this.config = config;
  }
  responseErr(res) {
    if (!res) { return 'no response'; }
    if (res.statusCode < 200 || res.statusCode >= 300) {
      return [res.statusCode, res.statusMessage].join(' ');
    }
    return null;
  }

  // get token connection
  connection(callback, failback) {
    var _this = this;

    var json = {
      auth: {
        passwordCredentials: {
          username: this.config.username,
          password: this.config.password
        },
        tenantId: this.config.tenantId
      }
    };
    request({
      method:   'POST',
      uri:      this.config.authURL + '/tokens',
      json:     json,
      headers:  { 'Accept': 'application/json' }
    }, function(err, res, body) {
      err = err || _this.responseErr(res);
      if (err) {
        return failback(err);
      }
      if (body.error) {
        return failback(body.error.message);
      }
      var token           = body.access.token;
      var serviceCatalog  = _.find(body.access.serviceCatalog, { type: 'object-store' });
      var endpoint        = _.find(serviceCatalog.endpoints, { region: _this.config.region });

      _this.token     = token;
      _this.endpoint  = endpoint;

      callback(null, token, endpoint);
    })
  }

  // manage container
  container (){
    var _this = this;
    return {
      // create container
      create : function(container, callback, failback) {
        try {
          var targetURL = _this.endpoint.publicURL + '/' + container;

          request({
            method: 'PUT',
            uri:    targetURL,
            headers: {
              "X-Auth-Token": _this.token.id,
              "Accept": "application/json"
            }
          }, function (err, res, body) {
            err = err || _this.responseErr(res);
            if (err) { return failback(err); }
            return callback(body);
          });
        } catch (e) {
          return failback(e);
        } finally {

        }
      },
      // delete container
      delete(container, callback, failback, force = false) {
        try {
          var targetURL = _this.endpoint.publicURL + '/' + container;

          request({
            method: 'DELETE',
            uri:    targetURL,
            headers: {
              "X-Auth-Token": _this.token.id,
              "Accept": "application/json"
            }
          }, function (err, res, body) {
            err = err || _this.responseErr(res);
            if (err) { return failback(err); }
            return callback(body);
          });
        } catch (e) {
          return failback(e);
        } finally {

        }
      },
      // delete all objects in container
      deleteAllObjects(container, callback, failback){
        try{
          // lister les fichiers
          _this.container().list(container, function(data_list){
            data_list = (typeof data_list != "object" ? JSON.parse(data_list) : data_list);
            var count = Object.keys(data_list).length;

            if(count <= 0){return callback(true);}
            else{
              for(var key in data_list) {
                let file = data_list[key];
                _this.object().delete("/"+container+"/"+file.name,
                  function(){
                    count--;
                    if(count <= 0){
                      return callback(true);
                    }
                  },
                  function(e){ throw new Error('Delete object error : '+ file.name + " ("+e+")"); }
                  );
              }
            }
          }, function(e){ throw new Error('List of objects error on container : ' + container + " ("+e+")"); })
          // boucle de suppression

        } catch (e) {
          return failback(e);
        } finally {

        }
      },
      // delete all objects in container and container
      deleteForce(container, callback, failback){
        try{
          // delete all files if has
          _this.container().deleteAllObjects(container, function(result){

            // delete container
            _this.container().delete(container,
              function(){
                return callback(true);
              },
              function(e){ throw new Error('Delete container error : ' + e); }
              );

          }, function(e){ throw new Error('Delete all files error : ' + e); })

        } catch (e) {
          return failback(e);
        } finally {

        }
      },
      // show container metadata
      list(container, callback, failback) {
        try {
          var targetURL = _this.endpoint.publicURL + '/' + container;

          request({
            method: 'GET',
            uri:    targetURL,
            headers: {
              "X-Auth-Token": _this.token.id,
              "Accept": "application/json"
            }
          }, function (err, res, body) {
            err = err || _this.responseErr(res);
            if (err) { return failback(err); }
            return callback(body);
          });
        } catch (e) {
          return failback(e);
        } finally {

        }
      },
      // show container metadata
      info(container, callback, failback) {
        try {
          var targetURL = _this.endpoint.publicURL + '/' + container;

          request({
            method: 'HEAD',
            uri:    targetURL,
            headers: {
              "X-Auth-Token": _this.token.id,
              "Accept": "application/json"
            }
          }, function (err, res, body) {
            err = err || _this.responseErr(res);
            if (err) { return failback(err); }
            return callback(res.headers);
          });
        } catch (e) {
          return failback(e);
        } finally {

        }
      }
    };
  }

  // manage object
  object(){
    var _this = this;
    return {
      // get file
      get(path, pathLocal = null, callback, failback) {
        try {
          var targetURL = _this.endpoint.publicURL + path;
          var writeStream = fs.createWriteStream(pathLocal);
          var data = {
            err : {},
            res : {},
            body : {}
          };
          var r = request({
            method:   'GET',
            uri:      targetURL,
            headers:  {
              "X-Auth-Token": _this.token.id,
              "Accept": "application/json"
            }
          }, function (err, res, body) { data.err = err; data.res = res; data.body = body; }).pipe(writeStream);
          writeStream.on('error', function (err) {
            return failback(err);
          });
          writeStream.on('finish', function() {
            if(typeof data.res.headers == "undefined"){
              return _this.object().get(path, pathLocal, callback, failback);
            }
            else{
              return callback(data.body, data.res.headers);
            }
          });
        } catch (e) {
          return failback(e);
        } finally {

        }
      },
      // set file
      set(file, path, callback, failback) {
        try {
          var stream = fs.createReadStream(file);
          var targetURL = _this.endpoint.publicURL + path;
          var headers = {
            "X-Auth-Token": _this.token.id,
            "Accept": "application/json"
          };

          stream.pipe(request({
            method:   'PUT',
            uri:      targetURL,
            headers:  headers
          }, function (err, res, body) {
            err = err || _this.responseErr(res);
            if (err) { return failback(err); }
            return callback(body);
          }));

        } catch (e) {
          return failback(e);
        } finally {

        }
      },
      // copy file
      copy(pathOrigin, pathToPaste, callback, failback) {
        try {
          var targetURL = _this.endpoint.publicURL + pathOrigin;

          request({
            method: 'COPY',
            uri:    targetURL,
            headers: {
              "X-Auth-Token": _this.token.id,
              "Accept": "application/json",
              "Destination" : pathToPaste
            }
          }, function (err, res, body) {
            err = err || _this.responseErr(res);
            if (err) { return failback(err); }
            return callback(res.headers);
          });
        } catch (e) {
          return failback(e);
        } finally {

        }
      },
      // delete file
      delete(path, callback, failback) {
        try {
          var targetURL = _this.endpoint.publicURL + path;

          request({
            method: 'DELETE',
            uri:    targetURL,
            headers: {
              "X-Auth-Token": _this.token.id,
              "Accept": "application/json",
            }
          }, function (err, res, body) {
            err = err || _this.responseErr(res);
            if (err) { return failback(err); }
            return callback(res.headers);
          });
        } catch (e) {
          return failback(e);
        } finally {

        }
      },
      // show object metadata
      info(path, callback, failback) {
        try {
          var targetURL = _this.endpoint.publicURL + path;
          request({
            method:   'HEAD',
            uri:      targetURL,
            headers:  {
              "X-Auth-Token": _this.token.id,
              "Accept": "application/json"
            }
          }, function (err, res, body) {
            err = err || _this.responseErr(res);
            if (err) { return failback(err); }
            return callback(res.headers);
          });
        } catch (e) {
          return failback(e);
        } finally {

        }
      }
    }
  }
}

module.exports = OVHStorage;
