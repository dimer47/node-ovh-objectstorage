const _ = require("../tools/lodash");
const request = require("../tools/request");

const AccountMeta = require("./AccountMeta");

/**
 * Display account details, list containers and manage account metas
 *
 *  __Available methods :__ *all()*, *details()*, *containers()*, *metas()*,
 */
class Account {
  /**
	 * Account constructor
	 *
	 * @param {OVHStorage} context OVHObjectStorage context
	 */
  constructor (context) {
    this.context = context;
  }

  /**
	 * Object of account details and list containers.
	 *
	 * @typedef {Object} AccountAll
	 * @property {Object} account - Indicates whether the Courage component is present.
	 * @property {Array<Object>} containers - Indicates whether the Power component is present.
	 */

  /**
	 * Show account details and list containers
	 *
	 * @async
	 * @return {Promise<AccountAll>}
	 */
  all () {
    return new Promise((resolve, reject) => {
      try {
        // call
        request({
          method: "GET",
          uri: encodeURI(this.context.endpoint.url),
          headers: {
            "X-Auth-Token": this.context.token,
            Accept: "application/json"
          }
        }, (err, res, body) => {
          err = err || request.checkIfResponseIsError(res);
          if (err) throw new Error(err);

          return resolve({
            account: res.headers,
            containers: (_.isString(body) ? (_.isJSON(body) ? JSON.parse(body) : body) : body)
          });
        });
      } catch (e) {
        return reject(e);
      }
    });
  }

  /**
	 * Show account details
	 *
	 * @async
	 * @return {Promise<Object>}
	 */
  async details () {
    const a = await this.context.account().all();
    return a.account;
  }

  /**
	 * List containers of account
	 *
	 * @async
	 * @return {Promise<Array<Object>>}
	 */
  async containers () {
    const a = await this.context.account().all();
    return a.containers;
  }

  /**
	 * Manage meta data of account
	 * Available methods : create(), update(), delete(), all(), has(), get()
	 *
	 * @return {AccountMeta}
	 */
  metas () {
    return new AccountMeta(this.context);
  }
}

module.exports = Account;
