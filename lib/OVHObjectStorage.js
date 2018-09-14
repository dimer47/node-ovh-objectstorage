const fetch = require('node-fetch')
const _ = require('lodash')

class OVHStorage {

  constructor (config) {
    this.config = config
  }


  static checkStatus(res) {
    if (res.ok) { // res.status >= 200 && res.status < 300
      return res.json();
    } else {
      throw Error(res.statusText);
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
}

module.exports = OVHStorage