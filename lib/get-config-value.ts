import rawSiteConfig from '../site.config'
import { type SiteConfig } from './site-config'

if (!rawSiteConfig) {
  throw new Error(`Config error: invalid site.config.ts`)
}

// allow environment variables to override site.config.ts
let siteConfigOverrides: Partial<SiteConfig> | undefined

try {
  if (process.env.NEXT_PUBLIC_SITE_CONFIG) {
    siteConfigOverrides = JSON.parse(
      process.env.NEXT_PUBLIC_SITE_CONFIG
    ) as Partial<SiteConfig>
  }
} catch (err) {
  console.error('Invalid config "NEXT_PUBLIC_SITE_CONFIG" failed to parse')
  throw err
}

const siteConfig: SiteConfig = {
  ...rawSiteConfig,
  ...siteConfigOverrides
}

export function getSiteConfig<K extends keyof SiteConfig>(
  key: K
): SiteConfig[K] | undefined
export function getSiteConfig<K extends keyof SiteConfig, T>(
  key: K,
  defaultValue: T
): Exclude<SiteConfig[K], undefined> | T
export function getSiteConfig<K extends keyof SiteConfig, T>(
  key: K,
  defaultValue?: T
) {
  const value = siteConfig[key]

  if (value !== undefined) {
    return value
  }

  return defaultValue
}

export function getRequiredSiteConfig<K extends keyof SiteConfig>(
  key: K
): Exclude<SiteConfig[K], undefined> {
  const value = siteConfig[key]

  if (value !== undefined) {
    return value as Exclude<SiteConfig[K], undefined>
  }

  throw new Error(`Config error: missing required site config value "${key}"`)
}

export function getEnv(key: string, defaultValue?: undefined): string
export function getEnv<T>(key: string, defaultValue: T): string | T
export function getEnv<T>(key: string, defaultValue?: T, env = process.env) {
  const value = env[key]

  if (value !== undefined) {
    return value
  }

  if (defaultValue !== undefined) {
    return defaultValue
  }

  throw new Error(`Config error: missing required env variable "${key}"`)
}
