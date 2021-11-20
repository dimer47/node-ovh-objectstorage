// REQUIRES
const fs = require('fs');
const _ = require("../tools/lodash");
const request = require('../tools/request');
const md5 = require('md5');
const moment = require('moment');

const Account = require('./Account');
const Containers = require('./Containers');
const Objects = require('./Objects');

/**
 * **Simple library to use OVH Public Cloud Object Storage**
 *
 * Create and manage containers (public, private or static), add and manage objects in OVH Public Cloud (OpenStack).
 *
 * Based on : [https://developer.openstack.org/api-ref/object-storage/](https://developer.openstack.org/api-ref/object-storage/?expanded=)
 *
 *
 * @example
 * let OVHStorage = require('node-ovh-objectstorage');
 *
 * let config = {
 *    username: '************',
 *    password: '*****************************',
 *    authURL: 'https://auth.cloud.ovh.net/v3/auth',
 *    tenantId: '************************************',
 *    region: 'SBG',
 *    debug: false
 * };
 *
 * let storage = new OVHStorage(config);
 *
 * @author IACHI Dimitri <iachi.dimitri@gmail.com>
 * @property {Object} config        Connexion parameters to OVH Object Storage
 * @property {string} token         Token negotiate on connexion to call Object Storage API
 * @property {string} endpoint      Endpoint to call OVH Object Storage
 * @property {moment} connected_at  Moment object with datetime connexion
 */

class OVHStorage {
	/**
	 * Object of account details and list containers.
	 *
	 * @example
	 * let config = {
	 *    username: '************',
	 *    password: '*****************************',
	 *    authURL: 'https://auth.cloud.ovh.net/v3/auth',
	 *    tenantId: '************************************',
	 *    region: 'SBG',
	 *    debug: false
	 * };
	 *
	 * @typedef {Object} OVHStorageConfig
	 *
	 * @property {String} username OVH Public Cloud swift user name
	 * @property {String} password OVH Public Cloud swift user password
	 * @property {URL} authURL OVH Public Cloud auth url
	 * @property {String} tenantId OVH Public Cloud swift tenant ID
	 * @property {String} region OVH Public Cloud swift region
	 * @property {boolean=} [debug=false] OVH Public Cloud swift user name
	 */

	/**
	 * @param {OVHStorageConfig} config Define OVH Storage access configuration (endpoint, credentials, ...)
	 */
	constructor(config) {
		this.config = config;
		if (_.isUndefined(this.config.debug))
			this.config.debug = false;

		if (this.config.debug) {
			request.debug = true;
			require('request-debug')(request);
		}
	}

	/**
	 * Initialize connection to OVH Object Storage server
	 *
	 * @example
	 * try {
	 *    await storage.connection();
	 * } catch (e) {
	 *    // throw error
	 * }
	 *
	 * @async
	 * @return {Promise<boolean|Error>}
	 */
	connection() {
		this.key = this.config?.key !== undefined ? this.config.key : null;

		return new Promise((resolve, reject) => {
			request({
				method: 'POST',
				uri: encodeURI(this.config.authURL + '/tokens'),
				json: {
					"auth": {
						"identity": {
							"methods": ["password"],
							"password": {
								"user": {
									"name": this.config.username,
									"domain": {
										"name": "Default"
									},
									"password": this.config.password
								}
							}
						}
					}
				},
				headers: {'Accept': 'application/json'}
			}, (err, res, body) => {
				try {
					err = err || request.checkIfResponseIsError(res);
					if (err) // noinspection ExceptionCaughtLocallyJS
						throw new Error(err);

					body = (_.isString(body) ? (_.isJSON(body) ? JSON.parse(body) : body) : body);

					if (body.error) // noinspection ExceptionCaughtLocallyJS
						throw new Error(body.error.message);

					let token = res.headers['x-subject-token'];
					let serviceCatalog = _.find(body.token.catalog, {type: 'object-store'});
					let endpoint = _.find(serviceCatalog.endpoints, (o) => {
						return o.region_id === this.config.region
					});

					this.token = token;
					this.endpoint = endpoint;
					this.connected_at = moment();

					resolve(true);
				} catch (e) {
					reject(e);
				}
			});
		});
	}

	/**
	 * Return connection details : token, endpoints, start connection timestamp
	 *
	 * @example
	 * try {
	 *    await storage.connection();
	 *
	 *    console.log(storage.getConnectionDetails());
	 *
	 * } catch (e) {
	 *    // throw error
	 * }
	 *
	 * @async
	 * @return {{key: String, endpoint: *, token: *, connected_at : *}}
	 */
	getConnectionDetails() {
		return {
			"key": this.key,
			"token": this.token,
			"endpoint": this.endpoint,
			"connected_at": this.connected_at.format("YYYY-MM-DD HH:mm:ss")
		};
	}

