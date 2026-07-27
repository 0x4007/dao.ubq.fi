import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import test from 'node:test'

void test('Next configuration is Turbopack-compatible and keeps Vercel settings', async () => {
  const source = await readFile(
    new URL('../next.config.js', import.meta.url),
    'utf8'
  )

  assert.doesNotMatch(source, /\bwebpack\s*:/)
  assert.doesNotMatch(source, /bundleAnalyzer/)
  assert.match(source, /outputFileTracingRoot: dirname/)
  assert.match(source, /staticPageGenerationTimeout: 300/)
  assert.match(source, /transpilePackages: \['react-tweet'\]/)
  assert.match(source, /s3\.us-west-2\.amazonaws\.com/)
})

void test('React 19 migration has no React 18-only body side effect dependency', async () => {
  const packageJson = JSON.parse(
    await readFile(new URL('../package.json', import.meta.url), 'utf8')
  )
  const notionPageSource = await readFile(
    new URL('../components/NotionPage.tsx', import.meta.url),
    'utf8'
  )

  assert.equal(packageJson.dependencies['react-body-classname'], undefined)
  assert.match(packageJson.dependencies.react, /^\^19\./)
  assert.match(packageJson.dependencies['react-dom'], /^\^19\./)
  assert.doesNotMatch(notionPageSource, /react-body-classname/)
  assert.match(notionPageSource, /useBodyClass\('notion-lite', isLiteMode\)/)
})

void test('framework dependencies stay on audited security patches', async () => {
  const packageJson = JSON.parse(
    await readFile(new URL('../package.json', import.meta.url), 'utf8')
  )
  const workspaceConfig = await readFile(
    new URL('../pnpm-workspace.yaml', import.meta.url),
    'utf8'
  )

  assert.equal(packageJson.dependencies.next, '^16.2.12')
  assert.equal(packageJson.dependencies.react, '^19.2.8')
  assert.equal(packageJson.dependencies['react-dom'], '^19.2.8')
  assert.match(workspaceConfig, /postcss: 8\.5\.23/)
  assert.match(workspaceConfig, /sharp: 0\.35\.3/)
})

void test('Vercel installs with the pinned Corepack package manager', async () => {
  const vercelConfig = JSON.parse(
    await readFile(new URL('../vercel.json', import.meta.url), 'utf8')
  )

  assert.equal(vercelConfig.installCommand, 'corepack pnpm install')
  assert.equal(vercelConfig.buildCommand, 'corepack pnpm build')
})
