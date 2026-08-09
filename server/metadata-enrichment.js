export const MAX_METADATA_BATCH_ITEMS = 1_000;
export const DEFAULT_METADATA_BATCH_CONCURRENCY = 24;

function abortError(message = 'The operation was aborted.') {
  const error = new Error(message);
  error.name = 'AbortError';
  return error;
}

function normalizeTmdbId(value) {
  const normalized = value == null ? '' : String(value).trim();
  return /^[1-9]\d{0,11}$/.test(normalized) ? normalized : null;
}

function normalizeImdbId(value) {
  const normalized = value == null ? '' : String(value).trim().toLowerCase();
  return /^tt\d{1,12}$/.test(normalized) ? normalized : null;
}

function safeText(value, maxLength) {
  if (value == null) return null;
  const text = String(value).trim();
  return text ? text.slice(0, maxLength) : null;
}

function normalizeRuntimeMs(value) {
  const runtimeMs = Number(value);
  return Number.isFinite(runtimeMs) && runtimeMs > 0 ? Math.round(runtimeMs) : null;
}

function normalizeItem(item) {
  const value = item && typeof item === 'object' && !Array.isArray(item) ? item : {};
  const type = value.content_type === 'movie' ? 'movie' : 'series';
  const tmdbId = normalizeTmdbId(value._ids?.tmdb);
  const imdbId = normalizeImdbId(value._ids?.imdb);
  const contentId = typeof value.content_id === 'number'
    ? value.content_id
    : safeText(value.content_id, 256);

  return {
    contentId,
    type,
    name: safeText(value.name, 256) || 'Untitled',
    tmdbId,
    imdbId,
    keys: [
      tmdbId ? `${type}:tmdb:${tmdbId}` : null,
      imdbId ? `${type}:imdb:${imdbId}` : null
    ].filter(Boolean)
  };
}

function metadataIdentityGroups(items) {
  const pairKeysByAlias = new Map();
  const groups = new Map();

  for (const item of items) {
    if (!item.tmdbId || !item.imdbId) continue;
    const pairKey = `${item.type}:pair:${item.tmdbId}:${item.imdbId}`;
    for (const alias of item.keys) {
      const pairKeys = pairKeysByAlias.get(alias) || new Set();
      pairKeys.add(pairKey);
      pairKeysByAlias.set(alias, pairKeys);
    }
  }

  function groupKey(item) {
    if (item.tmdbId && item.imdbId) {
      return `${item.type}:pair:${item.tmdbId}:${item.imdbId}`;
    }
    const alias = item.keys[0];
    const pairKeys = pairKeysByAlias.get(alias);
    return pairKeys?.size === 1 ? [...pairKeys][0] : `${alias}:only`;
  }

  for (const item of items) {
    if (item.keys.length === 0) continue;
    const key = groupKey(item);
    const group = groups.get(key) || {
      items: [],
      keys: new Set(),
      tmdbId: null,
      imdbId: null
    };
    group.items.push(item);
    item.keys.forEach(alias => group.keys.add(alias));
    group.tmdbId ||= item.tmdbId;
    group.imdbId ||= item.imdbId;
    groups.set(key, group);
  }

  const conflictingKeys = new Set(
    [...pairKeysByAlias]
      .filter(([, pairKeys]) => pairKeys.size > 1)
      .map(([alias]) => alias)
  );
  return { groups: [...groups.values()], conflictingKeys };
}

function cachedValueMatchesGroup(value, group) {
  const cachedTmdbId = normalizeTmdbId(value?.resolvedTmdbId);
  const cachedImdbId = normalizeImdbId(value?.resolvedImdbId);
  return (!group.tmdbId || !cachedTmdbId || group.tmdbId === cachedTmdbId)
    && (!group.imdbId || !cachedImdbId || group.imdbId === cachedImdbId);
}

function publicResult(contentId, value, fromCache = false) {
  return {
    content_id: contentId,
    tmdbId: normalizeTmdbId(value.resolvedTmdbId),
    imdbId: normalizeImdbId(value.resolvedImdbId),
    posterUrl: value.posterUrl || null,
    backgroundUrl: value.backgroundUrl || null,
    description: value.description || null,
    releaseDate: value.releaseDate || null,
    imdbRating: Number.isFinite(value.imdbRating) ? value.imdbRating : null,
    runtimeMs: normalizeRuntimeMs(value.runtimeMs),
    genres: Array.isArray(value.genres) ? value.genres : [],
    source: value.source,
    ...(value.retryable ? { retryable: true } : {}),
    ...(fromCache ? { fromCache: true } : {})
  };
}

