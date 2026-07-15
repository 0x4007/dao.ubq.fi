import ExpiryMap from 'expiry-map'
import { type PageMap } from 'notion-types'
import { uuidToId } from 'notion-utils'
import pMemoize from 'p-memoize'

import * as config from './config'
import { getCollectionPageIds } from './get-collection-page-ids'
import { notion } from './notion-api'

const getPage = (pageId: string, fetchCollections = false) =>
  notion.getPage(pageId, {
    fetchCollections,
    fetchRelationPages: false,
    signFileUrls: false,
    ofetchOptions: {
      timeout: 30_000
    }
  })

/**
 * Fetches only collection entries attached to the configured root page. This
 * keeps the normal site-map crawl shallow while preserving RSS for sites whose
 * root is backed by a Notion collection.
 */
export const getFeedPageMap = pMemoize(
  async (): Promise<PageMap> => {
    const rootRecordMap = await getPage(config.rootNotionPageId, true)
    const pageMap: PageMap = {
      [uuidToId(config.rootNotionPageId)]: rootRecordMap
    }
    const pageIds = getCollectionPageIds(rootRecordMap)

    for (let index = 0; index < pageIds.length; index += 2) {
      const batch = pageIds.slice(index, index + 2)
      const recordMaps = await Promise.all(
        batch.map((pageId) => getPage(pageId))
      )

      for (const [pageIndex, pageId] of batch.entries()) {
        pageMap[uuidToId(pageId)] = recordMaps[pageIndex]
      }
    }

    return pageMap
  },
  {
    cache: new ExpiryMap(60_000)
  }
)
