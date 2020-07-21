const fs = require('fs');
const _ = require("../tools/lodash");
const request = require('../tools/request');
const moment = require('moment');

const ObjectsMeta = require('./ObjectsMeta');

/**
 * Put, edit, remove, downloads objects files
 *
 * __Available methods :__ *download(), *get(), *save(), *save_with_result(), *set()*, *set_with_result()*, *copy()*, *copy_with_result()*, *delete()*, *delete_with_result()*, *deletes()*, *deletes_with_result()*, *exist()*, *info()*, *expire_at()*, *expire_at_with_result()*, *expire_after()*, *expire_after_with_result()*, *metas()*
 */
class Objects {
	/**
	 * Object constructor
	 *
	 * @param {OVHStorage} context OVHObjectStorage context
	 */
	constructor(context) {
		this.context = context;
	}

	/**
	 * Download file
	 *
	 * @param {String} path Online path of file with container
	 * @param {String} pathLocal Local  path to download file
	 *
	 * @async
	 * @return {Promise<Boolean|Error>}
	 */
	download(path, pathLocal) {
		return new Promise(async (resolve, reject) => {
			try {
				// check
				if (_.isUndefined(path)) // noinspection ExceptionCaughtLocallyJS
					throw new Error("Path parameter is expected.");
				if (!_.isString(path)) // noinspection ExceptionCaughtLocallyJS
					throw new Error("Path parameter is not a string.");
				if (!_.includes(path, '/')) // noinspection ExceptionCaughtLocallyJS
					throw new Error("Path parameter isn't valid : container/filename.ext.");

				if (_.isUndefined(pathLocal)) // noinspection ExceptionCaughtLocallyJS
					throw new Error("Local path parameter is expected.");
				if (!_.isString(pathLocal)) // noinspection ExceptionCaughtLocallyJS
					throw new Error("Local path parameter is not a string.");

				// check if file exist
				if (!(await this.context.objects().exist(path))) // noinspection ExceptionCaughtLocallyJS
					throw new Error("File path does not seem to exist.");

				let writeStream = fs.createWriteStream(pathLocal);

				let file = (() => {
					let p = path.split('/');
					if (p[0] === "")
						delete p[0];

					p = _.filter(p, (r) => {
						return !_.isUndefined(r);
					});

					return p.join("/");
				})();

				request({
					method: 'GET',
					uri: this.context.endpoint.url + "/" + file,
					headers: {
						"X-Auth-Token": this.context.token,
						"Accept": "application/json"
					}
				}, (err, res, body) => {
					err = err || request.checkIfResponseIsError(res);
					if (err) // noinspection ExceptionCaughtLocallyJS
						throw new Error(err);
				}).pipe(writeStream);
				writeStream.on('error', (e) => {
					throw e;
				});
				writeStream.on('finish', () => {
					return resolve(true);
				});
			} catch (e) {
				fs.unlink(pathLocal);
				return reject(e);
			}
		});
	}

	/**
	 * Get file
	 *
	 * @param {String} path Path of file with container
	 *
	 * @async
	 * @return {Promise<{content: *, headers: Objects}>}
	 */
	get(path) {
		return new Promise(async (resolve, reject) => {
			try {
				// check
				if (_.isUndefined(path)) // noinspection ExceptionCaughtLocallyJS
					throw new Error("Path parameter is expected.");
				if (!_.isString(path)) // noinspection ExceptionCaughtLocallyJS
					throw new Error("Path parameter is not a string.");
				if (!_.includes(path, '/')) // noinspection ExceptionCaughtLocallyJS
					throw new Error("Path parameter isn't valid : container/filename.ext.");

				// check if file exist
				if (!(await this.context.objects().exist(path))) // noinspection ExceptionCaughtLocallyJS
					throw new Error("File path does not seem to exist.");

				let file = (() => {
					let p = path.split('/');
					if (p[0] === "")
						delete p[0];

					p = _.filter(p, (r) => {
						return !_.isUndefined(r);
					});

					return p.join("/");
				})();

				request({
					method: 'GET',
					uri: this.context.endpoint.url + "/" + file,
					headers: {
						"X-Auth-Token": this.context.token,
						"Accept": "application/json"
					},
                                        encoding: null
				}, (err, res, body) => {
					err = err || request.checkIfResponseIsError(res);
					if (err) // noinspection ExceptionCaughtLocallyJS
						throw new Error(err);

					return resolve({
						'content': body,
						'headers': res.headers
					});
				})
			} catch (e) {
				return reject(e);
			}
		});
	}

