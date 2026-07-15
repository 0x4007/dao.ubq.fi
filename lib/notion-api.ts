import { NotionAPI } from 'notion-client'

const retryCount = 4

export const notion = new NotionAPI({
  apiBaseUrl: process.env.NOTION_API_BASE_URL,
  ofetchOptions: {
    retry: retryCount,
    retryDelay: ({ options, response }) => {
      const retryAfter = response?.headers.get('retry-after')

      if (retryAfter) {
        const seconds = Number(retryAfter)
        if (Number.isFinite(seconds)) return seconds * 1000

        const date = Date.parse(retryAfter)
        if (Number.isFinite(date)) return Math.max(date - Date.now(), 0)
      }

      const retriesRemaining =
        typeof options.retry === 'number' ? options.retry : retryCount
      return 1000 * 2 ** (retryCount - retriesRemaining)
    }
  }
})
