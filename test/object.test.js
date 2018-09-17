'use strict'

import test from 'ava/index'

const config = require('config')
const OVHStorage = require('../lib/OVHObjectStorage')

test('Get file metadata', async t => {
  let storage = new OVHStorage(config.storageConfig)
  await storage.connection()

  let objectInfo = await storage.object().info('s3pweb-images', 'Advanced_use_case_1.png')

  t.truthy(objectInfo, 'Metadatas should exist')
  t.deepEqual(objectInfo['content-length'], ['68899'], 'Content length should be 68899')
  t.deepEqual(objectInfo['content-type'], ['image/png'], 'Content length should be image/png')
})

test('Get file content', async t => {
  let storage = new OVHStorage(config.storageConfig)
  await storage.connection()

  let objectInfo = await storage.object().get('s3pweb-images', 'Advanced_use_case_1.png', 'image.png')

  t.truthy(objectInfo, 'Metadatas should exist')
})
