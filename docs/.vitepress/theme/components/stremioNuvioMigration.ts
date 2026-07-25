import {
  summarizeRoute,
  type CanonicalBundle,
  type ConnectedEndpoint,
  type SyncScopes
} from './mediaBridgeCore.ts'
import {
  planMediaBridgePreview,
  type MediaBridgePreviewPlan,
  type ProviderMappingIssue
} from './mediaBridgePlan.ts'
import {
  invalidateNuvioMetadataCaches,
  nuvioRest,
  nuvioRpc,
  stremioRequest,
  type BridgeConnection
} from './mediaBridgeProviders.ts'

export const STREMIO_NUVIO_MIGRATION_SOURCE = 'stremio' as const
export const STREMIO_NUVIO_MIGRATION_DESTINATION = 'nuvio' as const

export const STREMIO_NUVIO_MIGRATION_SCOPES: Readonly<SyncScopes> = Object.freeze({
  history: true,
  progress: true,
  library: true
})

export interface StremioNuvioMigrationPlanInput {
  source: CanonicalBundle
  destination: CanonicalBundle
  scopes?: Partial<SyncScopes>
  sourceEndpoint?: ConnectedEndpoint
  destinationEndpoint?: ConnectedEndpoint
  destinationDuplicateAliases?: readonly string[]
  mappingIssues?: readonly ProviderMappingIssue[]
}

export interface StremioNuvioMigrationPlan {
  route: ReturnType<typeof summarizeRoute>
  scopes: SyncScopes
  preview: MediaBridgePreviewPlan
}

export interface StremioAddonDescriptor {
  manifest?: {
    id?: unknown
    name?: unknown
  }
  transportUrl?: unknown
}

export interface NuvioAddonRecord {
  url: string
  name: string
  enabled: boolean
  sort_order: number
}

export interface SkippedStremioAddon {
  name: string
  reason: string
}

export interface StremioNuvioAddonPlan {
  sourceCount: number
  destinationCount: number
  additions: NuvioAddonRecord[]
  merged: NuvioAddonRecord[]
  skipped: SkippedStremioAddon[]
}

export interface StremioNuvioAddonMigrationResult {
  plan: StremioNuvioAddonPlan
  written: number
  verified: boolean
}

export interface StremioNuvioAddonMigrationApi {
  readStremio(connection: BridgeConnection): Promise<unknown>
  readNuvio(connection: BridgeConnection): Promise<unknown>
  replaceNuvio(connection: BridgeConnection, addons: readonly NuvioAddonRecord[]): Promise<void>
}

export function resolveStremioNuvioMigrationScopes(
  requested: Partial<SyncScopes> = {}
): SyncScopes {
  return {
    history: requested.history ?? STREMIO_NUVIO_MIGRATION_SCOPES.history,
    progress: requested.progress ?? STREMIO_NUVIO_MIGRATION_SCOPES.progress,
    library: requested.library ?? STREMIO_NUVIO_MIGRATION_SCOPES.library
  }
}

export function planStremioNuvioMigration(
  input: StremioNuvioMigrationPlanInput
): StremioNuvioMigrationPlan {
  const scopes = resolveStremioNuvioMigrationScopes(input.scopes)
  return {
    route: summarizeRoute(
      STREMIO_NUVIO_MIGRATION_SOURCE,
      STREMIO_NUVIO_MIGRATION_DESTINATION,
      scopes
    ),
    scopes,
    preview: planMediaBridgePreview({
      source: input.source,
      destination: input.destination,
      scopes,
      destinationService: STREMIO_NUVIO_MIGRATION_DESTINATION,
      sourceEndpoint: input.sourceEndpoint,
      destinationEndpoint: input.destinationEndpoint,
      destinationDuplicateAliases: input.destinationDuplicateAliases,
      mappingIssues: input.mappingIssues
    })
  }
}

function recordValue(value: unknown): Record<string, any> {
  return value && typeof value === 'object' && !Array.isArray(value)
    ? value as Record<string, any>
    : {}
}

function addonRows(value: unknown, service: 'Stremio' | 'Nuvio'): unknown[] {
  if (Array.isArray(value)) return value
  const record = recordValue(value)
  if (Array.isArray(record.addons)) return record.addons
  throw new Error(`${service} returned an unexpected add-on list; nothing was changed.`)
}

export function canonicalAddonUrl(value: unknown): string {
  const raw = String(value ?? '').trim()
  if (!raw) return ''
  try {
    const parsed = new URL(raw)
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') return ''
    parsed.hash = ''
    parsed.pathname = parsed.pathname
      .replace(/\/manifest\.json\/?$/i, '')
      .replace(/\/+$/, '') || '/'
    return parsed.toString()
  } catch {
    return ''
  }
}

function isLoopbackAddonUrl(value: string): boolean {
  const hostname = new URL(value).hostname.toLowerCase().replace(/^\[|\]$/g, '')
  return hostname === 'localhost'
    || hostname.endsWith('.localhost')
    || hostname === '::1'
    || /^127(?:\.\d{1,3}){3}$/.test(hostname)
}

