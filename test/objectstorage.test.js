'use strict';

const {test, before, after, describe} = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const os = require('os');
const path = require('path');

const OVHObjectStorage = require('../index.js');
const fakeSwift = require('./fake-swift-server.js');

describe('OVHObjectStorage over a simulated Swift endpoint', () => {
	let swift;
	let storage;

	before(async () => {
		swift = await fakeSwift.start();
		storage = new OVHObjectStorage({
			username: 'user',
			password: 'secret',
			authURL: swift.url,
			tenantId: 'tenant',
			region: 'GRA'
		});
		await storage.connection();
	});

	after(async () => {
		await swift.stop();
	});

	test('authenticates and resolves the storage endpoint', () => {
		assert.strictEqual(storage.token, 'TEST-TOKEN');
		assert.match(storage.endpoint.url, /\/v1\/AUTH_test$/);
	});

	test('creates a container and reports it as existing', async () => {
		await storage.containers().create('reports');
		assert.strictEqual(await storage.containers().exist('reports'), true);
	});

	test('lists the objects of a container as parsed JSON', async () => {
		const listing = await storage.containers().list('demo');
		assert.ok(Array.isArray(listing));
	});

	test('stores and reads back an accented utf8 payload', async () => {
		await storage.objects().saveData('Bonjour café ☕', '/demo/hello.txt');

		const read = await storage.objects().get('/demo/hello.txt');
		assert.strictEqual(read.content, 'Bonjour café ☕');
		assert.ok(read.headers['content-length']);
	});

	test('returns a Buffer untouched when encoding is null', async () => {
		const binary = Buffer.from([0x00, 0xff, 0x10, 0x89, 0x50, 0x4e]);
		await storage.objects().saveData(binary, '/demo/payload.bin');

		const read = await storage.objects().get('/demo/payload.bin', null);
		assert.ok(Buffer.isBuffer(read.content));
		assert.deepStrictEqual(read.content, binary);
	});

	test('uploads a file larger than a single chunk through a stream', async () => {
		const source = path.join(os.tmpdir(), `ovh-objectstorage-${process.pid}.bin`);
		const payload = Buffer.concat([Buffer.from('header;'), Buffer.alloc(300000, 0xab)]);
		fs.writeFileSync(source, payload);

		try {
			await storage.objects().saveFile(source, '/demo/streamed.bin');

			const read = await storage.objects().get('/demo/streamed.bin', null);
			assert.strictEqual(read.content.length, payload.length);
			assert.deepStrictEqual(read.content, payload);
		} finally {
			fs.unlinkSync(source);
		}
	});

	test('reports a missing object as absent instead of throwing', async () => {
		assert.strictEqual(await storage.objects().exist('/demo/missing.txt'), false);
	});

	test('rejects when reading a missing object', async () => {
		await assert.rejects(() => storage.objects().get('/demo/missing.txt'));
	});

	test('exposes account details', async () => {
		assert.ok(await storage.account().details());
	});

	test('writes and reads object metadata', async () => {
		await storage.objects().metas().create('/demo/hello.txt', 'source', 'test-suite');
		assert.ok(await storage.objects().metas().all('/demo/hello.txt'));
	});

	test('deletes an object', async () => {
		await storage.objects().saveData('temporary', '/demo/temp.txt');
		await storage.objects().delete('/demo/temp.txt');

		assert.strictEqual(await storage.objects().exist('/demo/temp.txt'), false);
	});
});
