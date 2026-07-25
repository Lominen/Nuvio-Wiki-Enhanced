import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import test from 'node:test'
import { createEmptyBundle } from './mediaBridgeCore.ts'
import type { BridgeConnection } from './mediaBridgeProviders.ts'
import {
  STREMIO_NUVIO_MIGRATION_DESTINATION,
  STREMIO_NUVIO_MIGRATION_SOURCE,
  canonicalAddonUrl,
  migrateStremioNuvioAddons,
  planStremioNuvioMigration,
  planStremioNuvioAddons,
  previewStremioNuvioAddons,
  resolveStremioNuvioMigrationScopes
} from './stremioNuvioMigration.ts'

test('enables every Stremio to Nuvio migration category by default', () => {
  assert.deepEqual(resolveStremioNuvioMigrationScopes(), {
    history: true,
    progress: true,
    library: true
  })
  assert.deepEqual(resolveStremioNuvioMigrationScopes({ progress: false }), {
    history: true,
    progress: false,
    library: true
  })
})

test('plans watched state, progress, and saved titles for the fixed route', () => {
  const source = createEmptyBundle()
  const destination = createEmptyBundle()

  source.history.push(
    {
      media: { kind: 'movie', ids: { imdb: 'tt2015381' }, title: 'Guardians' },
      watchedAt: 100
    },
    {
      media: { kind: 'movie', ids: { imdb: 'tt2015381' }, title: 'Guardians' },
      watchedAt: 200
    }
  )
  source.progress.push({
    media: {
      kind: 'series',
      ids: { imdb: 'tt0944947' },
      title: 'Game of Thrones',
      season: 1,
      episode: 1
    },
    percentage: 42,
    updatedAt: 300
  })
  source.library.push({
    media: { kind: 'movie', ids: { tmdb: 118340 }, title: 'Guardians' },
    addedAt: 400,
    lists: [{ service: 'stremio', kind: 'library' }]
  })

  const result = planStremioNuvioMigration({ source, destination })

  assert.equal(result.route.id, 'stremio-to-nuvio')
  assert.equal(result.route.enabledScopeCount, 3)
  assert.equal(result.preview.transfer.history.length, 1)
  assert.equal(result.preview.transfer.history[0].watchedAt, 200)
  assert.equal(result.preview.transfer.progress.length, 1)
  assert.equal(result.preview.transfer.library.length, 1)
  assert.equal(result.preview.stats.add, 3)
})

test('keeps newer Nuvio progress and honors an explicit category selection', () => {
  const source = createEmptyBundle()
  const destination = createEmptyBundle()
  const media = {
    kind: 'movie' as const,
    ids: { imdb: 'tt2015381' },
    title: 'Guardians'
  }
  source.progress.push({ media, percentage: 20, updatedAt: 100 })
  source.library.push({
    media,
    addedAt: 100,
    lists: [{ service: 'stremio', kind: 'library' }]
  })
  destination.progress.push({ media, percentage: 65, updatedAt: 200 })

  const result = planStremioNuvioMigration({
    source,
    destination,
    scopes: { history: false, library: false }
  })

  assert.deepEqual(result.scopes, {
    history: false,
    progress: true,
    library: false
  })
  assert.equal(result.preview.transfer.progress.length, 0)
  assert.equal(result.preview.transfer.library.length, 0)
  assert.equal(result.preview.stats.alreadyPresent, 1)
})

test('builds an additive add-on replacement without exposing or dropping tokenized URLs', () => {
  assert.equal(
    canonicalAddonUrl('https://addons.example/user/manifest.json?token=KeepCase'),
    'https://addons.example/user?token=KeepCase'
  )

  const plan = planStremioNuvioAddons({
    addons: [
      {
        manifest: { id: 'existing', name: 'Stremio name' },
        transportUrl: 'https://existing.example/manifest.json?key=private'
      },
      {
        manifest: { id: 'new', name: 'New add-on' },
        transportUrl: 'https://new.example/account/manifest.json?token=Secret'
      },
      {
        manifest: { id: 'local', name: 'Local add-on' },
        transportUrl: 'http://127.0.0.1:11470/local-addon/manifest.json'
      },
      {
        manifest: { id: 'local-v6', name: 'IPv6 local add-on' },
        transportUrl: 'http://[::1]:11470/local-addon/manifest.json'
      },
      {
        manifest: { id: 'unsupported', name: 'Unsupported add-on' },
        transportUrl: 'stremio://unsupported'
      }
    ]
  }, [{
    url: 'https://existing.example?key=private',
    name: 'Keep my Nuvio name',
    enabled: false,
    sort_order: 7
  }])

  assert.equal(plan.sourceCount, 5)
  assert.equal(plan.destinationCount, 1)
  assert.equal(plan.additions.length, 1)
  assert.equal(plan.additions[0].url, 'https://new.example/account?token=Secret')
  assert.equal(plan.merged.length, 2)
  assert.deepEqual(plan.merged[0], {
    url: 'https://existing.example/?key=private',
    name: 'Keep my Nuvio name',
    enabled: false,
    sort_order: 0
  })
  assert.equal(plan.merged[1].sort_order, 1)
  assert.deepEqual(
    plan.skipped.map(item => item.name),
    ['Local add-on', 'IPv6 local add-on', 'Unsupported add-on']
  )
})

