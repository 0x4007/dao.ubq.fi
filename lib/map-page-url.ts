import { type ExtendedRecordMap } from 'notion-types'
import { parsePageId, uuidToId } from 'notion-utils'

import type { Site } from './types.ts'
import { getCanonicalPageId } from './get-canonical-page-id.ts'

export const mapPageUrl =
  (site: Site, recordMap: ExtendedRecordMap, searchParams: URLSearchParams) =>
  (pageId = '', targetRecordMap = recordMap) => {
    const pageUuid = parsePageId(pageId, { uuid: true })
    if (!pageUuid) {
      return createUrl('/404', searchParams)
    }

    if (uuidToId(pageUuid) === uuidToId(site.rootNotionPageId)) {
      return createUrl('/', searchParams)
    } else {
      const canonicalPageId = getCanonicalPageId(
        pageUuid,
        targetRecordMap,
        site.rootNotionPageId
      )
      if (!canonicalPageId) {
        return createUrl('/404', searchParams)
      }

      return createUrl(`/${canonicalPageId}`, searchParams)
    }
  }

export const getCanonicalPageUrl =
  (site: Site, recordMap: ExtendedRecordMap) =>
  (pageId = '') => {
    const pageUuid = parsePageId(pageId, { uuid: true })
    if (!pageUuid) {
      return `https://${site.domain}/404`
    }

    if (uuidToId(pageUuid) === uuidToId(site.rootNotionPageId)) {
      return `https://${site.domain}`
    } else {
      const canonicalPageId = getCanonicalPageId(
        pageUuid,
        recordMap,
        site.rootNotionPageId
      )
      return canonicalPageId
        ? `https://${site.domain}/${canonicalPageId}`
        : `https://${site.domain}/404`
    }
  }

function createUrl(path: string, searchParams: URLSearchParams) {
  return [path, searchParams.toString()].filter(Boolean).join('?')
}
