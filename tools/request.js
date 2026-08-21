'use strict';

const {Readable, PassThrough} = require('stream');

/**
 * Minimal request-compatible client built on the native fetch API.
 *
 * Only the subset of options used by this library is supported :
 * `method`, `uri`, `headers`, `json`, `body` and `encoding`.
 *
 * @param {Object} options Request options
 * @param {String} options.uri Target URI
 * @param {String} [options.method=GET] HTTP method
 * @param {Object} [options.headers] HTTP headers
 * @param {Object} [options.json] JSON payload, sent with a JSON content type
 * @param {String|Buffer|Readable} [options.body] Raw payload
 * @param {String|null} [options.encoding] Response encoding, `null` returns a Buffer
 * @param {Function} [callback] Called with (error, response, body)
 *
 * @return {Object} A writable proxy accepting `pipe()` as request body
 */
const request = (options, callback) => {
	// Body written by an upstream `stream.pipe(request(...))` call.
	const upstream = new PassThrough();
	let piped = false;

	upstream.on('pipe', () => {
		piped = true;
	});

	const send = async () => {
		if (typeof fetch !== 'function')
			throw new Error(
				'The global fetch API is missing, Node.js 18 or later is required ' +
				'(running ' + process.version + ').'
			);

		const method = (options.method || 'GET').toUpperCase();
		const headers = Object.assign({}, options.headers);

		let body;
		if (!_isNil(options.json)) {
			body = JSON.stringify(options.json);
			if (!_hasHeader(headers, 'content-type'))
				headers['Content-Type'] = 'application/json';
		} else if (piped) {
			body = upstream;
		} else if (!_isNil(options.body)) {
			body = options.body;
		}

		const init = {method, headers};
		if (!_isNil(body)) {
			init.body = body;
			// Node requires an explicit half duplex mode to stream a request body.
			if (body === upstream || body instanceof Readable)
				init.duplex = 'half';
		}

		if (request.debug)
			console.error('[request]', method, options.uri, headers);

		const response = await fetch(options.uri, init);

		const res = {
			statusCode: response.status,
			statusMessage: response.statusText,
			headers: _toPlainHeaders(response.headers),
			request: {method, uri: options.uri}
		};

		const buffer = Buffer.from(await response.arrayBuffer());

		// `encoding: null` keeps the payload binary, mirroring request's behaviour.
		let payload = options.encoding === null
			? buffer
			: buffer.toString(options.encoding || 'utf8');

		// A json request also parses the response, as request did.
		if (!_isNil(options.json) && typeof payload === 'string' && payload.length) {
			try {
				payload = JSON.parse(payload);
			} catch (e) {
				// Leave the raw payload untouched when it is not valid JSON.
			}
		}

		if (request.debug)
			console.error('[request]', res.statusCode, res.headers);

		return [res, payload];
	};

	if (typeof callback === 'function') {
		// Defer so the caller can pipe into the returned proxy first.
		setImmediate(() => {
			send().then(
				([res, payload]) => callback(null, res, payload),
				(err) => callback(err, undefined, undefined)
			);
		});
	}

	return upstream;
};

/**
 * Check if a header is already set, whatever its case
 *
 * @param {Object} headers Headers to look into
 * @param {String} name Lowercase header name
 *
 * @return {boolean}
 */
const _hasHeader = (headers, name) => {
	return Object.keys(headers).some((k) => k.toLowerCase() === name);
};

/**
 * Check for null or undefined values
 *
 * @param {*} value Value to test
 *
 * @return {boolean}
 */
const _isNil = (value) => {
	return value === null || value === undefined;
};

/**
 * Convert fetch Headers into a plain object
 *
 * @param {Headers} headers Response headers
 *
 * @return {Object}
 */
const _toPlainHeaders = (headers) => {
	const plain = {};
	headers.forEach((value, key) => {
		plain[key] = value;
	});
	return plain;
};

/**
 * Enable verbose logging of requests and responses
 *
 * @type {boolean}
 */
request.debug = false;

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
