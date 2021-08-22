require('dotenv').config()
const chai = require('chai');
const assert = chai.assert;
const expect = chai.expect;

const OVHStorage = require('../src/OVHObjectStorage.js');

let storage = new OVHStorage({
	username: process.env.TEST_USERNAME,
	password: process.env.TEST_PASSWORD,
	authURL: process.env.TEST_AUTHURL,
	tenantId: process.env.TEST_TENANTID,
	region: process.env.TEST_REGION,
	debug: false,
});

describe('Account API tests', function () {
	before(async function () {
		await storage.connection();
	});

	it("should all", async function () {
		let containers = await storage.account().all();

		expect(containers).to.be.a('Object')
		expect(containers.account).to.be.a('Object')
		expect(containers.containers).to.be.a('array')

	})

	it("should list containers", async function () {
		let containers = await storage.account().containers();

		expect(containers).to.be.a('array')
	})

	it("should account details", async function () {
		let details = await storage.account().details();

		expect(details).to.be.a('object')
		assert.isTrue(Object.keys(details).indexOf('content-length') >= 0)
		assert.isTrue(Object.keys(details).indexOf('x-account-storage-policy-pcs-bytes-used') >= 0)
		assert.isTrue(Object.keys(details).indexOf('x-account-storage-policy-pca-object-count') >= 0)
		assert.isTrue(Object.keys(details).indexOf('x-account-storage-policy-pca-bytes-used') >= 0)
		assert.isTrue(Object.keys(details).indexOf('x-account-storage-policy-pca-container-count') >= 0)
		assert.isTrue(Object.keys(details).indexOf('x-account-bytes-used') >= 0)
		assert.isTrue(Object.keys(details).indexOf('x-account-storage-policy-pcs-object-count') >= 0)
		assert.isTrue(Object.keys(details).indexOf('x-account-storage-policy-pcs-container-count') >= 0)
		assert.isTrue(Object.keys(details).indexOf('x-account-container-count') >= 0)
		assert.isTrue(Object.keys(details).indexOf('x-account-object-count') >= 0)
		assert.isTrue(Object.keys(details).indexOf('x-timestamp') >= 0)
		assert.isTrue(Object.keys(details).indexOf('accept-ranges') >= 0)
		assert.isTrue(Object.keys(details).indexOf('content-type') >= 0)
		assert.isTrue(Object.keys(details).indexOf('x-trans-id') >= 0)
		assert.isTrue(Object.keys(details).indexOf('x-openstack-request-id') >= 0)
		assert.isTrue(Object.keys(details).indexOf('date') >= 0)
		assert.isTrue(Object.keys(details).indexOf('connection') >= 0)
		assert.isTrue(Object.keys(details).indexOf('x-iplb-request-id') >= 0)
		assert.isTrue(Object.keys(details).indexOf('x-iplb-instance') >= 0)
	})

	it("should account meta create", async function () {
		let key = 'test-meta';
		let value = 'It\'s work !';

		let result = await storage.account().metas().create_with_result(key, value);
		expect(result).to.be.a('boolean')
		assert.isTrue(result)

		let details = await storage.account().details();
		assert.isTrue(details['x-account-meta-test-meta'] === value)
	})

	it("should account meta update", async function () {
		let key = 'test-meta';
		let value = 'It\'s work !';
		let value_updated = 'It\'s work very well !';

		let result_create = await storage.account().metas().create_with_result(key, value);
		assert.isTrue(result_create)

		let result_update = await storage.account().metas().update_with_result(key, value_updated);
		assert.isTrue(result_update)

		let details = await storage.account().details();
		assert.isTrue(details['x-account-meta-test-meta'] === value_updated)
	})

	it("should account meta delete", async function () {
		let key = 'test-meta';
		let value = 'It\'s work !';

		let result_create = await storage.account().metas().create_with_result(key, value);
		assert.isTrue(result_create)

		let result_delete = await storage.account().metas().delete_with_result(key);
		assert.isTrue(result_delete)

		let details = await storage.account().details();
		assert.isTrue(details['x-account-meta-test-meta'] === undefined)
	})

	it("should account meta get", async function () {
		let key = 'test-meta';
		let value = 'It\'s work !';

		let result_create = await storage.account().metas().create_with_result(key, value);
		assert.isTrue(result_create)

		let result_get = await storage.account().metas().get(key);
		assert.isTrue(result_get === value)
	})

	it("should account meta has", async function () {
		let key = 'test-meta';
		let value = 'It\'s work !';

		let result_create = await storage.account().metas().create_with_result(key, value);
		assert.isTrue(result_create)

		let result_get = await storage.account().metas().has(key);
		assert.isTrue(result_get)
	})

	it("should account meta all", async function () {
		let key = 'test-meta';
		let value = 'It\'s work !';

		let result_create = await storage.account().metas().create_with_result(key, value);
		assert.isTrue(result_create)

		let result_all = await storage.account().metas().all();
		expect(result_all).to.have.an('object')
		assert.isTrue(Object.keys(result_all).length >=1)
		assert.isTrue(Object.keys(result_all).indexOf(key) >=0)
	})
})