function descriptorName(descriptor: StremioAddonDescriptor, index: number): string {
  const manifest = recordValue(descriptor.manifest)
  return String(manifest.name || manifest.id || '').trim()
    || `Stremio add-on ${index + 1}`
}

function destinationAddon(
  value: unknown,
  index: number
): NuvioAddonRecord {
  const addon = recordValue(value)
  const url = canonicalAddonUrl(addon.url)
  if (!url) {
    throw new Error(`Nuvio add-on ${index + 1} has an invalid URL; nothing was changed.`)
  }
  return {
    url,
    name: String(addon.name || '').trim() || new URL(url).hostname,
    enabled: addon.enabled !== false,
    sort_order: index
  }
}

export function planStremioNuvioAddons(
  sourceValue: unknown,
  destinationValue: unknown
): StremioNuvioAddonPlan {
  const source = addonRows(sourceValue, 'Stremio')
  const destination = addonRows(destinationValue, 'Nuvio')
    .map(destinationAddon)
  const merged = destination.map(addon => ({ ...addon }))
  const additions: NuvioAddonRecord[] = []
  const skipped: SkippedStremioAddon[] = []
  const identities = new Set(merged.map(addon => canonicalAddonUrl(addon.url)))

  source.forEach((value, index) => {
    const descriptor = recordValue(value) as StremioAddonDescriptor
    const name = descriptorName(descriptor, index)
    const url = canonicalAddonUrl(descriptor.transportUrl)
    if (!url) {
      skipped.push({ name, reason: 'Its transport URL is not a supported HTTP(S) add-on URL.' })
      return
    }
    if (isLoopbackAddonUrl(url)) {
      skipped.push({ name, reason: 'Localhost add-ons only work inside the Stremio installation that created them.' })
      return
    }
    if (identities.has(url)) return

    const addon: NuvioAddonRecord = {
      url,
      name,
      enabled: true,
      sort_order: merged.length
    }
    identities.add(url)
    additions.push(addon)
    merged.push(addon)
  })

  return {
    sourceCount: source.length,
    destinationCount: destination.length,
    additions,
    merged,
    skipped
  }
}

function assertAddonConnections(
  source: BridgeConnection,
  destination: BridgeConnection
): number {
  if (source.service !== STREMIO_NUVIO_MIGRATION_SOURCE) {
    throw new Error('Add-on migration requires a connected Stremio source.')
  }
  if (destination.service !== STREMIO_NUVIO_MIGRATION_DESTINATION) {
    throw new Error('Add-on migration requires a connected Nuvio destination.')
  }
  return nuvioAddonProfileId(destination)
}

function nuvioAddonProfileId(destination: BridgeConnection): number {
  if (destination.service !== STREMIO_NUVIO_MIGRATION_DESTINATION) {
    throw new Error('Add-on migration requires a connected Nuvio destination.')
  }
  const profileId = Number(destination.profileId)
  if (!Number.isInteger(profileId) || profileId < 1) {
    throw new Error('Choose a Nuvio profile before migrating add-ons.')
  }
  return profileId
}

const defaultAddonMigrationApi: StremioNuvioAddonMigrationApi = {
  readStremio(connection) {
    return stremioRequest(connection, '/addonCollectionGet', {
      type: 'AddonCollectionGet',
      update: false
    })
  },
  readNuvio(connection) {
    const profileId = nuvioAddonProfileId(connection)
    return nuvioRest(connection, 'addons', {
      select: '*',
      profile_id: `eq.${profileId}`,
      order: 'sort_order'
    })
  },
  async replaceNuvio(connection, addons) {
    const profileId = nuvioAddonProfileId(connection)
    await nuvioRpc(connection, 'sync_push_addons', {
      p_profile_id: profileId,
      p_addons: addons
    })
  }
}

export async function previewStremioNuvioAddons(
  source: BridgeConnection,
  destination: BridgeConnection,
  api: StremioNuvioAddonMigrationApi = defaultAddonMigrationApi
): Promise<StremioNuvioAddonPlan> {
  assertAddonConnections(source, destination)
  const [stremio, nuvio] = await Promise.all([
    api.readStremio(source),
    api.readNuvio(destination)
  ])
  return planStremioNuvioAddons(stremio, nuvio)
}

export async function migrateStremioNuvioAddons(
  source: BridgeConnection,
  destination: BridgeConnection,
  api: StremioNuvioAddonMigrationApi = defaultAddonMigrationApi
): Promise<StremioNuvioAddonMigrationResult> {
  const plan = await previewStremioNuvioAddons(source, destination, api)
  if (!plan.additions.length) {
    return { plan, written: 0, verified: true }
  }

  await api.replaceNuvio(destination, plan.merged)
  invalidateNuvioMetadataCaches(destination)
  const verifiedRows = addonRows(await api.readNuvio(destination), 'Nuvio')
  const verifiedIdentities = new Set(verifiedRows.map(value => (
    canonicalAddonUrl(recordValue(value).url)
  )))
  const missing = plan.additions.filter(addon => !verifiedIdentities.has(addon.url))
  if (missing.length) {
    throw new Error(`Nuvio did not confirm ${missing.length} migrated add-on${missing.length === 1 ? '' : 's'}.`)
  }

  return {
    plan,
    written: plan.additions.length,
    verified: true
  }
}
