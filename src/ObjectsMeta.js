const _ = require("../tools/lodash");
const request = require('../tools/request');

/**
 * Define and access to all metas of objects
 *
 * __Available methods :__ *create()*, *create_with_result()*, *update()*, *update_with_result()*, *delete()*, *delete_with_result()*, *all()*, *has()*, *get()*
 */
class ObjectsMeta {
	/**
	 * Objects Meta constructor
	 *
	 * @param {OVHStorage} context OVHObjectStorage context
	 */
	constructor(context) {
		this.context = context;
	}

	/**
	 * Create a new object meta
	 *
	 * @param {String} path Path of file with container
	 * @param {String} key Name of meta
	 * @param {String} value Value of meta
	 *
	 * @async
	 * @return {Promise<Object>}
	 */
	create(path, key, value) {
		return new Promise((resolve, reject) => {
			try {
				// checks
				if (_.isUndefined(path)) // noinspection ExceptionCaughtLocallyJS
					throw new Error("File path parameter is expected.");
				if (!_.isString(path)) // noinspection ExceptionCaughtLocallyJS
					throw new Error("File path parameter is not a string.");
				if (!_.includes(path, '/')) // noinspection ExceptionCaughtLocallyJS
					throw new Error("File path parameter isn't valid : container/filename.ext.");

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
				header["X-Object-Meta-" + _.toSlug(_.toLower(key))] = value;

				// reformat path
				let file = (() => {
					let p = path.split('/');
					if (p[0] === "")
						delete p[0];

					p = _.filter(p, (r) => {
						return !_.isUndefined(r);
					});

					return p.join("/");
				})();

				// call
				request({
					method: 'POST',
					uri: this.context.endpoint.url + '/' + file,
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
	 * Create a new object meta and return boolean as result
	 *
	 * @param {String} path Path of file with container
	 * @param {String} key Name of meta
	 * @param {String} value Value of meta
	 *
	 * @async
	 * @return {Promise<Boolean>}
	 */
	async create_with_result(path, key, value) {
		try {
			await this.context.objects().metas().create(path, key, value);
			return true;
		} catch (e) {
			return false;
		}
	}

	/**
	 * Update existing object meta
	 *
	 * @param {String} path Path of file with container
	 * @param {String} key Name of meta
	 * @param {String} value Value of meta
	 *
	 * @async
	 * @return {Promise<Object>}
	 */
	update(path, key, value) {
		return this.context.objects().metas().create(path, key, value);
	}

	/**
	 * Update existing object meta and return boolean as result
	 *
	 * @param {String} path Path of file with container
	 * @param {String} key Name of meta
	 * @param {String} value Value of meta
	 *
	 * @async
	 * @return {Promise<Boolean>}
	 */
	async update_with_result(path, key, value) {
		try {
			await this.context.objects().metas().update(path, key, value);
			return true;
		} catch (e) {
			return false;
		}
	}

	/**
	 * Delete object meta
	 *
	 * @param {String} path Path of file with container
	 * @param {String} key Name of meta
	 *
	 * @async
	 * @return {Promise<Object>}
	 */
	delete(path, key) {
		return new Promise((resolve, reject) => {
			try {
				// checks
				if (_.isUndefined(path)) // noinspection ExceptionCaughtLocallyJS
					throw new Error("File path parameter is expected.");
				if (!_.isString(path)) // noinspection ExceptionCaughtLocallyJS
					throw new Error("File path parameter is not a string.");
				if (!_.includes(path, '/')) // noinspection ExceptionCaughtLocallyJS
					throw new Error("File path parameter isn't valid : container/filename.ext.");

				if (_.isUndefined(key)) // noinspection ExceptionCaughtLocallyJS
					throw new Error("Key parameter is expected.");
				if (!_.isString(key)) // noinspection ExceptionCaughtLocallyJS
					throw new Error("Key parameter is not a string.");
				if (_.includes(key, "/") || _.includes(key, ' ')) // noinspection ExceptionCaughtLocallyJS
					throw new Error("Key parameter contains special chars.");

				// headers
				let header = {};
				header["X-Remove-Object-Meta-" + _.toSlug(_.toLower(key))] = "x";

				// reformat path
				let file = (() => {
					let p = path.split('/');
					if (p[0] === "")
						delete p[0];

					p = _.filter(p, (r) => {
						return !_.isUndefined(r);
					});

					return p.join("/");
				})();

				// call
				request({
					method: 'POST',
					uri: this.context.endpoint.url + '/' + file,
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
	 * Delete object meta and return boolean as result
	 *
	 * @param {String} path Path of file with container
	 * @param {String} key Name of meta
	 *
	 * @async
	 * @return {Promise<Boolean>}
	 */
	async delete_with_result(path, key) {
		try {
			await this.context.objects().metas().delete(path, key);
			return true;
		} catch (e) {
			return false;
		}
	}

	/**
	 * Get object meta
	 *
	 * @param {String} path Path of file with container
	 * @param {String} key Name of meta
	 *
	 * @async
	 * @return {Promise<string>}
	 */
	get(path, key) {
		return new Promise((resolve, reject) => {
			try {
				// checks
				if (_.isUndefined(path)) // noinspection ExceptionCaughtLocallyJS
					throw new Error("File path parameter is expected.");
				if (!_.isString(path)) // noinspection ExceptionCaughtLocallyJS
					throw new Error("File path parameter is not a string.");
				if (!_.includes(path, '/')) // noinspection ExceptionCaughtLocallyJS
					throw new Error("File path parameter isn't valid : container/filename.ext.");

				if (_.isUndefined(key)) // noinspection ExceptionCaughtLocallyJS
					throw new Error("Key parameter is expected.");
				if (!_.isString(key)) // noinspection ExceptionCaughtLocallyJS
					throw new Error("Key parameter is not a string.");
				if (_.includes(key, "/") || _.includes(key, ' ')) // noinspection ExceptionCaughtLocallyJS
					throw new Error("Key parameter contains special chars.");

				// reformat path
				let file = (() => {
					let p = path.split('/');
					if (p[0] === "")
						delete p[0];

					p = _.filter(p, (r) => {
						return !_.isUndefined(r);
					});

					return p.join("/");
				})();

				// call
				request({
					method: 'HEAD',
					uri: this.context.endpoint.url + '/' + file,
					headers: {
						"X-Auth-Token": this.context.token,
						"Accept": "application/json"
					}
				}, (err, res, body) => {
					err = err || request.checkIfResponseIsError(res);
					if (err) // noinspection ExceptionCaughtLocallyJS
						throw new Error(err);


					let value = _.filter(res.headers, (value, header) => {
						return (_.toLower(header) === _.toLower("X-Object-Meta-" + _.toSlug(_.toLower(key))));
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
	 * Object has meta
	 *
	 * @param {String} path Path of container
	 * @param {String} key Name of meta
	 *
	 * @async
	 * @return {Promise<Boolean>}
	 */
	has(path, key) {
		return new Promise(async (resolve, reject) => {
			try {
				resolve(!_.isNull(await this.context.objects().metas().get(path, key)));
			} catch (e) {
				return reject(e);
			}
		});
	}

	/**
	 * Get all object metas
	 *
	 * @async
	 * @return {Promise<Object>}
	 */
	all(path) {
		return new Promise((resolve, reject) => {
			try {
				// checks
				if (_.isUndefined(path)) // noinspection ExceptionCaughtLocallyJS
					throw new Error("File path parameter is expected.");
				if (!_.isString(path)) // noinspection ExceptionCaughtLocallyJS
					throw new Error("File path parameter is not a string.");
				if (!_.includes(path, '/')) // noinspection ExceptionCaughtLocallyJS
					throw new Error("File path parameter isn't valid : container/filename.ext.");

				// reformat path
				let file = (() => {
					let p = path.split('/');
					if (p[0] === "")
						delete p[0];

					p = _.filter(p, (r) => {
						return !_.isUndefined(r);
					});

					return p.join("/");
				})();

				// call
				request({
					method: 'HEAD',
					uri: this.context.endpoint.url + '/' + file,
					headers: {
						"X-Auth-Token": this.context.token,
						"Accept": "application/json"
					}
				}, (err, res, body) => {
					err = err || request.checkIfResponseIsError(res);
					if (err) // noinspection ExceptionCaughtLocallyJS
						throw new Error(err);

					let values = _.map(res.headers, (value, header) => {
						if (_.includes(_.toLower(header), _.toLower("X-Object-Meta-"))) {
							let a = {}
							a[_.replace(_.toLower(header), _.toLower("X-Object-Meta-"), '')] = value;
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

module.exports = ObjectsMeta;
