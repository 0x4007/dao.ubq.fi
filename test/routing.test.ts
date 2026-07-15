import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import test from 'node:test'

import { type ExtendedRecordMap } from 'notion-types'

import {
  getCanonicalPageId,
  isRootPageChild
} from '../lib/get-canonical-page-id.ts'
import { getCollectionPageIds } from '../lib/get-collection-page-ids.ts'
import { getCanonicalPageUrl, mapPageUrl } from '../lib/map-page-url.ts'

const rootPageId = 'ff1a3cae-9009-41e4-9cc4-d4458cc2867d'

test('site configuration contains no manual route registry', async () => {
  const source = await readFile(
    new URL('../site.config.ts', import.meta.url),
    'utf8'
  )

  assert.doesNotMatch(source, /pageUrlOverrides|includeNotionIdInUrls/)
})

test('direct root children get clean title-derived routes', () => {
  const page = block({
    id: 'fd3d3861-654f-4b7b-9c27-02ff7842ade2',
    type: 'page',
    parentId: rootPageId,
    title: 'UbiquityOS for DAOs'
  })
  const recordMap = createRecordMap(page)

  assert.equal(isRootPageChild(page.id, recordMap, rootPageId), true)
  assert.equal(
    getCanonicalPageId(page.id, recordMap, rootPageId),
    'ubiquityos-for-daos'
  )
})

test('search results use their own record map when generating routes', () => {
  const page = block({
    id: '42700dc9-4fcf-4d5f-a829-cac0aa5acd38',
    type: 'page',
    parentId: rootPageId,
    title: 'About'
  })
  const incompleteRecordMap = createRecordMap(
    block({
      ...page,
      parentId: '11111111-1111-4111-8111-111111111111'
    })
  )
  const searchRecordMap = createRecordMap(page)
  const site = {
    name: 'Ubiquity DAO Hub',
    domain: 'dao.ubq.fi',
    rootNotionPageId: rootPageId.replaceAll('-', ''),
    rootNotionSpaceId: '684fb1cf-ad2b-40c7-8e31-c099fa61e45f'
  }

  assert.equal(
    mapPageUrl(
      site,
      incompleteRecordMap,
      new URLSearchParams()
    )(page.id, searchRecordMap),
    '/about'
  )
})

test('pages below layout blocks retain their Notion ID', () => {
  const columnList = block({
    id: '11111111-1111-4111-8111-111111111111',
    type: 'column_list',
    parentId: rootPageId
  })
  const column = block({
    id: '22222222-2222-4222-8222-222222222222',
    type: 'column',
    parentId: columnList.id
  })
  const page = block({
    id: '42700dc9-4fcf-4d5f-a829-cac0aa5acd38',
    type: 'page',
    parentId: column.id,
    title: 'About'
  })
  const recordMap = createRecordMap(columnList, column, page)

  assert.equal(isRootPageChild(page.id, recordMap, rootPageId), false)
  assert.equal(
    getCanonicalPageId(page.id, recordMap, rootPageId),
    'about-42700dc94fcf4d5fa829cac0aa5acd38'
  )
})

test('deeper pages retain their Notion ID', () => {
  const parentPage = block({
    id: 'fd3d3861-654f-4b7b-9c27-02ff7842ade2',
    type: 'page',
    parentId: rootPageId,
    title: 'UbiquityOS for DAOs'
  })
  const columnList = block({
    id: '33333333-3333-4333-8333-333333333333',
    type: 'column_list',
    parentId: parentPage.id
  })
  const column = block({
    id: '44444444-4444-4444-8444-444444444444',
    type: 'column',
    parentId: columnList.id
  })
  const page = block({
    id: 'c5d49cb0-88cc-4b5f-bda1-5b43682f2974',
    type: 'page',
    parentId: column.id,
    title: 'DevPool Flow'
  })
  const recordMap = createRecordMap(parentPage, columnList, column, page)

  assert.equal(isRootPageChild(page.id, recordMap, rootPageId), false)
  assert.equal(
    getCanonicalPageId(page.id, recordMap, rootPageId),
    'devpool-flow-c5d49cb088cc4b5fbda15b43682f2974'
  )
})

test('collection pages and incomplete ancestry default to ID-bearing routes', () => {
  const collectionPage = block({
    id: '55555555-5555-4555-8555-555555555555',
    type: 'page',
    parentId: '66666666-6666-4666-8666-666666666666',
    parentTable: 'collection',
    title: 'Release Notes'
  })
  const incompletePage = block({
    id: '77777777-7777-4777-8777-777777777777',
    type: 'page',
    parentId: '88888888-8888-4888-8888-888888888888',
    title: 'Missing Parent'
  })
  const recordMap = createRecordMap(collectionPage, incompletePage)

  assert.equal(
    getCanonicalPageId(collectionPage.id, recordMap, rootPageId),
    'release-notes-55555555555545558555555555555555'
  )
  assert.equal(
    getCanonicalPageId(incompletePage.id, recordMap, rootPageId),
    'missing-parent-77777777777747778777777777777777'
  )
})

test('invalid page identifiers do not generate a route', () => {
  assert.equal(
    getCanonicalPageId('not-a-notion-page', createRecordMap(), rootPageId),
    null
  )
})

test('invalid internal page URLs resolve to the 404 route', () => {
  const site = {
    name: 'Ubiquity DAO Hub',
    domain: 'dao.ubq.fi',
    rootNotionPageId: rootPageId,
    rootNotionSpaceId: '684fb1cf-ad2b-40c7-8e31-c099fa61e45f'
  }
  const recordMap = createRecordMap()

  assert.equal(
    mapPageUrl(site, recordMap, new URLSearchParams())('invalid'),
    '/404'
  )
  assert.equal(
    getCanonicalPageUrl(site, recordMap)('invalid'),
    'https://dao.ubq.fi/404'
  )
})

test('clean slug resolution fetches the complete Notion page', async () => {
  const source = await readFile(
    new URL('../lib/resolve-notion-page.ts', import.meta.url),
    'utf8'
  )

  assert.doesNotMatch(source, /recordMap\s*=\s*siteMap\.pageMap/)
  assert.match(source, /recordMap\s*=\s*await getPage\(pageId\)/)
})

test('collection query page IDs are deduplicated across result shapes', () => {
  const nestedPageId = '99999999-9999-4999-8999-999999999999'
  const collectionPageId = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa'
  const recordMap = createRecordMap()
  recordMap.collection_query = {
    collection: {
      view: {
        type: 'table',
        total: 2,
        blockIds: [nestedPageId, collectionPageId],
        aggregationResults: [],
        collection_group_results: {
          type: 'results',
          blockIds: [collectionPageId],
          hasMore: false
        }
      }
    }
  }

  assert.deepEqual(getCollectionPageIds(recordMap), [
    collectionPageId,
    nestedPageId
  ])
})

function block({
  id,
  type,
  parentId,
  parentTable = 'block',
  title
}: {
  id: string
  type: string
  parentId: string
  parentTable?: string
  title?: string
}) {
  return {
    id,
    type,
    parent_id: parentId,
    parent_table: parentTable,
    properties: title ? { title: [[title]] } : undefined
  }
}

function createRecordMap(...blocks: ReturnType<typeof block>[]) {
  return {
    block: Object.fromEntries(
      blocks.map((value) => [
        value.id,
        {
          role: 'reader',
          value: {
            role: 'reader',
            value
          }
        }
      ])
    )
  } as unknown as ExtendedRecordMap
}
