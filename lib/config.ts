/**
 * Site-wide app configuration.
 *
 * This file pulls from the root "site.config.ts" as well as environment variables
 * for optional depenencies.
 */
import { parsePageId } from 'notion-utils'
import { type PostHogConfig } from 'posthog-js'

import {
  getEnv,
  getRequiredSiteConfig,
  getSiteConfig
} from './get-config-value'
import { type NavigationLink } from './site-config'
import { type NavigationStyle, type Site } from './types'

export const rootNotionPageId: string = parsePageId(
  getRequiredSiteConfig('rootNotionPageId'),
  { uuid: false }
)

if (!rootNotionPageId) {
  throw new Error('Config error invalid "rootNotionPageId"')
}

// if you want to restrict pages to a single notion workspace (optional)
export const rootNotionSpaceId: string | null = parsePageId(
  getSiteConfig('rootNotionSpaceId', null),
  { uuid: true }
)

export const environment = process.env.NODE_ENV || 'development'
export const isDev = environment === 'development'

// general site config
export const name: string = getRequiredSiteConfig('name')
export const author: string = getRequiredSiteConfig('author')
export const domain: string = getRequiredSiteConfig('domain')
export const description: string = getSiteConfig('description', 'Notion Blog')
export const language: string = getSiteConfig('language', 'en')

// social accounts
export const twitter: string | null = getSiteConfig('twitter', null)
export const zhihu: string | null = getSiteConfig('zhihu', null)
export const mastodon: string | null = getSiteConfig('mastodon', null)
export const github: string | null = getSiteConfig('github', null)
export const youtube: string | null = getSiteConfig('youtube', null)
export const linkedin: string | null = getSiteConfig('linkedin', null)
export const discord: string | null = getSiteConfig('discord', null)
export const telegram: string | null = getSiteConfig('telegram', null)
export const newsletter: string | null = getSiteConfig('newsletter', null)

export const getMastodonHandle = (): string | null => {
  if (!mastodon) {
    return null
  }

  // Since Mastodon is decentralized, handles include the instance domain name.
  // e.g. @example@mastodon.social
  const url = new URL(mastodon)
  return `${url.pathname.slice(1)}@${url.hostname}`
}

// default notion values for site-wide consistency (optional; may be overridden on a per-page basis)
export const defaultPageIcon: string | null = getSiteConfig(
  'defaultPageIcon',
  null
)
export const defaultPageCover: string | null = getSiteConfig(
  'defaultPageCover',
  null
)
export const defaultPageCoverPosition: number = getSiteConfig(
  'defaultPageCoverPosition',
  0.5
)

export const navigationStyle: NavigationStyle = getSiteConfig(
  'navigationStyle',
  'default'
)

export const navigationLinks: Array<NavigationLink> | null = getSiteConfig(
  'navigationLinks',
  null
)

// Optional site search
export const isSearchEnabled: boolean = getSiteConfig('isSearchEnabled', true)

// ----------------------------------------------------------------------------

export const isServer = typeof window === 'undefined'

export const port = getEnv('PORT', '3000')
export const host = isDev ? `http://localhost:${port}` : `https://${domain}`
export const apiHost = isDev
  ? host
  : `https://${process.env.VERCEL_URL || domain}`

export const apiBaseUrl = `/api`

export const api = {
  searchNotion: `${apiBaseUrl}/search-notion`,
  getNotionPageInfo: `${apiBaseUrl}/notion-page-info`,
  getSocialImage: `${apiBaseUrl}/social-image`
}

// ----------------------------------------------------------------------------

export const site: Site = {
  domain,
  name,
  rootNotionPageId,
  rootNotionSpaceId,
  description
}

export const fathomId = isDev ? null : process.env.NEXT_PUBLIC_FATHOM_ID
export const fathomConfig = fathomId
  ? {
      excludedDomains: ['localhost', 'localhost:3000']
    }
  : undefined

export const posthogId = process.env.NEXT_PUBLIC_POSTHOG_ID
export const posthogConfig: Partial<PostHogConfig> = {
  api_host: 'https://app.posthog.com'
}
