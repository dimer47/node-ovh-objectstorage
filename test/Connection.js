require('dotenv').config()
const chai = require('chai');
const assert = chai.assert;
const expect = chai.expect;
const moment = require('moment');

const OVHStorage = require('../src/OVHObjectStorage.js');

let storage = new OVHStorage({
	username: process.env.TEST_USERNAME,
	password: process.env.TEST_PASSWORD,
	authURL: process.env.TEST_AUTHURL,
	tenantId: process.env.TEST_TENANTID,
	region: process.env.TEST_REGION,
	debug: process.env.TEST_DEBUG,
});

describe('Auth API tests', function () {

	it("connection", async function () {
		let connection = storage.connection();
		expect(connection).to.have.an('Promise')

		let connection_result = await storage.connection();
		assert.equal(connection_result, true)
	});

	it("get connection details", async function () {
		await storage.connection();
		let details = storage.getConnectionDetails();

		expect(details).to.have.property('token')
		expect(details).to.have.property('endpoint')
		expect(details).to.have.property('connected_at')
		expect(details.token).to.be.a('string')
		expect(details.endpoint).to.be.an('object')
		expect(details.endpoint.url).to.be.an('string')
		expect(details.endpoint.interface).to.be.an('string')
		expect(details.endpoint.region).to.be.an('string')
		expect(details.endpoint.region_id).to.be.an('string')
		expect(details.endpoint.id).to.be.an('string')
		expect(details.connected_at).to.be.a('string')
		assert.isTrue(moment(details.connected_at).isValid())
	})
})