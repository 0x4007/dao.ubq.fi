import { NotionAPI } from 'notion-client'

import { normalizeNotionRecordMap } from './normalize-notion-record-map'

export const notion = new NotionAPI({
  apiBaseUrl: process.env.NOTION_API_BASE_URL
})

const getPage = notion.getPage.bind(notion)

notion.getPage = async (...args) => {
  const recordMap = await getPage(...args)

  return normalizeNotionRecordMap(recordMap)
}
