import assert from 'node:assert/strict'
import test from 'node:test'
import {
  canonicalIdentityKey,
  coalesceBundleIdentities,
  coalesceMediaRefs,
  identityAliasKeys
} from './media-bridge/identity.ts'
import { createEmptyBundle, type MediaRef } from './mediaBridgeCore.ts'

function movie(ids: MediaRef['ids'], title = 'Example', year = 2024): MediaRef {
  return { kind: 'movie', ids, title, year }
}

test('coalesces a transitive multi-alias component and keeps IMDb canonical', () => {
  const bundle = createEmptyBundle()
  bundle.progress.push(
    { media: movie({ imdb: 'tt100', tmdb: 100 }), percentage: 10, updatedAt: 100 },
    { media: movie({ tmdb: 100, trakt: 200 }), percentage: 20, updatedAt: 200 },
    { media: movie({ trakt: 200, simkl: 300 }), percentage: 30, updatedAt: 300 }
  )

  const coalesced = coalesceBundleIdentities(bundle).bundle
  assert.ok(coalesced.progress.every(record => record.media.ids.imdb === 'tt100'))
  assert.ok(coalesced.progress.every(record => record.media.ids.simkl === 300))
  assert.equal(canonicalIdentityKey(coalesced.progress[2].media), 'movie:imdb:tt100')
})

test('uses unique title/year only to bridge non-conflicting IMDb and TMDB identities', () => {
  const result = coalesceMediaRefs([
    movie({ imdb: 'tt200' }, 'Shared Title', 2020),
    movie({ tmdb: 200 }, 'Shared Title', 2020)
  ])
  assert.equal(result.conflicts.length, 0)
  assert.deepEqual(result.media[0].ids, { imdb: 'tt200', tmdb: 200 })
  assert.deepEqual(result.media[1].ids, { imdb: 'tt200', tmdb: 200 })

  const ambiguous = coalesceMediaRefs([
    movie({ imdb: 'tt201' }, 'Repeated', 2020),
    movie({ tmdb: 201 }, 'Repeated', 2020),
    movie({ tvdb: 201 }, 'Repeated', 2020)
  ])
  assert.deepEqual(ambiguous.media.map(item => Object.keys(item.ids).sort()), [
    ['imdb'],
    ['tmdb'],
    ['tvdb']
  ])
})

test('never compares equal numeric values across namespaces', () => {
  const result = coalesceMediaRefs([
    movie({ tmdb: 42 }, 'TMDB title', 2020),
    movie({ trakt: 42 }, 'Trakt title', 2021)
  ])
  assert.notEqual(result.keys[0], result.keys[1])
  assert.equal(result.media[0].ids.trakt, undefined)
  assert.equal(result.media[1].ids.tmdb, undefined)
})

test('rejects a shared-alias merge when another namespace conflicts', () => {
  const result = coalesceMediaRefs([
    movie({ imdb: 'tt301', tmdb: 301 }),
    movie({ imdb: 'tt302', tmdb: 301 })
  ])
  assert.equal(result.conflicts.length, 1)
  assert.deepEqual(result.conflicts[0].namespaces, ['imdb'])
  assert.deepEqual(result.conflicts[0].sharedAliases, ['movie:tmdb:301'])
  assert.match(result.conflicts[0].reason, /movie:tmdb:301/)
  assert.equal(result.media[0].ids.imdb, 'tt301')
  assert.equal(result.media[1].ids.imdb, 'tt302')
})

test('does not merge remakes through provider slugs', () => {
  const result = coalesceMediaRefs([
    movie({
      imdb: 'tt401',
      tmdb: 401,
      external: { simklslug: 'shared-title', letterslug: 'shared-title-2010' }
    }, 'Shared Title', 2010),
    movie({
      imdb: 'tt402',
      tmdb: 402,
      external: { simklslug: 'shared-title', letterslug: 'shared-title-2024' }
    }, 'Shared Title', 2024)
  ])

  assert.equal(result.conflicts.length, 0)
  assert.notEqual(result.keys[0], result.keys[1])
  assert.equal(result.media[0].ids.imdb, 'tt401')
  assert.equal(result.media[1].ids.imdb, 'tt402')
})

