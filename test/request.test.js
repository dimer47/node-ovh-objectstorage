'use strict';

const {test, before, after, describe} = require('node:test');
const assert = require('node:assert');
const http = require('http');

const request = require('../tools/request.js');

describe('request adapter built on fetch', () => {
	let server;
	let base;

	before(async () => {
		server = http.createServer(async (req, res) => {
			const chunks = [];
			for await (const chunk of req) chunks.push(chunk);
			const body = Buffer.concat(chunks);

			if (req.url === '/json') {
				res.writeHead(200, {'content-type': 'application/json', etag: '"tag"'});
				return res.end('{"value":42}');
			}
			if (req.url === '/text') {
				res.writeHead(200, {'content-type': 'text/plain'});
				return res.end('Bonjour café ☕');
			}
			if (req.url === '/binary') {
				res.writeHead(200);
				return res.end(Buffer.from([0x00, 0xff, 0x10]));
			}
			if (req.url === '/echo') {
				res.writeHead(201, {'x-received-bytes': String(body.length)});
				return res.end();
			}
			if (req.url === '/missing') {
				res.writeHead(404, {}, 'Not Found');
				return res.end();
			}
			res.writeHead(404);
			res.end();
		});

		await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
		base = `http://127.0.0.1:${server.address().port}`;
	});

	after(() => new Promise((resolve) => server.close(resolve)));

	/**
	 * Promisify one adapter call
	 *
	 * @param {Object} options Request options
	 *
	 * @return {Promise<Object>}
	 */
	const call = (options) => new Promise((resolve, reject) => {
		request(options, (err, res, body) => err ? reject(err) : resolve({res, body}));
	});

	test('exposes statusCode, statusMessage and lowercased headers', async () => {
		const {res} = await call({method: 'GET', uri: `${base}/json`});

		assert.strictEqual(res.statusCode, 200);
		assert.strictEqual(res.statusMessage, 'OK');
		assert.strictEqual(res.headers['content-type'], 'application/json');
		assert.strictEqual(res.headers.etag, '"tag"');
	});

	test('returns the payload as a utf8 string by default', async () => {
		const {body} = await call({method: 'GET', uri: `${base}/text`});

		assert.strictEqual(typeof body, 'string');
		assert.strictEqual(body, 'Bonjour café ☕');
	});

	test('returns a Buffer when encoding is null', async () => {
		const {body} = await call({method: 'GET', uri: `${base}/binary`, encoding: null});

		assert.ok(Buffer.isBuffer(body));
		assert.deepStrictEqual(body, Buffer.from([0x00, 0xff, 0x10]));
	});

	test('sends a json payload with a json content type and parses the answer', async () => {
		const {body} = await call({method: 'POST', uri: `${base}/json`, json: {a: 1}});

		assert.deepStrictEqual(body, {value: 42});
	});

	test('sends a raw body', async () => {
		const {res} = await call({method: 'PUT', uri: `${base}/echo`, body: 'Bonjour café ☕'});

		assert.strictEqual(res.headers['x-received-bytes'], '17');
	});

	test('sends a piped stream as the request body', async () => {
		const {Readable} = require('stream');
		const payload = Buffer.alloc(150000, 0x7a);

		const res = await new Promise((resolve, reject) => {
			const proxy = request(
				{method: 'PUT', uri: `${base}/echo`},
				(err, response) => err ? reject(err) : resolve(response)
			);
			Readable.from([payload]).pipe(proxy);
		});

		assert.strictEqual(res.headers['x-received-bytes'], String(payload.length));
	});

	test('does not treat an http error as a transport error', async () => {
		const {res} = await call({method: 'GET', uri: `${base}/missing`});

		assert.strictEqual(res.statusCode, 404);
	});

	describe('checkIfResponseIsError', () => {
		test('flags a missing response', () => {
			assert.strictEqual(request.checkIfResponseIsError(null), 'no response');
		});

		test('accepts any 2xx status', () => {
			assert.strictEqual(
				request.checkIfResponseIsError({statusCode: 204, statusMessage: 'No Content'}),
				null
			);
		});

		test('describes a non 2xx status', () => {
			assert.strictEqual(
				request.checkIfResponseIsError({statusCode: 404, statusMessage: 'Not Found'}),
				'404 Not Found'
			);
		});
	});
});
