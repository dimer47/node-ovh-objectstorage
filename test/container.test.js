'use strict'

import test from 'ava/index'

const config = require('config')
const OVHStorage = require('../lib/OVHObjectStorage')

test('List container files', async t => {
  let storage = new OVHStorage(config.storageConfig)

  await storage.connection()

  let infos = await storage.container().list('s3pweb-images')

  t.true(infos.length > 0, 'File array should not be empty')
  t.is(infos[0].content_type, 'image/png', 'Content type should be image/png')
  t.is(infos[0].name, 'Advanced_use_case_1.png', 'Name should be Advanced_use_case_1.png')
})