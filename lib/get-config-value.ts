import rawSiteConfig from '../site.config'
import { type SiteConfig } from './site-config'

if (!rawSiteConfig) {
  throw new Error(`Config error: invalid site.config.ts`)
}

const siteConfig: SiteConfig = rawSiteConfig

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