	/**
	 * @deprecated Use saveFile(file, path)
	 * Save file
	 *
	 * @param {String} file Local file path to save
	 * @param {String} path Path where to store the file
	 *
	 * @async
	 * @return {Promise<Object>}
	 */
	save(file, path) {
		return this.saveFile(file, path);
	}
	
	/**
	 * Save file data
	 *
	 * @param {Buffer|Uint8Array|Blob|string|Readable} file data to save
	 * @param {String} path Path where to store the file
	 *
	 * @async
	 * @return {Promise<Object>}
	 */
	saveData(data, path) {
		return new Promise(async (resolve, reject) => {
			try {
				// check
				if (_.isUndefined(data)) // noinspection ExceptionCaughtLocallyJS
					throw new Error("Local file data parameter is expected.");

				if (_.isUndefined(path)) // noinspection ExceptionCaughtLocallyJS
					throw new Error("Path parameter is expected.");
				if (!_.isString(path)) // noinspection ExceptionCaughtLocallyJS
					throw new Error("Path parameter is not a string.");
				if (!_.includes(path, '/')) // noinspection ExceptionCaughtLocallyJS
					throw new Error("Path parameter isn't valid : container/filename.ext.");

				// check if container exist
				if (!(await this.context.containers().exist((() => {
					let p = path.split('/');
					if (p[0] === "")
						delete p[0];

					p = _.filter(p, (r) => {
						return !_.isUndefined(r);
					});

					if (_.count(p) <= 0)
						return "";

					return p[0];
				})()))) // noinspection ExceptionCaughtLocallyJS
					throw new Error("Container does not seem to exist.");

				request({
					method: 'PUT',
					uri: this.context.endpoint.url + path,
					headers: {
						"X-Auth-Token": this.context.token,
						"Accept": "application/json"
					},
					body: data
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
	 * Save file
	 *
	 * @param {String} file Local file path to save
	 * @param {String} path Path where to store the file
	 *
	 * @async
	 * @return {Promise<Object>}
	 */
	saveFile(file, path) {
		return new Promise(async (resolve, reject) => {
			try {
				// check
				if (_.isUndefined(file)) // noinspection ExceptionCaughtLocallyJS
					throw new Error("Local file path parameter is expected.");
				if (!_.isString(file)) // noinspection ExceptionCaughtLocallyJS
					throw new Error("Local file path parameter is not a string.");
				if (!fs.existsSync(file)) // noinspection ExceptionCaughtLocallyJS
					throw new Error("Local file does not seem to exist.");

				if (_.isUndefined(path)) // noinspection ExceptionCaughtLocallyJS
					throw new Error("Path parameter is expected.");
				if (!_.isString(path)) // noinspection ExceptionCaughtLocallyJS
					throw new Error("Path parameter is not a string.");
				if (!_.includes(path, '/')) // noinspection ExceptionCaughtLocallyJS
					throw new Error("Path parameter isn't valid : container/filename.ext.");

				// check if container exist
				if (!(await this.context.containers().exist((() => {
					let p = path.split('/');
					if (p[0] === "")
						delete p[0];

					p = _.filter(p, (r) => {
						return !_.isUndefined(r);
					});

					if (_.count(p) <= 0)
						return "";

					return p[0];
				})()))) // noinspection ExceptionCaughtLocallyJS
					throw new Error("Container does not seem to exist.");

				let stream = fs.createReadStream(file);
				stream.pipe(request({
					method: 'PUT',
					uri: this.context.endpoint.url + path,
					headers: {
						"X-Auth-Token": this.context.token,
						"Accept": "application/json"
					}
				}, (err, res, body) => {
					err = err || request.checkIfResponseIsError(res);
					if (err) // noinspection ExceptionCaughtLocallyJS
						throw new Error(err);

					stream.close();
					return resolve(res.headers);
				}));
			} catch (e) {
				return reject(e);
			}
		});
	}

	/**
	 * Save file and return boolean as result
	 *
	 * @param {String} file Local file path to save
	 * @param {String} path Path where to store the file
	 *
	 * @async
	 * @return {Promise<Object>}
	 */
	async save_with_result(file, path) {
		try {
			await this.context.objects().set(file, path);
			return true;
		} catch (e) {
			return false;
		}
	}

	/**
	 * Set file
	 * Method deprecated prefer save() method
	 * @deprecated
	 *
	 * @param {String} file Local file path to save
	 * @param {String} path Path where to store the file
	 *
	 * @async
	 * @return {Promise<Object>}
	 */
	async set(file, path) {
		await this.context.objects().save(file, path);
	}

	/**
	 * Set file and return boolean as result
	 * Method deprecated prefer save_with_result() method
	 * @deprecated
	 *
	 * @param {String} file Local file path to save
	 * @param {String} path Path where to store the file
	 *
	 * @async
	 * @return {Promise<Object>}
	 */
	async set_with_result(file, path) {
		try {
			await this.context.objects().set(file, path);
			return true;
		} catch (e) {
			return false;
		}
	}

	/**
	 * Copy online file from another destination on account
	 *
	 * @param {String} pathOrigin Source file path to copy
	 * @param {String} pathToPaste Destination file path to paste
	 *
	 * @async
	 * @return {Promise<Object>}
	 */
	copy(pathOrigin, pathToPaste) {
		return new Promise(async (resolve, reject) => {
			try {
				if (_.isUndefined(pathOrigin)) // noinspection ExceptionCaughtLocallyJS
					throw new Error("Original file path parameter is expected.");
				if (!_.isString(pathOrigin)) // noinspection ExceptionCaughtLocallyJS
					throw new Error("Original file path parameter is not a string.");
				if (!_.includes(pathOrigin, '/')) // noinspection ExceptionCaughtLocallyJS
					throw new Error("Original file path parameter isn't valid : container/filename.ext.");

				if (_.isUndefined(pathToPaste)) // noinspection ExceptionCaughtLocallyJS
					throw new Error("Copy file path parameter is expected.");
				if (!_.isString(pathToPaste)) // noinspection ExceptionCaughtLocallyJS
					throw new Error("Copy file path parameter is not a string.");
				if (!_.includes(pathToPaste, '/')) // noinspection ExceptionCaughtLocallyJS
					throw new Error("Copy file path parameter isn't valid : container/filename.ext.");

				// check if file exist
				if (!(await this.context.objects().exist(pathOrigin))) // noinspection ExceptionCaughtLocallyJS
					throw new Error("Original file path path does not seem to exist.");
				if (await this.context.objects().exist(pathToPaste)) // noinspection ExceptionCaughtLocallyJS
					throw new Error("A file with destination path already exist.");

				let pathOriginFile = (() => {
					let p = pathOrigin.split('/');
					if (p[0] === "")
						delete p[0];

					p = _.filter(p, (r) => {
						return !_.isUndefined(r);
					});

					return p.join("/");
				})();
				let pathToPasteFile = (() => {
					let p = pathToPaste.split('/');
					if (p[0] === "")
						delete p[0];

					p = _.filter(p, (r) => {
						return !_.isUndefined(r);
					});

					return p.join("/");
				})();

				request({
					method: 'COPY',
					uri: this.context.endpoint.url + '/' + pathOriginFile,
					headers: {
						"X-Auth-Token": this.context.token,
						"Accept": "application/json",
						"Destination": '/' + pathToPasteFile
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
	 * Copy online file from another destination on account and return boolean as result
	 *
	 * @param {String} pathOrigin Source file path to copy
	 * @param {String} pathToPaste Destination file path to paste
	 *
	 * @async
	 * @return {Promise<Boolean>}
	 */
	async copy_with_result(pathOrigin, pathToPaste) {
		try {
			await this.context.objects().copy(pathOrigin, pathToPaste);
			return true;
		} catch (e) {
			return false;
		}
	}

	/**
	 * Delete file object
	 *
	 * @param {String} path Path of file with container
	 * @param {Boolean=} [checkContainer=true] Boolean to disable check existence of container
	 *
	 * @async
	 * @return {Promise<Object>}
	 */
	delete(path, checkContainer = true) {
		return new Promise(async (resolve, reject) => {
			try {
				// check args
				if (_.isUndefined(path)) // noinspection ExceptionCaughtLocallyJS
					throw new Error("File path parameter is expected.");
				if (!_.isString(path)) // noinspection ExceptionCaughtLocallyJS
					throw new Error("File path parameter is not a string.");
				if (!_.includes(path, '/')) // noinspection ExceptionCaughtLocallyJS
					throw new Error("File path parameter isn't valid : container/filename.ext.");

				// remove first path separator if is send with parameter
				path = (() => {
					let p = path.split('/');
					if (p[0] === '')
						delete p[0];

					return _.filter(p, (e) => {
						return (!_.isUndefined(e))
					}).join('/');
				})()

				// check if file exist
				if (!(await this.context.objects().exist(path))) // noinspection ExceptionCaughtLocallyJS
					throw new Error("File path does not seem to exist.");

				// delete file
				request({
					method: 'DELETE',
					uri: this.context.endpoint.url + '/' + path,
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
	 * Delete file object and return boolean as result
	 *
	 * @param {String} path Path of file with container
	 * @param {Boolean=} [checkContainer=true] Boolean to disable check existence of container
	 *
	 * @async
	 * @return {Promise<Boolean>}
	 */
	async delete_with_result(path, checkContainer = true) {
		try {
			await this.context.objects().delete(path, checkContainer = true);
			return true;
		} catch (e) {
			return false;
		}
	}

	/**
	 * Delete multiple files object
	 *
	 * @param {Array<string>} paths Array of path file
	 * @param {Boolean=} [checkContainer=true] Boolean to disable check existence of container
	 *
	 * @async
	 * @return {Promise<Array<Objects>>}
	 */
	deletes(paths, checkContainer = true) {
		return new Promise(async (resolve, reject) => {
			try {
				if (_.isUndefined(paths)) // noinspection ExceptionCaughtLocallyJS
					throw new Error("Files paths parameter is expected.");
				if (!_.isArray(paths) && _.count(_.filter(paths, (path) => {
					return (_.isString(path))
				})) !== _.count(paths)) // noinspection ExceptionCaughtLocallyJS
					throw new Error("One or more file path are incorrect, paths type must be an array of string values.");
				if (_.count(_.filter(paths, (path) => {
					return (_.includes(path, '/'))
				})) !== _.count(paths)) // noinspection ExceptionCaughtLocallyJS
					throw new Error("One or more file path parameter isn't valid : container/filename.ext.");

				let deletes = await Promise.all(_.map(paths, (path) => {
					return this.context.objects().delete(path, checkContainer);
				}));

				return resolve(deletes);
			} catch (e) {
				return reject(e);
			}
		});
	}

	/**
	 * Delete multiple files object and return boolean as result
	 *
	 * @param {Array<string>} paths Array of path file
	 * @param {Boolean=} [checkContainer=true] Boolean to disable check existence of container
	 *
	 * @async
	 * @return {Promise<Boolean>}
	 */
	async deletes_with_result(paths, checkContainer = true) {
		try {
			await this.context.objects().deletes(paths, checkContainer);
			return true;
		} catch (e) {
			return false;
		}
	}

	/**
	 * Check if file object exist
	 *
	 * @param {String} path Path of file with container
	 *
	 * @async
	 * @return {Promise<Boolean>}
	 */
	exist(path) {
		return new Promise(async (resolve, reject) => {
			try {
				if (_.isUndefined(path)) // noinspection ExceptionCaughtLocallyJS
					throw new Error("File path parameter is expected.");
				if (!_.isString(path)) // noinspection ExceptionCaughtLocallyJS
					throw new Error("File path parameter is not a string.");
				if (!_.includes(path, '/')) // noinspection ExceptionCaughtLocallyJS
					throw new Error("File path parameter isn't valid : container/filename.ext.");

				// check if container exist
				if (!(await this.context.containers().exist((() => {
					let p = path.split('/');
					if (p[0] === "")
						delete p[0];

					p = _.filter(p, (r) => {
						return !_.isUndefined(r);
					});

					if (_.count(p) <= 0)
						return "";

					return p[0];
				})()))) // noinspection ExceptionCaughtLocallyJS
					throw new Error("Container does not seem to exist.");

				let file = (() => {
					let p = path.split('/');
					if (p[0] === "")
						delete p[0];

					p = _.filter(p, (r) => {
						return !_.isUndefined(r);
					});

					return p.join("/");
				})();

				request({
					method: 'GET',
					uri: this.context.endpoint.url + '/' + file,
					headers: {
						"X-Auth-Token": this.context.token,
						"Accept": "application/json"
					}
				}, (err, res, body) => {
					if (parseInt(res.statusCode) === 404) {
						return resolve(false);
					}

					err = err || request.checkIfResponseIsError(res);
					if (err) // noinspection ExceptionCaughtLocallyJS
						throw new Error(err);

					return resolve(true);
				});
			} catch (e) {
				return reject(e);
			}
		});
	}

	/**
	 * Get information details of file object
	 *
	 * @param {String} path Path of file with container
	 *
	 * @async
	 * @return {Promise<Object>}
	 */
	info(path) {
		return new Promise(async (resolve, reject) => {
			try {
				if (_.isUndefined(path)) // noinspection ExceptionCaughtLocallyJS
					throw new Error("File path parameter is expected.");
				if (!_.isString(path)) // noinspection ExceptionCaughtLocallyJS
					throw new Error("File path parameter is not a string.");
				if (!_.includes(path, '/')) // noinspection ExceptionCaughtLocallyJS
					throw new Error("File path parameter isn't valid : container/filename.ext.");

				// check if file exist
				if (!(await this.context.objects().exist(path))) // noinspection ExceptionCaughtLocallyJS
					throw new Error("File path does not seem to exist.");

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

					return resolve(res.headers);
				});
			} catch (e) {
				return reject(e);
			}
		});
	}

	/**
	 * Expire file at datetime
	 *
	 * @param {String} path Path of file with container
	 * @param {Moment} expire_date
	 *
	 * @async
	 * @return {Promise<Object>}
	 */
	expire_at(path, expire_date) {
		return new Promise(async (resolve, reject) => {
			try {
				// check
				if (_.isUndefined(path)) // noinspection ExceptionCaughtLocallyJS
					throw new Error("File path parameter is expected.");
				if (!_.isString(path)) // noinspection ExceptionCaughtLocallyJS
					throw new Error("File path parameter is not a string.");
				if (!_.includes(path, '/')) // noinspection ExceptionCaughtLocallyJS
					throw new Error("File path parameter isn't valid : container/filename.ext.");

				if (_.isUndefined(expire_date)) // noinspection ExceptionCaughtLocallyJS
					throw new Error("Datetime expiration is expected.");
				if (!_.isDate(expire_date) && !moment(expire_date).isValid()) // noinspection ExceptionCaughtLocallyJS
					throw new Error("Datetime expiration must be a valid datetime.");

				// check if file exist
				if (!(await this.context.objects().exist(path))) // noinspection ExceptionCaughtLocallyJS
					throw new Error("File path does not seem to exist.");

				/** @type {Moment} **/
				expire_date = (!moment.isMoment(expire_date) ? moment(expire_date) : expire_date);

				request({
					method: 'POST',
					uri: this.context.endpoint.url + '/' + path,
					headers: {
						"X-Auth-Token": this.context.token,
						"X-Delete-At": Math.round(expire_date.toDate().getTime() / 1000),
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
	 * Expire file at datetime and return boolean as result
	 *
	 * @param {String} path Path of file with container
	 * @param {Moment} expire_date
	 *
	 * @async
	 * @return {Promise<Boolean>}
	 */
	async expire_at_with_result(path, expire_date) {
		try {
			await this.context.objects().expire_at(path, expire_date);
			return true;
		} catch (e) {
			return false;
		}
	}

	/**
	 * Expire file after X seconds
	 *
	 * @param {String} path Path of file with container
	 * @param {number} delete_seconds
	 *
	 * @async
	 * @return {Promise<Object>}
	 */
	expire_after(path, delete_seconds) {
		return new Promise(async (resolve, reject) => {
			try {
				// check
				if (_.isUndefined(path)) // noinspection ExceptionCaughtLocallyJS
					throw new Error("File path parameter is expected.");
				if (!_.isString(path)) // noinspection ExceptionCaughtLocallyJS
					throw new Error("File path parameter is not a string.");
				if (!_.includes(path, '/')) // noinspection ExceptionCaughtLocallyJS
					throw new Error("File path parameter isn't valid : container/filename.ext.");

				if (_.isUndefined(delete_seconds)) // noinspection ExceptionCaughtLocallyJS
					throw new Error("Delete seconds isn't defined.");
				if (!_.isNumber(delete_seconds)) // noinspection ExceptionCaughtLocallyJS
					throw new Error("Delete seconds isn't an integer.");

				// check if file exist
				if (!(await this.context.objects().exist(path))) // noinspection ExceptionCaughtLocallyJS
					throw new Error("File path does not seem to exist.");

				request({
					method: 'POST',
					uri: this.context.endpoint.url + '/' + path,
					headers: {
						"X-Auth-Token": this.context.token,
						"X-Delete-After": parseInt(delete_seconds),
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
	 * Expire file after X seconds and return boolean as result
	 *
	 * @param {String} path Path of file with container
	 * @param {number} delete_seconds
	 *
	 * @async
	 * @return {Promise<Boolean>}
	 */
	async expire_after_with_result(path, delete_seconds) {
		try {
			await this.context.objects().expire_after(path, delete_seconds);
			return true;
		} catch (e) {
			return false;
		}
	}

	/**
	 * Manage meta data of object
	 * Available methods : create(), update(), delete(), all(), has(), get()
	 *
	 * @return {AccountMeta}
	 */
	metas() {
		return new ObjectsMeta(this.context);
	}
}

module.exports = Objects;
