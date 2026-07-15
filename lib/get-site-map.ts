import ExpiryMap from 'expiry-map'
import {
  getAllPagesInSpace,
  getBlockValue,
  getPageProperty,
  uuidToId
} from 'notion-utils'
import pMemoize from 'p-memoize'

import type * as types from './types'
import * as config from './config'
import { getCanonicalPageId, isRootPageChild } from './get-canonical-page-id'
import { notion } from './notion-api'

export async function getSiteMap(): Promise<types.SiteMap> {
  const partialSiteMap = await getAllPages(
    config.rootNotionPageId,
    config.rootNotionSpaceId ?? undefined
  )

  return {
    site: config.site,
    ...partialSiteMap
  } as types.SiteMap
}

const getAllPages = pMemoize(getAllPagesImpl, {
  cacheKey: (...args) => JSON.stringify(args),
  cache: new ExpiryMap(60_000)
})

const getPage = async (pageId: string) =>
  notion.getPage(pageId, {
    fetchCollections: false,
    fetchRelationPages: false,
    signFileUrls: false,
    ofetchOptions: {
      timeout: 30_000
    }
  })

async function getAllPagesImpl(
  rootNotionPageId: string,
  rootNotionSpaceId?: string
): Promise<Partial<types.SiteMap>> {
  const pageMap = await getAllPagesInSpace(
    rootNotionPageId,
    rootNotionSpaceId,
    getPage,
    {
      concurrency: 2,
      maxDepth: 1,
      traverseCollections: false
    }
  )

  const canonicalPageMap = Object.keys(pageMap).reduce(
    (map, pageId: string) => {
      if (uuidToId(pageId) === uuidToId(rootNotionPageId)) {
        return map
      }

      const recordMap = pageMap[pageId]
      if (!recordMap) {
        throw new Error(`Error loading page "${pageId}"`)
      }

      const block = getBlockValue(recordMap.block[pageId])
      if (!block) {
        throw new Error(`Invalid Notion page "${pageId}"`)
      }

      if (!isRootPageChild(pageId, recordMap, rootNotionPageId)) {
        return map
      }

      if (
        !(getPageProperty<boolean | null>('Public', block, recordMap) ?? true)
      ) {
        return map
      }

      const canonicalPageId = getCanonicalPageId(
        pageId,
        recordMap,
        rootNotionPageId
      )
      if (!canonicalPageId) {
        throw new Error(`Unable to create a route for Notion page "${pageId}"`)
      }

      if (map[canonicalPageId]) {
        throw new Error(
          `Duplicate top-level Notion route "${canonicalPageId}" for pages ` +
            `"${map[canonicalPageId]}" and "${pageId}"`
        )
      } else {
        return {
          ...map,
          [canonicalPageId]: pageId
        }
      }
    },
    {}
  )

  return {
    pageMap,
    canonicalPageMap
  }
}
