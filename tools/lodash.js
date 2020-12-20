const _ = require('lodash');

/**
 * Make string to slug
 *
 * @mixin
 * @param {string} str String to slugify
 * @return {string}
 */
_.toSlug = function (str) {
	if (_.isUndefined(str) || !_.isString(str)) throw new Error("String parameter is expected.");

	str = str.replace(/^\s+|\s+$/g, ''); // trim
	str = str.toLowerCase();

	// remove accents, swap ñ for n, etc
	let from = "àáäâèéëêìíïîòóöôùúüûñç·/,:;";
	let to = "aaaaeeeeiiiioooouuuunc------";
	for (let i = 0, l = from.length; i < l; i++) {
		str = str.replace(new RegExp(from.charAt(i), 'g'), to.charAt(i));
	}

	str = str.replace(/[^a-z0-9_ -]/g, '') // remove invalid chars
		.replace(/\s+/g, '-') // collapse whitespace and replace by -
		.replace(/-+/g, '-'); // collapse dashes

	return str;
}

/**
 * Check if string is JSON
 *
 * @mixin
 * @param {string} str String to verify
 * @return {boolean}
 */
_.isJSON = function (str) {
	if (_.isUndefined(str) || !_.isString(str)) throw new Error("String parameter is expected.");

	try {
		let obj = JSON.parse(str);
		if (obj && typeof obj === 'object' && obj !== null) {
			return true;
		}
	} catch (err) {
	}

	return false;
}

/**
 * Return number of elements than array ou object contains
 *
 * @mixin
 * @param {array|Object} e Array or Object to count
 * @return {string[]|*}
 */
_.count = function (e) {
	if (_.isArray(e))
		return e.length;
	else if (_.isObject(e))
		return Object.keys(e);
	else
		throw new Error('Cannot count elements on none object or array parameter.');
}

module.exports = _;
