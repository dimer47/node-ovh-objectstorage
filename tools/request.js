const request = require('request');

/**
 * Check if response of HTTP Request is an error
 *
 * @param {Object} res Request response
 *
 * @return {string|null}
 */
request.checkIfResponseIsError = (res) => {
	if (!res) {
		return 'no response';
	}
	if (res.statusCode < 200 || res.statusCode >= 300) {
		return [res.statusCode, res.statusMessage].join(' ');
	}
	return null;
}

module.exports = request;