	/**
	 * Get account manager
	 *
	 * @example
	 * try {
	 *    await storage.connection();
	 *
	 *    // list details of account
	 *    console.log(await storage.account().details());
	 *
	 *    // list all containers
	 *    console.log(await storage.account().containers());
	 *
	 *    // manage metas
	 *    console.log(await storage.account().metas().all())
	 *    await storage.account().metas().create("test", 'Hello world !');
	 *    console.log(await storage.account().metas().has("test"));
	 *    console.log(await storage.account().metas().get("test"));
	 *    await storage.account().metas().update("test", 'Bye bye ...');
	 *
	 *    if(!await storage.account().metas().delete_with_result("test"))
	 *       console.log("An error has occurred when trying delete test meta on account.");
	 *
	 * } catch (e) {
	 *    // throw error
	 * }
	 *
	 * @return {Account}
	 */
	account() {
		return new Account(this);
	}

	/**
	 * Get container manager
	 *
	 * @example
	 * try {
	 *    await storage.connection();
	 *
	 *    // create containers
	 *    await storage.containers().create_with_result("files-private");
	 *    await storage.containers().create_with_result("files", "public");
	 *    await storage.containers().create_with_result("files-web", "static");
	 *
	 *    // list all containers on account
	 *    console.log(await storage.account().containers());
	 *
	 *    // if container "files" exist, list all objects inside
	 *    if(await storage.containers().exist("files"))
	 *       console.log(await storage.containers().list("files"));
	 *
	 *    // get information about container "files"
	 *    console.log(await storage.containers().info("files"));
	 *
	 *    // manage metas of container "files"
	 *    console.log(await storage.containers().metas().all('files'))
	 *    await storage.containers().metas().create("files", "last-update", '2020-05-20 13:10:03');
	 *    console.log(await storage.containers().metas().has("files", "last-update"));
	 *    console.log(await storage.containers().metas().get("files", "last-update"));
	 *
	 *    if(!await storage.containers().metas().update_with_result("files", "last-update", '2020-05-20 16:41:54'))
	 *       console.log("An error has occurred when trying update last-update meta.");
	 *
	 * } catch (e) {
	 *    // throw error
	 * }
	 *
	 * @return {Containers}
	 */
	containers() {
		return new Containers(this);
	}

	/**
	 * Get object storage manager
	 *
	 * @example
	 * try {
	 *    await storage.connection();
	 *
	 *    // create containers
	 *    await storage.containers().create_with_result("pictures");
	 *
	 *    // save file on container
	 *    if (!await storage.object().save_with_result("./IMG_1145.jpg", "/pictures/IMG_1145.jpg"))
	 *       console.log("Cannot upload image file : IMG_1145.jpg.");
	 *
	 *    // create a copies of file uploaded
	 *    await storage.object().copy("pictures/IMG_1145.jpg", "/pictures/IMG_1145-2.jpg";
	 *    await storage.object().copy("pictures/IMG_1145.jpg", "/private/pictures/IMG_1145-3.jpg";
	 *
	 *    // get information about an object
	 *    console.log(await storage.object().info("/pictures/IMG_1145-2.jpg"));
	 *
	 *    // if file object exist, delete it
	 *    if(await storage.object().exist("/pictures/IMG_1145-2.jpg"))
	 *       await storage.object().delete("/pictures/IMG_1145-2.jpg")
	 *
	 *    // program expire file after 60 seconds (1 minute)
	 *    await storage.object().expire_after_with_result("/pictures/IMG_1145.jpg", 60);
	 *    await storage.object().expire_at_with_result("/private/pictures/IMG_1145-3.jpg", moment().add("2", "days"));
	 *
	 *    // manage metas of pictures
	 *    console.log(await storage.containers().metas().all("/private/pictures/IMG_1145-3.jpg"))
	 *    await storage.containers().metas().create("/private/pictures/IMG_1145-3.jpg", "last-update", '2020-05-20 13:10:03');
	 *    console.log(await storage.containers().metas().has("/private/pictures/IMG_1145-3.jpg", "last-update"));
	 *    console.log(await storage.containers().metas().get("/private/pictures/IMG_1145-3.jpg", "last-update"));
	 *
	 *    if(!await storage.containers().metas().update_with_result("/private/pictures/IMG_1145-3.jpg", "last-update", '2020-05-20 16:41:54'))
	 *       console.log("An error has occurred when trying update last-update meta.");
	 *
	 * } catch (e) {
	 *    // throw error
	 * }
	 *
	 * @return {Objects}
	 */
	objects() {
		return new Objects(this);
	}
}

module.exports = OVHStorage;
