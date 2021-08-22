const _ = require("../tools/lodash");
const request = require("../tools/request");

/**
 * Define and access to all metas of containers
 *
 * __Available methods :__ *create()*, *create_with_result()*, *update()*, *update_with_result()*, *delete()*, *delete_with_result()*, *all()*, *has()*, *get()*
 */
class ContainersMeta {
  /**
   * Container Meta constructor
   *
   * @param {OVHStorage} context OVHObjectStorage context
   */
  constructor (context) {
    this.context = context;
  }

  /**
   * Create a new container meta
   *
   * @param {String} container Name of container
   * @param {String} key Name of meta
   * @param {String} value Value of meta
   *
   * @async
   * @return {Promise<Object>}
   */
  create (container, key, value) {
    return new Promise(async (resolve, reject) => {
      try {
        // checks
        if (_.isUndefined(container)) {
          // noinspection ExceptionCaughtLocallyJS
          throw new Error("Container name parameter is expected.");
        }
        if (!_.isString(container)) {
          // noinspection ExceptionCaughtLocallyJS
          throw new Error("Container name parameter is not a string.");
        }
        if (_.includes(container, "/")) {
          // noinspection ExceptionCaughtLocallyJS
          throw new Error("Container name parameter contains special chars.");
        }

        if (_.isUndefined(key)) {
          // noinspection ExceptionCaughtLocallyJS
          throw new Error("Key parameter is expected.");
        }
        if (!_.isString(key)) {
          // noinspection ExceptionCaughtLocallyJS
          throw new Error("Key parameter is not a string.");
        }
        if (_.includes(key, "/") || _.includes(key, " ")) {
          // noinspection ExceptionCaughtLocallyJS
          throw new Error("Key parameter contains special chars.");
        }

        if (_.isUndefined(value)) {
          // noinspection ExceptionCaughtLocallyJS
          throw new Error("Value parameter is expected.");
        }
        if (!_.isString(value)) {
          // noinspection ExceptionCaughtLocallyJS
          throw new Error("Value parameter is not a string.");
        }

        // header
        const header = {};
        header["X-Container-Meta-" + _.toSlug(_.replace(_.toLower(key), /_/g, "-"))] = value;

        // check if container exist
        if (!await this.context.containers().exist(container)) {
          // noinspection ExceptionCaughtLocallyJS
          throw new Error("Container name spécified in parameter don't exist.");
        }

        // call
        request({
          method: "POST",
          uri: encodeURI(this.context.endpoint.url + "/" + container),
          headers: Object.assign(
            {
              "X-Auth-Token": this.context.token,
              Accept: "application/json"
            },
            header)
        }, (err, res) => {
          err = err || request.checkIfResponseIsError(res);
          if (err) // noinspection ExceptionCaughtLocallyJS
          {
            throw new Error(err);
          }

          return resolve(res.headers);
        });
      } catch (e) {
        return reject(e);
      }
    });
  }

  /**
   * Create a new container meta and return boolean as result
   *
   * @param {String} container Name of container
   * @param {String} key Name of meta
   * @param {String} value Value of meta
   *
   * @async
   * @return {Promise<Boolean>}
   */
  async create_with_result (container, key, value) {
    try {
      await this.context.containers().metas().create(container, key, value);
      return true;
    } catch (e) {
      return false;
    }
  }

  /**
   * Update existing container meta
   *
   * @param {String} container Name of container
   * @param {String} key Name of meta
   * @param {String} value Value of meta
   *
   * @async
   * @return {Promise<Object>}
   */
  update (container, key, value) {
    return this.context.containers().metas().create(container, key, value);
  }

  /**
   * Update existing container meta and return boolean as result
   *
   * @param {String} container Name of container
   * @param {String} key Name of meta
   * @param {String} value Value of meta
   *
   * @async
   * @return {Promise<Boolean>}
   */
  async update_with_result (container, key, value) {
    try {
      await this.context.containers().metas().update(key, value);
      return true;
    } catch (e) {
      return false;
    }
  }

  /**
   * Delete container meta
   *
   * @param {String} container Name of container
   * @param {String} key Name of meta
   *
   * @async
   * @return {Promise<Object>}
   */
  delete (container, key) {
    return new Promise((resolve, reject) => {
      try {
        // checks
        if (_.isUndefined(container)) {
          // noinspection ExceptionCaughtLocallyJS
          throw new Error("Container parameter is expected.");
        }
        if (!_.isString(container)) {
          // noinspection ExceptionCaughtLocallyJS
          throw new Error("Container parameter is not a string.");
        }
        if (_.includes(container, "/")) {
          // noinspection ExceptionCaughtLocallyJS
          throw new Error("Container parameter doesn't contain special chars.");
        }

        if (_.isUndefined(key)) {
          // noinspection ExceptionCaughtLocallyJS
          throw new Error("Key parameter is expected.");
        }
        if (!_.isString(key)) {
          // noinspection ExceptionCaughtLocallyJS
          throw new Error("Key parameter is not a string.");
        }
        if (_.includes(key, "/") || _.includes(key, " ")) {
          // noinspection ExceptionCaughtLocallyJS
          throw new Error("Key parameter contains special chars.");
        }

        // headers
        const header = {};
        header["X-Remove-Container-Meta-" + _.toSlug(_.toLower(key))] = "x";

        // call
        request({
          method: "POST",
          uri: encodeURI(this.context.endpoint.url + "/" + container),
          headers: Object.assign(
            {
              "X-Auth-Token": this.context.token,
              Accept: "application/json"
            },
            header)
        }, (err, res) => {
          err = err || request.checkIfResponseIsError(res);
          if (err) // noinspection ExceptionCaughtLocallyJS
          {
            throw new Error(err);
          }

          return resolve(res.headers);
        });
      } catch (e) {
        return reject(e);
      }
    });
  }

