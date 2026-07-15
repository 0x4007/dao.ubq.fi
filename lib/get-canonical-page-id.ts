import { type ExtendedRecordMap } from 'notion-types'
import {
  getBlockValue,
  getCanonicalPageId as getCanonicalPageIdImpl,
  parsePageId,
  uuidToId
} from 'notion-utils'

export function getCanonicalPageId(
  pageId: string,
  recordMap: ExtendedRecordMap,
  rootPageId: string
): string | null {
  const pageUuid = parsePageId(pageId, { uuid: true })
  if (!pageUuid) {
    return null
  }

  return getCanonicalPageIdImpl(pageUuid, recordMap, {
    uuid: !isRootPageChild(pageUuid, recordMap, rootPageId)
  })
}

/**
 * A top-level page has the configured Notion root as its direct block parent.
 * This relation is present on the page block itself, so canonical URLs do not
 * depend on which surrounding blocks happen to be present in a record map.
 */
export function isRootPageChild(
  pageId: string,
  recordMap: ExtendedRecordMap,
  rootPageId: string
): boolean {
  const page = getBlock(recordMap, pageId)
  return (
    page?.parent_table === 'block' &&
    uuidToId(page.parent_id) === uuidToId(rootPageId)
  )
}

function getBlock(recordMap: ExtendedRecordMap, blockId: string) {
  const blockUuid = parsePageId(blockId, { uuid: true })
  const cleanBlockId = parsePageId(blockId, { uuid: false })

  return getBlockValue(
    recordMap.block[blockId] ||
      (blockUuid && recordMap.block[blockUuid]) ||
      (cleanBlockId && recordMap.block[cleanBlockId])
  )
}
