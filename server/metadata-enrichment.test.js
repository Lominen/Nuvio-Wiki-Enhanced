import test from 'node:test';
import assert from 'node:assert/strict';
import {
  createMetadataEnricher,
  createRequestScheduler,
  MAX_METADATA_BATCH_ITEMS,
  validateMetadataBatch
} from './metadata-enrichment.js';

function createMemoryCache(initial = []) {
  const values = new Map(initial);
  return {
    values,
    getMany: keys => new Map(keys.filter(key => values.has(key)).map(key => [key, values.get(key)])),
    setMany: entries => {
      for (const [key, value] of entries) values.set(key, value);
    }
  };
}

test('accepts full-sized batches and rejects work beyond the explicit cap', () => {
  const fullBatch = Array.from({ length: MAX_METADATA_BATCH_ITEMS }, () => ({}));
  assert.equal(validateMetadataBatch(fullBatch).length, MAX_METADATA_BATCH_ITEMS);
  assert.throws(
    () => validateMetadataBatch([...fullBatch, {}]),
    error => error.status === 413 && /maximum/.test(error.message)
  );
});

test('bulk-loads cache hits without making upstream calls', async () => {
  const cache = createMemoryCache([['movie:tmdb:11', {
    posterUrl: 'poster',
    releaseDate: '1977-05-25',
    resolvedTmdbId: '11',
    resolvedImdbId: 'tt0076759',
    source: 'tmdb'
  }]]);
  let fetches = 0;
  const enricher = createMetadataEnricher({
    cache,
    fetchMetadata: async () => {
      fetches++;
      return { source: 'failed' };
    }
  });

  const output = await enricher.enrich([{
    content_id: 'tt0076759',
    content_type: 'movie',
    _ids: { tmdb: 11 }
  }]);

  assert.equal(fetches, 0);
  assert.equal(output.results[0].posterUrl, 'poster');
  assert.equal(output.results[0].tmdbId, '11');
  assert.equal(output.results[0].imdbId, 'tt0076759');
  assert.equal(output.results[0].fromCache, true);
  assert.equal(output.summary.cached, 1);
});

test('deduplicates repeated IDs and writes all aliases in one batch', async () => {
  const cache = createMemoryCache();
  let fetches = 0;
  const enricher = createMetadataEnricher({
    cache,
    fetchMetadata: async item => {
      fetches++;
      return {
        posterUrl: 'poster',
        backgroundUrl: 'background',
        description: 'Description',
        releaseDate: '2020-01-01',
        imdbRating: 8.4,
        runtimeMs: 7_200_000,
        genres: ['Drama'],
        source: 'tmdb',
        resolvedTmdbId: item.tmdbId,
        resolvedImdbId: item.imdbId
      };
    }
  });
  const repeated = Array.from({ length: 100 }, (_, index) => ({
    content_id: `item-${index}`,
    content_type: 'movie',
    _ids: { tmdb: 99, imdb: 'tt0000099' }
  }));

  const output = await enricher.enrich(repeated);

  assert.equal(fetches, 1);
  assert.equal(output.results.length, 100);
  assert.equal(output.summary.uniqueFetches, 1);
  assert.equal(output.results[0].backgroundUrl, 'background');
  assert.equal(output.results[0].description, 'Description');
  assert.equal(output.results[0].imdbRating, 8.4);
  assert.equal(output.results[0].runtimeMs, 7_200_000);
  assert.deepEqual(output.results[0].genres, ['Drama']);
  assert.equal(output.results[0].tmdbId, '99');
  assert.equal(output.results[0].imdbId, 'tt0000099');
  assert.equal(cache.values.has('movie:tmdb:99'), true);
  assert.equal(cache.values.has('movie:imdb:tt0000099'), true);
});

test('coalesces TMDB-only, IMDb-only, and bridge items into one identity task', async () => {
  const cache = createMemoryCache();
  const fetched = [];
  const enricher = createMetadataEnricher({
    cache,
    fetchMetadata: async item => {
      fetched.push({ tmdbId: item.tmdbId, imdbId: item.imdbId });
      return {
        posterUrl: 'transitive-poster',
        source: 'tmdb',
        resolvedTmdbId: item.tmdbId,
        resolvedImdbId: item.imdbId
      };
    }
  });

  const output = await enricher.enrich([
    { content_id: 'tmdb-only', content_type: 'movie', _ids: { tmdb: 550 } },
    { content_id: 'imdb-only', content_type: 'movie', _ids: { imdb: 'tt0137523' } },
    {
      content_id: 'bridge-last',
      content_type: 'movie',
      _ids: { tmdb: 550, imdb: 'tt0137523' }
    }
  ]);

  assert.deepEqual(fetched, [{ tmdbId: '550', imdbId: 'tt0137523' }]);
  assert.equal(output.summary.uniqueFetches, 1);
  assert.deepEqual(
    output.results.map(result => [result.tmdbId, result.imdbId, result.posterUrl]),
    Array.from({ length: 3 }, () => ['550', 'tt0137523', 'transitive-poster'])
  );
  assert.equal(cache.values.has('movie:tmdb:550'), true);
  assert.equal(cache.values.has('movie:imdb:tt0137523'), true);
});

