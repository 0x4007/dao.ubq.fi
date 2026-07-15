import assert from 'node:assert/strict'
import test from 'node:test'

import {
  getBlogPostStructuredData,
  serializeStructuredData
} from '../lib/structured-data.ts'

void test('collection pages emit organization-authored BlogPosting data', () => {
  const data = getBlogPostStructuredData({
    isBlogPost: true,
    title: 'Protocol update',
    description: 'A Ubiquity protocol update.',
    image: 'https://dao.ubq.fi/social.png',
    url: 'https://dao.ubq.fi/protocol-update-page-id',
    organizationName: 'Ubiquity DAO',
    organizationUrl: 'https://dao.ubq.fi'
  })

  assert.deepEqual(data, {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    '@id': 'https://dao.ubq.fi/protocol-update-page-id#blog-posting',
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': 'https://dao.ubq.fi/protocol-update-page-id'
    },
    url: 'https://dao.ubq.fi/protocol-update-page-id',
    headline: 'Protocol update',
    name: 'Protocol update',
    description: 'A Ubiquity protocol update.',
    image: 'https://dao.ubq.fi/social.png',
    author: {
      '@type': 'Organization',
      name: 'Ubiquity DAO',
      url: 'https://dao.ubq.fi'
    },
    publisher: {
      '@type': 'Organization',
      name: 'Ubiquity DAO',
      url: 'https://dao.ubq.fi'
    }
  })
})

void test('non-blog pages and pages without canonical URLs omit structured data', () => {
  assert.equal(
    getBlogPostStructuredData({
      isBlogPost: false,
      title: 'About',
      url: 'https://dao.ubq.fi/about',
      organizationName: 'Ubiquity DAO'
    }),
    null
  )

  assert.equal(
    getBlogPostStructuredData({
      isBlogPost: true,
      title: 'Local draft',
      organizationName: 'Ubiquity DAO'
    }),
    null
  )
})

void test('structured data serialization cannot close the script element', () => {
  const payload = {
    title: '</script><script>alert(1)</script>'
  }
  const serialized = serializeStructuredData(payload)

  assert.doesNotMatch(serialized, /<\/script>/i)
  assert.match(serialized, /\\u003c\/script>/)
  assert.deepEqual(JSON.parse(serialized), payload)
})
