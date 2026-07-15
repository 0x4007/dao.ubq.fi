import { type ExtendedRecordMap } from 'notion-types'

/** Returns the unique page IDs emitted by every collection query in a page. */
export function getCollectionPageIds(recordMap: ExtendedRecordMap): string[] {
  return Array.from(
    new Set(
      Object.values(recordMap.collection_query || {}).flatMap(
        (collectionViews) =>
          Object.values(collectionViews).flatMap((collectionData) => [
            ...(collectionData?.collection_group_results?.blockIds || []),
            ...(collectionData?.blockIds || [])
          ])
      )
    )
  )
}