test('runs one verified full-list add-on migration and preserves existing Nuvio entries', async () => {
  const source: BridgeConnection = {
    slot: 'source',
    service: 'stremio',
    accountId: 'stremio-user',
    credentials: { service: 'stremio', authKey: 'stremio-key' }
  }
  const destination: BridgeConnection = {
    slot: 'destination',
    service: 'nuvio',
    accountId: 'nuvio-user',
    profileId: 2,
    credentials: {
      service: 'nuvio',
      publicKey: 'public-key',
      session: { access_token: 'access-token' }
    }
  }
  const existing = [{
    url: 'https://existing.example',
    name: 'Existing',
    enabled: true,
    sort_order: 0
  }]
  let replacement: readonly {
    url: string
    name: string
    enabled: boolean
    sort_order: number
  }[] = []
  let nuvioReads = 0

  const result = await migrateStremioNuvioAddons(source, destination, {
    async readStremio() {
      return {
        addons: [{
          manifest: { name: 'Added' },
          transportUrl: 'https://added.example/private/manifest.json?token=abc123'
        }]
      }
    },
    async readNuvio() {
      nuvioReads++
      return nuvioReads === 1 ? existing : replacement
    },
    async replaceNuvio(_connection, addons) {
      replacement = addons.map(addon => ({ ...addon }))
    }
  })

  assert.equal(result.written, 1)
  assert.equal(result.verified, true)
  assert.equal(nuvioReads, 2)
  assert.equal(replacement.length, 2)
  assert.equal(replacement[0].name, 'Existing')
  assert.equal(replacement[1].url, 'https://added.example/private?token=abc123')
})

test('reads add-on snapshots through the documented Stremio and Nuvio endpoints', async t => {
  const source: BridgeConnection = {
    slot: 'source',
    service: 'stremio',
    accountId: 'stremio-user',
    credentials: { service: 'stremio', authKey: 'stremio-key' }
  }
  const destination: BridgeConnection = {
    slot: 'destination',
    service: 'nuvio',
    accountId: 'nuvio-user',
    profileId: 2,
    credentials: {
      service: 'nuvio',
      publicKey: 'public-key',
      session: { access_token: 'access-token' }
    }
  }

  t.mock.method(globalThis, 'fetch', async (input, init) => {
    const url = new URL(String(input))
    if (url.hostname === 'api.strem.io') {
      assert.equal(url.pathname, '/api/addonCollectionGet')
      assert.equal(init?.method, 'POST')
      assert.deepEqual(JSON.parse(String(init?.body)), {
        authKey: 'stremio-key',
        type: 'AddonCollectionGet',
        update: false
      })
      return Response.json({
        result: {
          addons: [{
            manifest: { name: 'New add-on' },
            transportUrl: 'https://new.example/manifest.json'
          }]
        }
      })
    }
    if (url.hostname === 'api.nuvio.tv') {
      assert.equal(url.pathname, '/rest/v1/addons')
      assert.equal(url.searchParams.get('select'), '*')
      assert.equal(url.searchParams.get('profile_id'), 'eq.2')
      assert.equal(url.searchParams.get('order'), 'sort_order')
      assert.equal(new Headers(init?.headers).get('Authorization'), 'Bearer access-token')
      return Response.json([{
        url: 'https://existing.example',
        name: 'Existing',
        enabled: true,
        sort_order: 0
      }])
    }
    throw new Error(`Unexpected request: ${url.origin}${url.pathname}`)
  })

  const plan = await previewStremioNuvioAddons(source, destination)

  assert.equal(plan.destinationCount, 1)
  assert.equal(plan.additions.length, 1)
  assert.equal(plan.merged.length, 2)
})

test('presents a focused fixed-route migration UI with every category selected', async () => {
  const [component, bridge, tools] = await Promise.all([
    readFile(new URL('./StremioNuvioMigration.vue', import.meta.url), 'utf8'),
    readFile(new URL('./MediaSyncBridge.vue', import.meta.url), 'utf8'),
    readFile(new URL('./NuvioToolsContainer.vue', import.meta.url), 'utf8')
  ])

  assert.match(component, /import MediaSyncBridge/)
  assert.match(component, /lock-route/)
  assert.match(component, /enable-addon-migration/)
  assert.match(component, /default-addon-migration-selected/)
  assert.match(component, /migration-mode/)
  assert.doesNotMatch(component, /migration-summary/)
  assert.doesNotMatch(component, /Browser-local migration/)
  assert.match(component, /STREMIO_NUVIO_MIGRATION_SOURCE/)
  assert.match(component, /STREMIO_NUVIO_MIGRATION_DESTINATION/)
  assert.match(bridge, /Add-on URLs can contain private configuration tokens/)
  assert.match(bridge, /Migrate to Nuvio/)
  assert.match(bridge, /Choose what to bring/)
  assert.match(bridge, /migrateStremioNuvioAddons/)
  assert.match(tools, /id: 'stremio-migration'/)
  assert.equal(STREMIO_NUVIO_MIGRATION_SOURCE, 'stremio')
  assert.equal(STREMIO_NUVIO_MIGRATION_DESTINATION, 'nuvio')
})