function summarize(results, uniqueFetches) {
  const summary = {
    enriched: 0,
    fallback: 0,
    missing: 0,
    failed: 0,
    cached: 0,
    uniqueFetches
  };

  for (const result of results) {
    if (result.fromCache) summary.cached++;
    if (result.source === 'tmdb') summary.enriched++;
    else if (result.source === 'cinemeta') summary.fallback++;
    else if (result.source === 'missing') summary.missing++;
    else summary.failed++;
  }
  return summary;
}

export function validateMetadataBatch(items, maxItems = MAX_METADATA_BATCH_ITEMS) {
  if (!Array.isArray(items)) {
    const error = new Error('items array is required');
    error.status = 400;
    throw error;
  }
  if (items.length > maxItems) {
    const error = new Error(`A maximum of ${maxItems} metadata items is allowed per batch.`);
    error.status = 413;
    throw error;
  }
  return items;
}

/**
 * FIFO scheduler shared by every request. It bounds both concurrent sockets and
 * request start rate so large browser batches cannot stampede upstream APIs.
 */
export function createRequestScheduler({
  maxConcurrent = 12,
  minTimeMs = 30,
  maxQueue = 2_000
} = {}) {
  const queue = [];
  let active = 0;
  let nextStartAt = 0;
  let timer = null;

  function scheduleDrain(delay = 0) {
    if (timer) return;
    timer = setTimeout(() => {
      timer = null;
      drain();
    }, delay);
  }

  function drain() {
    while (queue.length && queue[0].cancelled) queue.shift();
    if (active >= maxConcurrent || queue.length === 0) return;

    const wait = Math.max(0, nextStartAt - Date.now());
    if (wait > 0) {
      scheduleDrain(wait);
      return;
    }

    const item = queue.shift();
    if (item.cancelled) {
      drain();
      return;
    }

    item.started = true;
    if (item.signal && item.onAbort) item.signal.removeEventListener('abort', item.onAbort);
    active++;
    nextStartAt = Date.now() + minTimeMs;

    Promise.resolve()
      .then(item.task)
      .then(item.resolve, item.reject)
      .finally(() => {
        active--;
        drain();
      });

    drain();
  }

  function schedule(task, { signal } = {}) {
    if (signal?.aborted) return Promise.reject(abortError());
    if (queue.length >= maxQueue) {
      const error = new Error('Metadata upstream queue is temporarily full.');
      error.name = 'OverloadError';
      error.status = 503;
      return Promise.reject(error);
    }

    return new Promise((resolve, reject) => {
      const item = { task, signal, resolve, reject, started: false, cancelled: false, onAbort: null };
      item.onAbort = () => {
        if (item.started || item.cancelled) return;
        item.cancelled = true;
        reject(abortError());
        drain();
      };
      signal?.addEventListener('abort', item.onAbort, { once: true });
      queue.push(item);
      drain();
    });
  }

  return { schedule };
}