  /**
   * Delete container meta and return boolean as result
   *
   * @param {String} container Name of container
   * @param {String} key Name of meta
   *
   * @async
   * @return {Promise<Boolean>}
   */
  async delete_with_result (container, key) {
    try {
      await this.context.containers().metas().delete(container, key);
      return true;
    } catch (e) {
      return false;
    }
  }

  /**
   * Get container meta
   *
   * @param {String} container Name of container
   * @param {String} key Name of meta
   *
   * @async
   * @return {Promise<string>}
   */
  get (container, key) {
    return new Promise((resolve, reject) => {
      try {
        // checks
        if (_.isUndefined(container)) {
          // noinspection ExceptionCaughtLocallyJS
          throw new Error("container parameter is expected.");
        }
        if (!_.isString(container)) {
          // noinspection ExceptionCaughtLocallyJS
          throw new Error("name parameter is not a string.");
        }
        if (_.includes(container, "/")) {
          // noinspection ExceptionCaughtLocallyJS
          throw new Error("arg container doesn't contain special chars.");
        }

        if (_.isUndefined(key)) {
          // noinspection ExceptionCaughtLocallyJS
          throw new Error("Key parameter is expected.");
        }
        if (!_.isString(key)) {
          // noinspection ExceptionCaughtLocallyJS
          throw new Error("Key parameter is not a string.");
        }
        if (_.includes(key, "/") || _.includes(key, " ")) {
          // noinspection ExceptionCaughtLocallyJS
          throw new Error("Key parameter contains special chars.");
        }

        // call
        request({
          method: "HEAD",
          uri: encodeURI(this.context.endpoint.url + "/" + container),
          headers: {
            "X-Auth-Token": this.context.token,
            Accept: "application/json"
          }
        }, (err, res) => {
          err = err || request.checkIfResponseIsError(res);
          if (err) // noinspection ExceptionCaughtLocallyJS
          {
            throw new Error(err);
          }

          let value = _.filter(res.headers, (value, header) => {
            return (_.toLower(header) === _.toLower("X-Container-Meta-" + _.toSlug(_.replace(_.toLower(key), /_/g, "-"))));
          });

          value = ((_.count(value) <= 0) ? null : value[0]);

          return resolve(value);
        });
      } catch (e) {
        return reject(e);
      }
    });
  }

  /**
   * Container has meta
   *
   * @param {String} container Name of container
   * @param {String} key Name of meta
   *
   * @async
   * @return {Promise<Boolean>}
   */
  has (container, key) {
    return new Promise(async (resolve, reject) => {
      try {
        resolve(!_.isNull(await this.context.containers().metas().get(container, key)));
      } catch (e) {
        return reject(e);
      }
    });
  }

  /**
   * Get all container metas
   *
   * @async
   * @return {Promise<array>}
   */
  all (container) {
    return new Promise((resolve, reject) => {
      try {
        // checks
        if (_.isUndefined(container)) {
          // noinspection ExceptionCaughtLocallyJS
          throw new Error("Container parameter is expected.");
        }
        if (!_.isString(container)) {
          // noinspection ExceptionCaughtLocallyJS
          throw new Error("Container parameter is not a string.");
        }
        if (_.includes(container, "/")) {
          // noinspection ExceptionCaughtLocallyJS
          throw new Error("Container parameter doesn't contain special chars.");
        }

        // call
        request({
          method: "HEAD",
          uri: encodeURI(this.context.endpoint.url + "/" + container),
          headers: {
            "X-Auth-Token": this.context.token,
            Accept: "application/json"
          }
        }, (err, res) => {
          err = err || request.checkIfResponseIsError(res);
          if (err) // noinspection ExceptionCaughtLocallyJS
          {
            throw new Error(err);
          }

          let values = _.map(res.headers, (value, header) => {
            if (_.includes(_.toLower(header), _.toLower("X-Container-Meta-"))) {
              const a = {};
              a[_.replace(_.toLower(header), _.toLower("X-Container-Meta-"), "")] = value;
              return a;
            }
          });

          values = _.filter(values, (v) => {
            return (!_.isUndefined(v));
          });

          values = (() => {
            const as = {};
            _.map(values, (v) => {
              return _.merge(as, v);
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

module.exports = ContainersMeta;
