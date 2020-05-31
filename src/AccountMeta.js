const _ = require("../tools/lodash");
const request = require('../tools/request');

/**
 * Define and access to all metas of account
 *
 * __Available methods :__ *create()*, *create_with_result()*, *update()*, *update_with_result()*, *delete()*, *delete_with_result()*, *all()*, *has()*, *get()*
 */
class AccountMeta {
	/**
	 * Account Meta constructor
	 *
	 * @param {OVHStorage} context OVHObjectStorage context
	 */
	constructor(context) {
		this.context = context;
	}

	/**
	 * Create a new account meta
	 *
	 * @param {String} key Name of meta
	 * @param {String} value Value of meta
	 *
	 * @async
	 * @return {Promise<Object>}
	 */
	create(key, value) {
		return new Promise((resolve, reject) => {
			try {
				// checks
				if (_.isUndefined(key)) // noinspection ExceptionCaughtLocallyJS
					throw new Error("Key parameter is expected.");
				if (!_.isString(key)) // noinspection ExceptionCaughtLocallyJS
					throw new Error("Key parameter is not a string.");
				if (_.includes(key, "/") || _.includes(key, ' ')) // noinspection ExceptionCaughtLocallyJS
					throw new Error("Key parameter contains special chars.");

				if (_.isUndefined(value)) // noinspection ExceptionCaughtLocallyJS
					throw new Error("Value parameter is expected.");
				if (!_.isString(value)) // noinspection ExceptionCaughtLocallyJS
					throw new Error("Value parameter is not a string.");

				// header
				let header = {};
				header["X-Account-Meta-" + _.toSlug(_.toLower(key))] = value;

				// call
				request({
					method: 'POST',
					uri: this.context.endpoint.url,
					headers: Object.assign(
						{
							"X-Auth-Token": this.context.token,
							"Accept": "application/json"
						},
						header)
				}, (err, res, body) => {
					err = err || request.checkIfResponseIsError(res);
					if (err) // noinspection ExceptionCaughtLocallyJS
						throw new Error(err);

					return resolve(res.headers);
				});
			} catch (e) {
				return reject(e);
			}
		});
	}

	/**
	 * Create a new account meta and return boolean as result
	 *
	 * @param {String} key Name of meta
	 * @param {String} value Value of meta
	 *
	 * @async
	 * @return {Promise<Boolean>}
	 */
	async create_with_result(key, value) {
		try {
			await this.context.account().metas().create(key, value);
			return true;
		} catch (e) {
			return false;
		}
	}

	/**
	 * Update existing account meta
	 *
	 * @param {String} key Name of meta
	 * @param {String} value Value of meta
	 *
	 * @async
	 * @return {Promise<Object>}
	 */
	update(key, value) {
		return this.context.account().metas().create(key, value);
	}

	/**
	 * Update existing account meta and return boolean as result
	 *
	 * @param {String} key Name of meta
	 * @param {String} value Value of meta
	 *
	 * @async
	 * @return {Promise<Boolean>}
	 */
	async update_with_result(key, value) {
		try {
			await this.context.account().metas().update(key, value);
			return true;
		} catch (e) {
			return false;
		}
	}

	/**
	 * Delete account meta
	 *
	 * @param {String} key Name of meta
	 *
	 * @async
	 * @return {Promise<Object>}
	 */
	delete(key) {
		return new Promise((resolve, reject) => {
			try {
				// checks
				if (_.isUndefined(key)) // noinspection ExceptionCaughtLocallyJS
					throw new Error("Key parameter is expected.");
				if (!_.isString(key)) // noinspection ExceptionCaughtLocallyJS
					throw new Error("Key parameter is not a string.");
				if (_.includes(key, "/") || _.includes(key, ' ')) // noinspection ExceptionCaughtLocallyJS
					throw new Error("Key parameter contains special chars.");

				// headers
				let header = {};
				header["X-Remove-Account-Meta-" + _.toSlug(_.toLower(key))] = "x";

				// call
				request({
					method: 'POST',
					uri: this.context.endpoint.url,
					headers: Object.assign(
						{
							"X-Auth-Token": this.context.token,
							"Accept": "application/json"
						},
						header)
				}, (err, res, body) => {
					err = err || request.checkIfResponseIsError(res);
					if (err) // noinspection ExceptionCaughtLocallyJS
						throw new Error(err);

					return resolve(res.headers);
				});
			} catch (e) {
				return reject(e);
			}
		});
	}

	/**
	 * Delete account meta and return boolean as result
	 *
	 * @param {String} key Name of meta
	 *
	 * @async
	 * @return {Promise<Boolean>}
	 */
	async delete_with_result(key) {
		try {
			await this.context.account().metas().delete(key);
			return true;
		} catch (e) {
			return false;
		}
	}

	/**
	 * Get account meta
	 *
	 * @param {String} key Name of meta
	 *
	 * @async
	 * @return {Promise<string>}
	 */
	get(key) {
		return new Promise((resolve, reject) => {
			try {
				// checks
				if (_.isUndefined(key)) // noinspection ExceptionCaughtLocallyJS
					throw new Error("Key parameter is expected.");
				if (!_.isString(key)) // noinspection ExceptionCaughtLocallyJS
					throw new Error("Key parameter is not a string.");
				if (_.includes(key, "/") || _.includes(key, ' ')) // noinspection ExceptionCaughtLocallyJS
					throw new Error("Key parameter contains special chars.");

				// call
				request({
					method: 'HEAD',
					uri: this.context.endpoint.url,
					headers: {
						"X-Auth-Token": this.context.token,
						"Accept": "application/json"
					}
				}, (err, res, body) => {
					err = err || request.checkIfResponseIsError(res);
					if (err) // noinspection ExceptionCaughtLocallyJS
						throw new Error(err);

					let value = _.filter(res.headers, (value, header) => {
						return (_.toLower(header) === _.toLower("X-Account-Meta-" + _.toSlug(_.toLower(key))));
					})

					value = ((_.count(value) <= 0) ? null : value[0]);

					return resolve(value);
				});
			} catch (e) {
				return reject(e);
			}
		});
	}

	/**
	 * Has account meta
	 *
	 * @param {String} key Name of meta
	 *
	 * @async
	 * @return {Promise<Boolean>}
	 */
	has(key) {
		return new Promise(async (resolve, reject) => {
			try {
				resolve(!_.isNull(await this.context.account().metas().get(key)));
			} catch (e) {
				return reject(e);
			}
		});
	}

	/**
	 * Get all account metas
	 *
	 * @async
	 * @return {Promise<array>}
	 */
	all() {
		return new Promise((resolve, reject) => {
			try {
				// call
				request({
					method: 'HEAD',
					uri: this.context.endpoint.url,
					headers: {
						"X-Auth-Token": this.context.token,
						"Accept": "application/json"
					}
				}, (err, res, body) => {
					err = err || request.checkIfResponseIsError(res);
					if (err) // noinspection ExceptionCaughtLocallyJS
						throw new Error(err);

					let values = _.map(res.headers, (value, header) => {
						if (_.includes(_.toLower(header), _.toLower("X-Account-Meta-"))) {
							let a = {}
							a[_.replace(_.toLower(header), _.toLower("X-Account-Meta-"), '')] = value;
							return a;
						}
					});

					values = _.filter(values, (v) => {
						return (!_.isUndefined(v));
					})

					values = (() => {
						let as = {}
						_.map(values, (v) => {
							return _.merge(as, v)
						});
						return as;
					})();

					return resolve(values);
				});
			} catch (e) {
				return reject(e);
			}
		});
	}
}

module.exports = AccountMeta;
