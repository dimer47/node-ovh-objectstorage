'use strict'

import test from 'ava/index'

const config = require('config')
const OVHStorage = require('../lib/OVHObjectStorage')

test('Login to OVH - Object Storagz', async t => {
  let storage = new OVHStorage(config.storageConfig)

  let values = await storage.connection()

  t.truthy(values, 'NOPE')
  t.truthy(values.token, 'NOPE token')
  t.truthy(values.endpoint, 'NOPE endpoint')
})