test('does not cross-cache aliases shared by conflicting identifier pairs', async () => {
  const cache = createMemoryCache();
  let fetches = 0;
  const enricher = createMetadataEnricher({
    cache,
    concurrency: 3,
    fetchMetadata: async item => {
      fetches++;
      if (item.imdbId === 'tt0000001') {
        await new Promise(resolve => setTimeout(resolve, 10));
      }
      return {
        posterUrl: `poster-${item.imdbId || 'tmdb'}`,
        source: 'tmdb',
        resolvedTmdbId: item.tmdbId,
        resolvedImdbId: item.imdbId
      };
    }
  });

  const output = await enricher.enrich([
    {
      content_id: 'pair-a',
      content_type: 'movie',
      _ids: { tmdb: 42, imdb: 'tt0000001' }
    },
    {
      content_id: 'pair-b',
      content_type: 'movie',
      _ids: { tmdb: 42, imdb: 'tt0000002' }
    },
    { content_id: 'ambiguous-tmdb', content_type: 'movie', _ids: { tmdb: 42 } }
  ]);

  assert.equal(fetches, 3);
  assert.equal(output.summary.uniqueFetches, 3);
  assert.equal(cache.values.has('movie:tmdb:42'), false);
  assert.equal(cache.values.get('movie:imdb:tt0000001')?.posterUrl, 'poster-tt0000001');
  assert.equal(cache.values.get('movie:imdb:tt0000002')?.posterUrl, 'poster-tt0000002');

  await enricher.enrich([
    { content_id: 'tmdb-retry', content_type: 'movie', _ids: { tmdb: 42 } }
  ]);
  assert.equal(fetches, 4);
});

test('does not cache a supplied alias contradicted by the resolved identity', async () => {
  const cache = createMemoryCache();
  const enricher = createMetadataEnricher({
    cache,
    fetchMetadata: async item => ({
      source: 'tmdb',
      resolvedTmdbId: item.tmdbId,
      resolvedImdbId: 'tt7654321'
    })
  });

  const output = await enricher.enrich([{
    content_id: 'bad-pair',
    content_type: 'movie',
    _ids: { tmdb: 777, imdb: 'tt1234567' }
  }]);

  assert.equal(output.results[0].imdbId, 'tt7654321');
  assert.equal(cache.values.has('movie:tmdb:777'), true);
  assert.equal(cache.values.has('movie:imdb:tt7654321'), true);
  assert.equal(cache.values.has('movie:imdb:tt1234567'), false);
});

test('returns and caches the corresponding IMDb ID for a TMDB-only item', async () => {
  const cache = createMemoryCache();
  const enricher = createMetadataEnricher({
    cache,
    fetchMetadata: async item => ({
      source: 'tmdb',
      resolvedTmdbId: item.tmdbId,
      resolvedImdbId: 'tt2015381'
    })
  });

  const output = await enricher.enrich([{
    content_id: 'lookup-1',
    content_type: 'movie',
    _ids: { tmdb: 118340 }
  }]);

  assert.equal(output.results[0].tmdbId, '118340');
  assert.equal(output.results[0].imdbId, 'tt2015381');
  assert.equal(cache.values.has('movie:tmdb:118340'), true);
  assert.equal(cache.values.has('movie:imdb:tt2015381'), true);
});

test('marks deadline-aborted work as retryable and does not cache it', async () => {
  const cache = createMemoryCache();
  const controller = new AbortController();
  controller.abort();
  const enricher = createMetadataEnricher({
    cache,
    fetchMetadata: async () => {
      throw new Error('should not run');
    }
  });

  const output = await enricher.enrich([{
    content_id: 'item',
    content_type: 'series',
    _ids: { imdb: 'tt1234567' }
  }], { signal: controller.signal });

  assert.equal(output.results[0].retryable, true);
  assert.equal(cache.values.size, 0);
});

test('processes libraries larger than 20k across bounded server batches', async () => {
  const cache = createMemoryCache();
  const enricher = createMetadataEnricher({
    cache,
    fetchMetadata: async item => ({
      posterUrl: `poster-${item.tmdbId}`,
      releaseDate: null,
      source: 'tmdb',
      resolvedTmdbId: item.tmdbId
    })
  });
  const library = Array.from({ length: 20_400 }, (_, index) => ({
    content_id: `item-${index + 1}`,
    content_type: index % 2 ? 'movie' : 'series',
    _ids: { tmdb: index + 1 }
  }));

  let resultCount = 0;
  for (let offset = 0; offset < library.length; offset += MAX_METADATA_BATCH_ITEMS) {
    const output = await enricher.enrich(library.slice(offset, offset + MAX_METADATA_BATCH_ITEMS));
    resultCount += output.results.length;
  }

  assert.equal(resultCount, library.length);
  assert.equal(cache.values.size, library.length);
});

test('globally bounds concurrent upstream work', async () => {
  const scheduler = createRequestScheduler({ maxConcurrent: 2, minTimeMs: 0 });
  let active = 0;
  let peak = 0;

  await Promise.all(Array.from({ length: 8 }, (_, index) => scheduler.schedule(async () => {
    active++;
    peak = Math.max(peak, active);
    await new Promise(resolve => setTimeout(resolve, 5));
    active--;
    return index;
  })));

  assert.equal(peak, 2);
});

test('rejects overload instead of allowing an unbounded upstream queue', async () => {
  const scheduler = createRequestScheduler({ maxConcurrent: 1, minTimeMs: 0, maxQueue: 1 });
  let releaseFirst;
  const first = scheduler.schedule(() => new Promise(resolve => {
    releaseFirst = resolve;
  }));
  const second = scheduler.schedule(async () => 'second');

  await assert.rejects(
    scheduler.schedule(async () => 'overflow'),
    error => error.name === 'OverloadError' && error.status === 503
  );

  releaseFirst('first');
  assert.deepEqual(await Promise.all([first, second]), ['first', 'second']);
});