export function createMetadataEnricher({
  cache,
  fetchMetadata,
  concurrency = DEFAULT_METADATA_BATCH_CONCURRENCY
}) {
  if (!cache || typeof cache.getMany !== 'function' || typeof cache.setMany !== 'function') {
    throw new Error('A metadata cache is required.');
  }
  if (typeof fetchMetadata !== 'function') throw new Error('fetchMetadata must be a function.');

  async function enrich(items, { signal } = {}) {
    const normalizedItems = validateMetadataBatch(items).map(normalizeItem);
    const allKeys = normalizedItems.flatMap(item => item.keys);
    const cachedValues = cache.getMany(allKeys);
    const { groups, conflictingKeys } = metadataIdentityGroups(normalizedItems);
    const tasks = [];
    const preparedByItem = new Map();

    for (const item of normalizedItems) {
      if (item.keys.length === 0) {
        preparedByItem.set(item, { item, value: {
          posterUrl: null,
          backgroundUrl: null,
          description: null,
          releaseDate: null,
          imdbRating: null,
          runtimeMs: null,
          genres: [],
          source: 'missing'
        } });
      }
    }

    for (const group of groups) {
      const cachedValue = [...group.keys]
        .filter(key => !conflictingKeys.has(key))
        .map(key => cachedValues.get(key))
        .find(value => value && cachedValueMatchesGroup(value, group));
      if (cachedValue) {
        for (const item of group.items) {
          preparedByItem.set(item, { item, value: cachedValue, fromCache: true });
        }
        continue;
      }

      const representative = group.items.find(item => item.tmdbId && item.imdbId)
        || group.items[0];
      const task = {
        ...representative,
        tmdbId: group.tmdbId,
        imdbId: group.imdbId,
        keys: [...group.keys],
        result: null
      };
      tasks.push(task);
      for (const item of group.items) {
        preparedByItem.set(item, { item, task });
      }
    }

    const prepared = normalizedItems.map(item => preparedByItem.get(item));
    let nextTask = 0;

    async function worker() {
      while (nextTask < tasks.length) {
        const task = tasks[nextTask++];
        if (signal?.aborted) {
          task.result = {
            posterUrl: null,
            backgroundUrl: null,
            description: null,
            releaseDate: null,
            imdbRating: null,
            runtimeMs: null,
            genres: [],
            resolvedTmdbId: task.tmdbId,
            resolvedImdbId: task.imdbId,
            source: 'failed',
            cacheable: false,
            retryable: true
          };
          continue;
        }

        try {
          const fetched = await fetchMetadata(task, { signal });
          task.result = {
            posterUrl: fetched?.posterUrl || null,
            backgroundUrl: fetched?.backgroundUrl || null,
            description: fetched?.description || null,
            releaseDate: fetched?.releaseDate || null,
            imdbRating: Number.isFinite(Number(fetched?.imdbRating))
              ? Number(fetched.imdbRating)
              : null,
            runtimeMs: normalizeRuntimeMs(fetched?.runtimeMs),
            genres: Array.isArray(fetched?.genres)
              ? fetched.genres.filter(genre => typeof genre === 'string' && genre.trim()).slice(0, 64)
              : [],
            source: ['tmdb', 'cinemeta'].includes(fetched?.source) ? fetched.source : 'failed',
            resolvedTmdbId: normalizeTmdbId(fetched?.resolvedTmdbId) || task.tmdbId,
            resolvedImdbId: normalizeImdbId(fetched?.resolvedImdbId) || task.imdbId,
            cacheable: fetched?.cacheable !== false,
            retryable: fetched?.retryable === true
          };
        } catch (error) {
          const retryable = ['AbortError', 'TimeoutError', 'TypeError'].includes(error?.name)
            || signal?.aborted;
          task.result = {
            posterUrl: null,
            backgroundUrl: null,
            description: null,
            releaseDate: null,
            imdbRating: null,
            runtimeMs: null,
            genres: [],
            resolvedTmdbId: task.tmdbId,
            resolvedImdbId: task.imdbId,
            source: 'failed',
            cacheable: !retryable,
            retryable
          };
        }

      }
    }

    const workers = Array.from(
      { length: Math.min(concurrency, tasks.length) },
      () => worker()
    );
    await Promise.all(workers);

    const cacheCandidates = new Map();
    for (const task of tasks) {
      if (!task.result?.cacheable) continue;
      const value = {
        posterUrl: task.result.posterUrl,
        backgroundUrl: task.result.backgroundUrl,
        description: task.result.description,
        releaseDate: task.result.releaseDate,
        imdbRating: task.result.imdbRating,
        runtimeMs: task.result.runtimeMs,
        genres: task.result.genres,
        resolvedTmdbId: task.result.resolvedTmdbId,
        resolvedImdbId: task.result.resolvedImdbId,
        source: task.result.source,
        updatedAt: Date.now()
      };
      const resolvedKeys = [
        task.result.resolvedTmdbId
          ? `${task.type}:tmdb:${task.result.resolvedTmdbId}`
          : null,
        task.result.resolvedImdbId
          ? `${task.type}:imdb:${task.result.resolvedImdbId}`
          : null
      ].filter(key => key && !conflictingKeys.has(key));
      for (const key of resolvedKeys) {
        const candidates = cacheCandidates.get(key) || [];
        candidates.push(value);
        cacheCandidates.set(key, candidates);
      }
    }

    const cacheWrites = new Map(
      [...cacheCandidates]
        .filter(([, candidates]) => candidates.length === 1)
        .map(([key, candidates]) => [key, candidates[0]])
    );
    cache.setMany(cacheWrites);

    const results = prepared.map(entry => {
      if (entry.value) {
        return publicResult(entry.item.contentId, {
          ...entry.value,
          resolvedTmdbId: entry.value.resolvedTmdbId || entry.item.tmdbId,
          resolvedImdbId: entry.value.resolvedImdbId || entry.item.imdbId
        }, entry.fromCache);
      }
      return publicResult(
        entry.item.contentId,
        entry.task.result || { posterUrl: null, releaseDate: null, source: 'failed' }
      );
    });

    return { results, summary: summarize(results, tasks.length) };
  }

  return { enrich };
}
