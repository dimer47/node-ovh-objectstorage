const fetch = require('node-fetch')
const _ = require('lodash')

class OVHStorage {

  constructor (config) {
    this.config = config
  }

  static checkStatus (res) {
    if (res.ok) { // res.status >= 200 && res.status < 300
      return res
    } else {
      throw Error(res.statusText)
    }
  }

  // get token connection
  connection () {
    return new Promise((resolve, reject) => {
      let _this = this

      let payload = {
        auth: {
          passwordCredentials: {
            username: this.config.username,
            password: this.config.password
          },
          tenantId: this.config.tenantId
        }
      }

      fetch(this.config.authURL + '/tokens', {
        method: 'post',
        body: JSON.stringify(payload),
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' }
      })
        .then(OVHStorage.checkStatus)
        .then((res) => {
          return res.json()
        })
        .then((response) => {
          if (!response.error) {
            let token = response.access.token
            let serviceCatalog = _.find(response.access.serviceCatalog, { type: 'object-store' })
            let endpoint = _.find(serviceCatalog.endpoints, { region: _this.config.region })

            _this.token = token
            _this.endpoint = endpoint

            resolve({ token: token, endpoint: endpoint })
          } else {
            throw Error(response.error)
          }
        })
        .catch((err) => {
          console.error(err)
          reject(err)
        })
    })
  }

  // manage container
  container () {
    let _this = this
    return {
      // show container metadata
      info (containerName) {
        return new Promise((resolve, reject) => {
          fetch(_this.endpoint.publicURL + '/' + containerName, {
            method: 'HEAD',
            headers: {
              'X-Auth-Token': _this.token.id,
              'Accept': 'application/json'
            }
          })
            .then(OVHStorage.checkStatus)
            .then((response) => {
              if (!response.error) {
                resolve(response)
              } else {
                throw Error(response.error)
              }
            })
            .catch((err) => {
              console.error(err)
              reject(err)
            })
        })
      },
      // list all the files from the container
      list (containerName) {
        return new Promise((resolve, reject) => {
          fetch(_this.endpoint.publicURL + '/' + containerName, {
            method: 'GET',
            headers: {
              'X-Auth-Token': _this.token.id,
              'Accept': 'application/json'
            }
          })
            .then(OVHStorage.checkStatus)
            .then((res) => {
              return res.json()
            })
            .then((response) => {
              if (!response.error) {
                resolve(response)
              } else {
                throw Error(response.error)
              }
            })
            .catch((err) => {
              console.error(err)
              reject(err)
            })
        })
      }
    }
  }

  // manage object
  object () {
    let _this = this
    return {
      // show object metadata
      info (container, file) {
        return new Promise((resolve, reject) => {
          fetch(_this.endpoint.publicURL + '/' + container + '/' + file, {
            method: 'HEAD',
            headers: {
              'X-Auth-Token': _this.token.id,
              'Accept': 'application/json'
            }
          })
            .then(OVHStorage.checkStatus)
            .then((response) => {
              // return callback(res.headers);
              resolve(response.headers.raw())
            })
            .catch((err) => {
              console.error(err)
              reject(err)
            })
        })
      }
    }
  }
}

module.exports = OVHStorage