test('shares resolved IDs without replacing each record title', () => {
  const result = coalesceMediaRefs([
    movie({ imdb: 'tt501' }, 'Jumanji', 2024),
    movie({ imdb: 'tt501', tmdb: 501 }, 'Jumanji: Level One', 2024)
  ])

  assert.equal(result.conflicts.length, 0)
  assert.equal(result.media[0].title, 'Jumanji')
  assert.equal(result.media[1].title, 'Jumanji: Level One')
  assert.equal(result.media[0].ids.tmdb, 501)
  assert.equal(result.media[1].ids.tmdb, 501)
})

test('scopes Plex and Jellyfin local IDs to the connected server', () => {
  const plex = movie({ plex: 'item-1' }, '', 0)
  const aliasesA = identityAliasKeys(plex, {
    endpoint: { service: 'plex', accountId: 'one', serverId: 'server-a' }
  })
  const aliasesB = identityAliasKeys(plex, {
    endpoint: { service: 'plex', accountId: 'one', serverId: 'server-b' }
  })
  assert.notDeepEqual(aliasesA, aliasesB)

  const result = coalesceMediaRefs(
    [plex, plex],
    [
      { endpoint: { service: 'plex', accountId: 'one', serverId: 'server-a' } },
      { endpoint: { service: 'plex', accountId: 'one', serverId: 'server-b' } }
    ]
  )
  assert.notEqual(result.keys[0], result.keys[1])
})

test('keeps episode identities under their parent show aliases', () => {
  const first: MediaRef = {
    kind: 'series',
    ids: { imdb: 'tt400' },
    title: 'Series',
    year: 2024,
    season: 1,
    episode: 1
  }
  const second = { ...first, ids: { ...first.ids }, episode: 2 }
  assert.notEqual(canonicalIdentityKey(first), canonicalIdentityKey(second))
})

test('treats a namespaced destination content ID as the native provider identity', () => {
  const mapped: MediaRef = {
    kind: 'series',
    ids: { imdb: 'tt0944947' },
    destinationContentId: 'tmdb:1399',
    season: 1,
    episode: 1
  }
  const freshlyPulled: MediaRef = {
    kind: 'series',
    ids: { tmdb: 1399, stremio: 'tmdb:1399' },
    season: 1,
    episode: 1
  }

  assert.deepEqual(identityAliasKeys(mapped), [
    'series:tmdb:1399:season:1:episode:1',
    'series:imdb:tt0944947:season:1:episode:1'
  ])
  assert.equal(
    canonicalIdentityKey(mapped),
    'series:tmdb:1399:season:1:episode:1'
  )

  const result = coalesceMediaRefs([mapped, freshlyPulled])
  assert.equal(result.conflicts.length, 0)
  assert.deepEqual(result.keys, [
    'series:tmdb:1399:season:1:episode:1',
    'series:tmdb:1399:season:1:episode:1'
  ])
  assert.equal(result.media[0].ids.tmdb, 1399)
  assert.equal(result.media[1].ids.imdb, 'tt0944947')
})

test('keeps remapped Kitsu installments distinct despite shared source IDs and coordinates', () => {
  const firstInstallment: MediaRef = {
    kind: 'series',
    ids: { imdb: 'tt11126994', external: { kitsu: 45469 } },
    destinationContentId: 'kitsu:45469',
    season: 1,
    episode: 1
  }
  const secondInstallment: MediaRef = {
    ...firstInstallment,
    ids: { ...firstInstallment.ids, external: { ...firstInstallment.ids.external } },
    destinationContentId: 'kitsu:45515'
  }

  assert.equal(
    canonicalIdentityKey(firstInstallment),
    'series:stremio:kitsu%3A45469:season:1:episode:1'
  )
  assert.equal(
    canonicalIdentityKey(secondInstallment),
    'series:stremio:kitsu%3A45515:season:1:episode:1'
  )

  const result = coalesceMediaRefs([firstInstallment, secondInstallment])
  assert.deepEqual(result.keys, [
    'series:stremio:kitsu%3A45469:season:1:episode:1',
    'series:stremio:kitsu%3A45515:season:1:episode:1'
  ])
  assert.equal(result.conflicts.length, 1)
  assert.deepEqual(result.conflicts[0].namespaces, ['stremio'])
})
