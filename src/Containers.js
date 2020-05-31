const _ = require("../tools/lodash");
const request = require('../tools/request');

const ContainersMeta = require("./ContainersMeta");

/**
 *  Create new container, manage metas, get related information, delete, ...
 *
 *  __Available methods :__ *create()*, *create_with_result()*, *delete_objects()*, *delete_objects_with_result()*, *delete()*, *delete_with_result()*, *list()*, *exist()*, *info()*, *metas()*
 */
class Containers {
	/**
	 * Container constructor
	 *
	 * @param {OVHStorage} context OVHObjectStorage context
	 */
	constructor(context) {
		this.context = context;
	}

	/**
	 * Delete container
	 *
	 * @param {String} container Name of container
	 *
	 * @async
	 * @return {Promise<Object>}
	 *
	 * @ignore
	 * @private
	 */
	_delete(container) {
		return new Promise((resolve, reject) => {
			try {
				// check
				if (_.isUndefined(container)) // noinspection ExceptionCaughtLocallyJS
					throw new Error("Container name parameter is expected.");
				if (!_.isString(container)) // noinspection ExceptionCaughtLocallyJS
					throw new Error("Container name parameter is not a string.");
				if (_.includes(container, "/")) // noinspection ExceptionCaughtLocallyJS
					throw new Error("Container name parameter contains special chars.");

				// reformat
				container = _.toSlug(container);

				// call
				request({
					method: 'DELETE',
					uri: this.context.endpoint.url + '/' + container,
					headers: {
						"X-Auth-Token": this.context.token,
						"Accept": "application/json"
					}
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
	 * Names object of index, css and error files.
	 * **!! USE ONLY FOR STATIC CONTAINER DECLARATION !!**
	 *
	 * When object is not specified default files are :
	 *  - index : 'index.html'
	 *  - css : 'listing.css'
	 *  - error : 'error.html'
	 *
	 * @typedef {Object} OVHStorageContainerStaticWebContentPages
	 *
	 * @param {String} index This is name of index file used when url of static container is request.
	 * @param {String} css This is name of CSS file used to style index and error file.
	 * @param {String} error This is name of error page used when request status is not 200 or 20x.
	 */

	/**
	 * Create a new container
	 *
	 * @param {String} container Name of container
	 * @param {("public"|"private"|"static")} types Type of container : public, private or static
	 * @param {OVHStorageContainerStaticWebContentPages=} web_content_pages Web page parameters (index file, error file, listing cascading style sheet file) if container is on static type
	 *
	 * @async
	 * @return {Promise<Object>}
	 */
	create(container, types, web_content_pages = {}) {
		return new Promise((resolve, reject) => {
			try {
				// check
				if (_.isUndefined(container)) // noinspection ExceptionCaughtLocallyJS
					throw new Error("Container name parameter is expected.");
				if (!_.isString(container)) // noinspection ExceptionCaughtLocallyJS
					throw new Error("Container name parameter is not a string.");
				if (_.includes(container, "/")) // noinspection ExceptionCaughtLocallyJS
					throw new Error("Container name parameter contains special chars.");

				// reformat
				container = _.toSlug(container);

				let headers = {};
				if (!_.isUndefined(types)) {
					switch (types) {
						case 'public':
							headers['x-container-read'] = '.r:*,.rlistings';
							break;
						case 'private':
							break;
						case 'static':
							headers["x-container-meta-web-listings"] = "true";
							headers["x-container-read"] = ",.r:*,.rlistings";

							if (_.isUndefined(web_content_pages))
								web_content_pages = {};

							headers
								["x-container-meta-web-error"] = (!_.isUndefined(web_content_pages['error']) ? web_content_pages['error'] : "error.html");
							headers
								["x-container-meta-web-listings-css"] = (!_.isUndefined(web_content_pages['css']) ? web_content_pages['css'] : "listing.css");
							headers
								["x-container-meta-web-index"] = (!_.isUndefined(web_content_pages['index']) ? web_content_pages['index'] : "index.html");
							break;
					}
				}

				// call
				request({
					method: 'PUT',
					uri: this.context.endpoint.url + '/' + container,
					headers: Object.assign({
						"X-Auth-Token": this.context.token,
						"Accept": "application/json"
					}, headers)
				}, (err, res, body) => {
					err = err || request.checkIfResponseIsError(res);
					if (err) // noinspection ExceptionCaughtLocallyJS
						throw new Error(err);

					return resolve(res.headers);
				});
			} catch
				(e) {
				return reject(e);
			}
		});
	}

	/**
	 * Create a new container and return boolean as result
	 *
	 * @param {String} container Name of container
	 * @param {("public"|"private"|"static")} types Type of container : public, private or static
	 * @param {OVHStorageContainerStaticWebContentPages=} web_content_pages Web page parameters (index file, error file, listing cascading style sheet file) if container is on static type
	 *
	 * @async
	 * @return {Promise<Boolean>}
	 */
	async create_with_result(container, types, web_content_pages = {}) {
		try {
			await this.context.containers().create(container, types, web_content_pages);
			return true;
		} catch (e) {
			return false;
		}
	}

	/**
	 * Delete all objects in container
	 *
	 * @param {String} container Name of container
	 *
	 * @async
	 * @return {Promise<Object>}
	 */
	delete_objects(container) {
		return new Promise(async (resolve, reject) => {
			try {
				// check
				if (_.isUndefined(container)) // noinspection ExceptionCaughtLocallyJS
					throw new Error("Container name parameter is expected.");
				if (!_.isString(container)) // noinspection ExceptionCaughtLocallyJS
					throw new Error("Container name parameter is not a string.");
				if (_.includes(container, "/")) // noinspection ExceptionCaughtLocallyJS
					throw new Error("Container name parameter contains special chars.");

				// reformat
				container = _.toSlug(container);

				// get file list
				let files = await this.context.containers().list(container);

				// deletes files
				let deletes = await this.context.objects().deletes(_.map(files, (file) => {
					return "/" + container + "/" + file.name;
				}), false);

				resolve(deletes);
			} catch (e) {
				return reject(e);
			}
		});
	}

	/**
	 * Delete all objects in container and return boolean as result
	 *
	 * @param {String} container Name of container
	 *
	 * @async
	 * @return {Promise<Boolean>}
	 */
	async delete_objects_with_result(container) {
		try {
			await this.context.containers().delete_objects(container);
			return true;
		} catch (e) {
			return false;
		}
	}

	/**
	 * Delete container and all objects in container if force
	 *
	 * @param {String} container Name of container
	 * @param {Boolean=} [force=false] Boolean as true to delete object in container, default false
	 *
	 * @async
	 * @return {Promise<Object>}
	 */
	delete(container, force = false) {
		return new Promise(async (resolve, reject) => {
			try {
				if (_.isUndefined(container)) // noinspection ExceptionCaughtLocallyJS
					throw new Error("Container name parameter is expected.");
				if (!_.isString(container)) // noinspection ExceptionCaughtLocallyJS
					throw new Error("Container name parameter is not a string.");
				if (_.includes(container, "/")) // noinspection ExceptionCaughtLocallyJS
					throw new Error("Container name parameter contains special chars.");

				let files = await this.context.containers().list(container);
				let deletes = {};

				if (_.count(files) >= 1) {
					if (!force) // noinspection ExceptionCaughtLocallyJS
						throw new Error("Container has files, use force to delete container with files or delete files before.");

					deletes['files'] = await this.context.containers().delete_objects(container);
					deletes['container'] = await this._delete(container);
				} else {
					deletes = await this._delete(container);
				}

				resolve(deletes);
			} catch (e) {
				reject(e);
			}
		});
	}

	/**
	 * Delete container and all objects in container if force and return boolean as result
	 *
	 * @param {String} container Name of container
	 * @param {Boolean=} [force=false] Boolean as true to delete object in container, default false
	 *
	 * @async
	 * @return {Promise<Boolean>}
	 */
	async delete_with_result(container, force = false) {
		try {
			await this.context.containers().delete(container, force);
			return true;
		} catch (e) {
			return false;
		}
	}

	/**
	 * List of all objects in container
	 *
	 * @param {String} container Name of container
	 *
	 * @async
	 * @return {Promise<Array<Object>>}
	 */
	list(container) {
		return new Promise((resolve, reject) => {
			try {
				(async () => {
					// check
					if (_.isUndefined(container)) // noinspection ExceptionCaughtLocallyJS
						throw new Error("Container name parameter is expected.");
					if (!_.isString(container)) // noinspection ExceptionCaughtLocallyJS
						throw new Error("Container name parameter is not a string.");
					if (_.includes(container, "/")) // noinspection ExceptionCaughtLocallyJS
						throw new Error("Container name parameter contains special chars.");

					// reformat
					container = _.toSlug(container);

					// check if container exist
					if (!await this.context.containers().exist(container)) // noinspection ExceptionCaughtLocallyJS
						throw new Error("Container name spécified in parameter don't exist.");

					// call
					request({
						method: 'GET',
						uri: this.context.endpoint.url + '/' + container,
						headers: {
							"X-Auth-Token": this.context.token,
							"Accept": "application/json"
						}
					}, (err, res, body) => {
						err = err || request.checkIfResponseIsError(res);
						if (err) throw new Error(err);

						return resolve((_.isString(body) ? (_.isJSON(body) ? JSON.parse(body) : body) : body));
					});
				})();
			} catch (e) {
				return reject(e);
			}
		});
	}

	/**
	 * Check if container exist and return boolean
	 *
	 * @param {String} container Name of container
	 *
	 * @async
	 * @return {Promise<Boolean>}
	 */
	exist(container) {
		return new Promise((resolve, reject) => {
			try {
				// check
				if (_.isUndefined(container)) // noinspection ExceptionCaughtLocallyJS
					throw new Error("Container name parameter is expected.");
				if (!_.isString(container)) // noinspection ExceptionCaughtLocallyJS
					throw new Error("Container name parameter is not a string.");
				if (_.includes(container, "/")) // noinspection ExceptionCaughtLocallyJS
					throw new Error("Container name parameter contains special chars.");

				// reformat
				container = _.toSlug(container);

				// call
				request({
					method: 'GET',
					uri: this.context.endpoint.url + '/' + container,
					headers: {
						"X-Auth-Token": this.context.token,
						"Accept": "application/json"
					}
				}, (err, res, body) => {
					if (parseInt(res.statusCode) === 404) {
						return resolve(false);
					}

					err = err || request.checkIfResponseIsError(res);
					if (err) throw new Error(err);

					return resolve(true);
				});
			} catch (e) {
				return reject(e);
			}
		});
	}

	/**
	 * Get information details of container
	 *
	 * @param {String} container Name of container
	 *
	 * @async
	 * @return {Promise<Object>}
	 */
	info(container) {
		return new Promise((resolve, reject) => {
			try {
				(async () => {
					// check
					if (_.isUndefined(container)) // noinspection ExceptionCaughtLocallyJS
						throw new Error("Container name parameter is expected.");
					if (!_.isString(container)) // noinspection ExceptionCaughtLocallyJS
						throw new Error("Container name parameter is not a string.");
					if (_.includes(container, "/")) // noinspection ExceptionCaughtLocallyJS
						throw new Error("Container name parameter contains special chars.");

					// reformat
					container = _.toSlug(container);

					// check if container exist
					if (!await this.context.containers().exist(container)) // noinspection ExceptionCaughtLocallyJS
						throw new Error("Container name spécified in parameter don't exist.");

					// call
					request({
						method: 'HEAD',
						uri: this.context.endpoint.url + '/' + container,
						headers: {
							"X-Auth-Token": this.context.token,
							"Accept": "application/json"
						}
					}, (err, res, body) => {
						err = err || request.checkIfResponseIsError(res);
						if (err) // noinspection ExceptionCaughtLocallyJS
							throw new Error(err);

						return resolve(res.headers);
					});
				})();
			} catch (e) {
				return reject(e);
			}
		});
	}

	/**
	 * Manage meta data of container
	 * Available methods : create(), update(), delete(), all(), has(), get()
	 *
	 * @return {ContainersMeta}
	 */
	metas() {
		return new ContainersMeta(this.context);
	}
}


module.exports = Containers;
