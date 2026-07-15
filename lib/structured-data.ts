interface BlogPostStructuredDataOptions {
  isBlogPost?: boolean
  title?: string
  description?: string
  image?: string
  url?: string
  organizationName: string
  organizationUrl?: string
}

export function getBlogPostStructuredData({
  isBlogPost,
  title,
  description,
  image,
  url,
  organizationName,
  organizationUrl
}: BlogPostStructuredDataOptions) {
  if (!isBlogPost || !title || !url) {
    return null
  }

  const organization = {
    '@type': 'Organization',
    name: organizationName,
    ...(organizationUrl ? { url: organizationUrl } : {})
  }

  return {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    '@id': `${url}#blog-posting`,
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': url
    },
    url,
    headline: title,
    name: title,
    ...(description ? { description } : {}),
    ...(image ? { image } : {}),
    author: organization,
    publisher: organization
  }
}

export function serializeStructuredData(value: unknown): string {
  return JSON.stringify(value).replaceAll('<', '\\u003c')
}
