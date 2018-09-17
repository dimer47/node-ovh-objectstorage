'use strict'

import test from 'ava/index'

const config = require('config')
const OVHStorage = require('../lib/OVHObjectStorage')

test('Login to OVH', async t => {
  let storage = new OVHStorage(config.storageConfig)

  let values = await storage.connection()

  t.truthy(values, 'Values should exist')
  t.deepEqual(Object.keys(values.token), ['issued_at', 'expires', 'id', 'tenant', 'audit_ids'], 'Token should contains all the keys')
  t.deepEqual(Object.keys(values.endpoint), ['adminURL', 'region', 'id', 'internalURL', 'publicURL'], 'Endpoint should contains all the keys')
})
