const _ = require("../tools/lodash");
const request = require('../tools/request');

const CryptoJS = require('crypto-js');
const AccountMeta = require('./AccountMeta');

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
	constructor(context) {
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
	all() {
		return new Promise((resolve, reject) => {
			try {
				// call
				request({
					method: 'GET',
					uri: encodeURI(this.context.endpoint.url),
					headers: {
						"X-Auth-Token": this.context.token,
						"Accept": "application/json"
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
	async details() {
		let a = await this.context.account().all();
		return a['account'];
	}

	/**
	 * List containers of account
	 *
	 * @async
	 * @return {Promise<Array<Object>>}
	 */
	async containers() {
		let a = await this.context.account().all();
		return a['containers'];
	}

	/**
	 * Generate key for temporary download
	 *
	 * @return {Promise<{key: String, headers: Objects}>}
	 */
	generateKey() {
		this.context.key = CryptoJS.SHA512(Math.floor(new Date() / 1000)+'').toString(CryptoJS.enc.Hex);

		return new Promise(async (resolve, reject) => {
			try {
				// delete file
				request({
					method: 'POST',
					uri: encodeURI(this.context.endpoint.url),
					headers: {
						"X-Account-Meta-Temp-URL-Key": this.context.key,
						"X-Auth-Token": this.context.token,
						"Accept": "application/json"
					}
				}, (err, res) => {
					err = err || request.checkIfResponseIsError(res);
					if (err) // noinspection ExceptionCaughtLocallyJS
						throw new Error(err);

					return resolve({ key: this.context.key, headers: res.headers });
				});
			} catch (e) {
				return reject(e);
			}
		});
	}

	/**
	 * Manage meta data of account
	 * Available methods : create(), update(), delete(), all(), has(), get()
	 *
	 * @return {AccountMeta}
	 */
	metas() {
		return new AccountMeta(this.context);
	}
}

module.exports = Account;
