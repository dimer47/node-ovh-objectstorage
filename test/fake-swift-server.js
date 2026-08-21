'use strict';

const http = require('http');

/**
 * Minimal in-memory OpenStack Swift server used to exercise the library
 * without reaching a real OVH account.
 *
 * @param {Object} [options] Server options
 * @param {String} [options.token=TEST-TOKEN] Token handed out on authentication
 *
 * @return {Promise<Object>} Started server, its url and a stop function
 */
const start = (options = {}) => {
	const token = options.token || 'TEST-TOKEN';
	const objects = new Map();
	const containers = new Map([['demo', {}]]);

	const server = http.createServer(async (req, res) => {
		const path = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);
		const body = await _read(req);

		if (path === '/tokens' && req.method === 'POST')
			return _authenticate(req, res, body, token, server);

		if (!req.headers['x-auth-token'])
			return _end(res, 401);

		const segments = path.replace('/v1/AUTH_test', '').split('/').filter(Boolean);

		if (segments.length === 0)
			return _account(req, res, containers);
		if (segments.length === 1)
			return _container(req, res, segments[0], containers, objects);

		return _object(req, res, segments.join('/'), body, objects);
	});

	return new Promise((resolve) => {
		server.listen(0, '127.0.0.1', () => {
			resolve({
				server,
				url: `http://127.0.0.1:${server.address().port}`,
				objects,
				containers,
				stop: () => new Promise((done) => server.close(done))
			});
		});
	});
};

/**
 * Collect a request body
 *
 * @param {Object} req Incoming request
 *
 * @return {Promise<Buffer>}
 */
const _read = (req) => {
	return new Promise((resolve, reject) => {
		const chunks = [];
		req.on('data', (chunk) => chunks.push(chunk));
		req.on('end', () => resolve(Buffer.concat(chunks)));
		req.on('error', reject);
	});
};

/**
 * Answer an identity request with a token and a service catalog
 *
 * @param {Object} req Incoming request
 * @param {Object} res Server response
 * @param {Buffer} body Request body
 * @param {String} token Token to hand out
 * @param {Object} server Running server, used to build the endpoint url
 *
 * @return {void}
 */
const _authenticate = (req, res, body, token, server) => {
	let payload;
	try {
		payload = JSON.parse(body.toString());
	} catch (e) {
		return _end(res, 400);
	}

	if (!payload?.auth?.identity?.password?.user?.name)
		return _end(res, 401);

	res.writeHead(201, {
		'x-subject-token': token,
		'content-type': 'application/json'
	});
	res.end(JSON.stringify({
		token: {
			catalog: [{
				type: 'object-store',
				endpoints: [{
					region_id: 'GRA',
					region: 'GRA',
					interface: 'public',
					url: `http://127.0.0.1:${server.address().port}/v1/AUTH_test`
				}]
			}]
		}
	}));
};

/**
 * Handle account level requests
 *
 * @param {Object} req Incoming request
 * @param {Object} res Server response
 * @param {Map} containers Known containers
 *
 * @return {void}
 */
const _account = (req, res, containers) => {
	if (req.method === 'GET') {
		res.writeHead(200, {'content-type': 'application/json'});
		return res.end(JSON.stringify(
			[...containers.keys()].map((name) => ({name, count: 0, bytes: 0}))
		));
	}
	return _end(res, 204);
};

/**
 * Handle container level requests
 *
 * @param {Object} req Incoming request
 * @param {Object} res Server response
 * @param {String} name Container name
 * @param {Map} containers Known containers
 * @param {Map} objects Stored objects
 *
 * @return {void}
 */
const _container = (req, res, name, containers, objects) => {
	if (req.method === 'PUT') {
		containers.set(name, {});
		return _end(res, 201);
	}

	if (!containers.has(name) && req.method !== 'DELETE')
		return _end(res, 404);

	if (req.method === 'HEAD')
		return _end(res, 204, {'x-container-object-count': '0'});

	if (req.method === 'GET') {
		const listing = [...objects.keys()]
			.filter((key) => key.startsWith(`${name}/`))
			.map((key) => ({name: key.slice(name.length + 1), bytes: objects.get(key).length}));

		res.writeHead(200, {'content-type': 'application/json'});
		return res.end(JSON.stringify(listing));
	}

	if (req.method === 'DELETE') {
		containers.delete(name);
		return _end(res, 204);
	}

	return _end(res, 204);
};

/**
 * Handle object level requests
 *
 * @param {Object} req Incoming request
 * @param {Object} res Server response
 * @param {String} key Object key, container included
 * @param {Buffer} body Request body
 * @param {Map} objects Stored objects
 *
 * @return {void}
 */
const _object = (req, res, key, body, objects) => {
	if (req.method === 'PUT') {
		objects.set(key, body);
		// A 201 carries no body, so no content-length is advertised here.
		return _end(res, 201, {etag: 'test-etag'});
	}

	if (req.method === 'POST')
		return _end(res, 202);

	if (!objects.has(key))
		return _end(res, 404);

	if (req.method === 'GET') {
		const stored = objects.get(key);
		res.writeHead(200, {
			'content-length': String(stored.length),
			'x-object-meta-source': 'test-suite'
		});
		return res.end(stored);
	}

	if (req.method === 'HEAD')
		return _end(res, 200, {'content-length': String(objects.get(key).length)});

	if (req.method === 'DELETE') {
		objects.delete(key);
		return _end(res, 204);
	}

	return _end(res, 404);
};

/**
 * Close a response with a status and optional headers
 *
 * @param {Object} res Server response
 * @param {Number} status HTTP status code
 * @param {Object} [headers] Headers to send
 *
 * @return {void}
 */
const _end = (res, status, headers = {}) => {
	res.writeHead(status, headers);
	res.end();
};

module.exports = {start};
