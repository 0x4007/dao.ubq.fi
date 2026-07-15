import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import test from 'node:test'

const publicReactNotionSpecifiers = [
  'react-notion-x/styles.css',
  'react-notion-x/third-party/code',
  'react-notion-x/third-party/collection',
  'react-notion-x/third-party/equation',
  'react-notion-x/third-party/modal',
  'react-notion-x/third-party/pdf'
]

void test('react-notion-x integrations use exported public paths', async () => {
  const notionPageSource = await readFile(
    new URL('../components/NotionPage.tsx', import.meta.url),
    'utf8'
  )
  const appSource = await readFile(
    new URL('../pages/_app.tsx', import.meta.url),
    'utf8'
  )
  const source = `${notionPageSource}\n${appSource}`

  assert.doesNotMatch(source, /react-notion-x\/(?:build|src)\//)

  for (const specifier of publicReactNotionSpecifiers) {
    assert.ok(source.includes(specifier))
    assert.doesNotThrow(() => import.meta.resolve(specifier))
  }
})

void test('blog classification reaches the JSON-LD script renderer', async () => {
  const notionPageSource = await readFile(
    new URL('../components/NotionPage.tsx', import.meta.url),
    'utf8'
  )
  const pageHeadSource = await readFile(
    new URL('../components/PageHead.tsx', import.meta.url),
    'utf8'
  )

  assert.match(notionPageSource, /isBlogPost={isBlogPost}/)
  assert.match(pageHeadSource, /type='application\/ld\+json'/)
  assert.match(pageHeadSource, /serializeStructuredData\(structuredData\)/)
})
