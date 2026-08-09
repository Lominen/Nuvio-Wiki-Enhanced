import {
  SERVICE_DEFINITIONS,
  mediaAliasKeys,
  type BridgeScope,
  type MediaRef,
  type ServiceId
} from '../core.ts'
import { canonicalIdentityKey } from '../identity.ts'
import {
  createMediaBridgeVerificationCheckpoint,
  inspectDestinationMappings,
  pullMediaBridge,
  pullMediaBridgeForVerification,
  pushMediaBridge,
  type BridgeIssue
} from '../legacy-providers.ts'
import type {
  ProviderAdapter,
  ProviderWriteOptions,
  ProviderWriteResult,
  WriteReceipt
} from '../contracts.ts'

function scopeRecords(options: ProviderWriteOptions, scope: BridgeScope) {
  return options.bundle[scope]
}

function receiptRecordKey(scope: BridgeScope, record: any): string {
  const identity = canonicalIdentityKey(record.media) || 'unresolved'
  if (scope === 'history') {
    return `${scope}:${identity}:${Number(record.watchedAt) || 0}:${String(record.eventId || '')}`
  }
  return `${scope}:${identity}`
}

function issueForMedia(
  issues: readonly BridgeIssue[],
  scope: BridgeScope,
  media: MediaRef
): BridgeIssue | undefined {
  const key = canonicalIdentityKey(media)
  return issues.find(issue => (
    issue.scope === scope
    && issue.media
    && issueMediaMatches(issue.media, media, key)
    && issue.status !== 'note'
  ))
}

function issueMediaMatches(issueMedia: MediaRef, media: MediaRef, mediaKey: string | null): boolean {
  if (canonicalIdentityKey(issueMedia) === mediaKey) return true
  if (issueMedia.kind !== media.kind) return false
  const issueAliases = new Set(mediaAliasKeys(issueMedia))
  if (!mediaAliasKeys(media).some(alias => issueAliases.has(alias))) return false
  if (media.kind === 'movie') return true

  const sourceVideoId = String(media.videoId || '').trim()
  const issueVideoId = String(issueMedia.videoId || '').trim()
  if (sourceVideoId && issueVideoId && sourceVideoId === issueVideoId) return true
  if (
    Number.isInteger(media.season)
    && Number.isInteger(media.episode)
    && Number.isInteger(issueMedia.season)
    && Number.isInteger(issueMedia.episode)
  ) {
    return media.season === issueMedia.season && media.episode === issueMedia.episode
  }
  return issueMedia.season === undefined
    && issueMedia.episode === undefined
    && !issueVideoId
}

function receiptsFor(
  service: ServiceId,
  options: ProviderWriteOptions,
  result: Awaited<ReturnType<typeof pushMediaBridge>>
): WriteReceipt[] {
  const confirmed = new Set(result.confirmedScopes || [])
  const receipts: WriteReceipt[] = []
  for (const scope of ['history', 'progress', 'library'] as const) {
    if (!options.scopes[scope]) continue
    const records = scopeRecords(options, scope)
    let skippedRemaining = result.skipped?.[scope] || 0
    let writtenRemaining = result.written[scope] || 0
    records.forEach((record, index) => {
      const issue = issueForMedia(result.issues, scope, record.media)
      let status: WriteReceipt['status']
      if (issue || skippedRemaining > Math.max(0, records.length - index - 1)) {
        status = 'skipped'
        skippedRemaining = Math.max(0, skippedRemaining - 1)
      } else if (confirmed.has(scope) && writtenRemaining > 0) {
        status = 'confirmed'
        writtenRemaining--
      } else if (writtenRemaining > 0 || !confirmed.has(scope)) {
        status = 'accepted'
        writtenRemaining = Math.max(0, writtenRemaining - 1)
      } else {
        status = 'failed'
      }
      receipts.push({
        id: `${service}:${scope}:${index + 1}`,
        recordKey: receiptRecordKey(scope, record),
        scope,
        status,
        media: record.media,
        destinationKey: canonicalIdentityKey(record.media, { endpoint: options.connection }),
        code: issue?.code || (
          status === 'skipped'
            ? 'write_skipped'
            : status === 'failed'
              ? 'write_failed'
              : undefined
        ),
        reason: issue?.reason
      })
    })
  }
  return receipts
}

export function createLegacyProviderAdapter(service: ServiceId): ProviderAdapter {
  return {
    id: service,
    capabilities: SERVICE_DEFINITIONS[service].capabilities,
    snapshot: pullMediaBridge,
    resolveDestination(options) {
      return inspectDestinationMappings(
        options.connection,
        options.source,
        options.scopes,
        options.log,
        options.sourceConnection
      )
    },
    async write(options): Promise<ProviderWriteResult> {
      const result = await pushMediaBridge(options)
      return { ...result, receipts: receiptsFor(service, options, result) }
    },
    createCheckpoint: createMediaBridgeVerificationCheckpoint,
    verify: pullMediaBridgeForVerification
  }
}
