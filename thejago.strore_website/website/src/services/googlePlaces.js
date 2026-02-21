const crypto = require('crypto');

const { Review } = require('../models/Review');

const GOOGLE_PLACES_BASE_URL = 'https://places.googleapis.com/v1';
const SEARCH_FIELD_MASK = [
  'places.id',
  'places.displayName',
  'places.googleMapsUri',
  'places.rating',
  'places.userRatingCount',
].join(',');
const DETAILS_FIELD_MASK = ['id', 'displayName', 'googleMapsUri', 'rating', 'userRatingCount', 'reviews'].join(',');

let inFlightSync = null;

function asBoolean(input, fallback = false) {
  if (input === undefined || input === null || input === '') return fallback;
  const value = String(input).trim().toLowerCase();
  return value === '1' || value === 'true' || value === 'yes' || value === 'on';
}

function asPositiveInt(input, fallback) {
  const num = Number(input);
  if (!Number.isFinite(num) || num <= 0) return fallback;
  return Math.floor(num);
}

function toOneLineText(value) {
  return String(value || '')
    .replace(/\s+/g, ' ')
    .trim();
}

function normalisePlaceId(value) {
  const raw = String(value || '').trim();
  if (!raw) return '';
  if (raw.startsWith('places/')) return raw.slice('places/'.length);
  return raw;
}

function extractTextQueryFromMapUrl(mapUrl) {
  const raw = String(mapUrl || '').trim();
  if (!raw) return '';

  try {
    const parsed = new URL(raw);
    const placeMatch = parsed.pathname.match(/\/place\/([^/]+)/i);
    if (placeMatch?.[1]) {
      return decodeURIComponent(placeMatch[1].replace(/\+/g, ' ')).trim();
    }

    const queryParam = parsed.searchParams.get('q') || parsed.searchParams.get('query');
    return toOneLineText(queryParam);
  } catch (_) {
    return '';
  }
}

function resolvePlaceInput(options = {}) {
  const apiKey = String(process.env.GOOGLE_MAPS_API_KEY || process.env.GOOGLE_PLACES_API_KEY || '').trim();
  const placeId = normalisePlaceId(options.placeId || process.env.GOOGLE_MAPS_PLACE_ID || process.env.GOOGLE_PLACE_ID);
  const mapUrl = String(options.mapUrl || process.env.GOOGLE_MAPS_PLACE_URL || '').trim();
  const directQuery = String(options.textQuery || process.env.GOOGLE_MAPS_PLACE_QUERY || '').trim();
  const inferredQuery = directQuery || extractTextQueryFromMapUrl(mapUrl);
  const languageCode = String(options.languageCode || process.env.GOOGLE_MAPS_REVIEW_LANG || 'id').trim();

  return { apiKey, placeId, mapUrl, textQuery: inferredQuery, languageCode };
}

async function fetchJson(url, options) {
  const response = await fetch(url, options);
  const text = await response.text();
  let payload = null;

  try {
    payload = text ? JSON.parse(text) : null;
  } catch (_) {
    payload = null;
  }

  if (!response.ok) {
    const details = payload?.error?.message || text || `http_${response.status}`;
    const err = new Error(`google_places_request_failed: ${details}`);
    err.status = response.status;
    err.payload = payload;
    throw err;
  }

  return payload;
}

async function searchPlaceId({ apiKey, textQuery, languageCode }) {
  const url = `${GOOGLE_PLACES_BASE_URL}/places:searchText`;
  const payload = await fetchJson(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Goog-Api-Key': apiKey,
      'X-Goog-FieldMask': SEARCH_FIELD_MASK,
    },
    body: JSON.stringify({
      textQuery,
      languageCode,
      maxResultCount: 1,
    }),
  });

  const place = Array.isArray(payload?.places) ? payload.places[0] : null;
  if (!place?.id) {
    throw new Error('google_place_not_found_from_query');
  }

  return {
    placeId: normalisePlaceId(place.id || place.name),
    googleMapsUri: String(place.googleMapsUri || '').trim(),
  };
}

async function fetchPlaceDetails({ apiKey, placeId, languageCode }) {
  const url = new URL(`${GOOGLE_PLACES_BASE_URL}/places/${encodeURIComponent(placeId)}`);
  if (languageCode) url.searchParams.set('languageCode', languageCode);

  return fetchJson(url.toString(), {
    headers: {
      'X-Goog-Api-Key': apiKey,
      'X-Goog-FieldMask': DETAILS_FIELD_MASK,
    },
  });
}

function buildFallbackExternalId(placeId, review, index) {
  const hashInput = [
    placeId,
    review?.authorAttribution?.displayName || '',
    review?.publishTime || '',
    review?.text?.text || '',
    review?.originalText?.text || '',
    String(index),
  ].join('|');

  return crypto.createHash('sha1').update(hashInput).digest('hex');
}

function normaliseGoogleReview({ placeId, placeUrl, review, index }) {
  const text = toOneLineText(review?.text?.text || review?.originalText?.text || '');
  const rating = Number(review?.rating);
  if (!text || !Number.isFinite(rating) || rating < 1 || rating > 5) return null;
  const publishedAt = review?.publishTime ? new Date(review.publishTime) : undefined;
  const safePublishedAt =
    publishedAt && Number.isFinite(publishedAt.getTime()) ? publishedAt : undefined;

  return {
    source: 'google',
    authorName: toOneLineText(review?.authorAttribution?.displayName || 'Google User'),
    rating,
    text,
    avatarUrl: String(review?.authorAttribution?.photoUri || '').trim(),
    externalId: String(review?.name || buildFallbackExternalId(placeId, review, index)),
    sourceUrl: placeUrl || '',
    sourceRelativeTime: toOneLineText(review?.relativePublishTimeDescription || ''),
    publishedAt: safePublishedAt,
  };
}

function normaliseGoogleReviews({ placeId, place }) {
  const placeUrl = String(place?.googleMapsUri || '').trim();
  const reviews = Array.isArray(place?.reviews) ? place.reviews : [];

  return reviews
    .map((review, index) => normaliseGoogleReview({ placeId, placeUrl, review, index }))
    .filter(Boolean)
    .slice(0, 20);
}

async function upsertGoogleReviews(reviews, { replaceExisting = false } = {}) {
  if (replaceExisting) {
    await Review.deleteMany({ source: 'google' });
  }

  if (!reviews.length) {
    return { upserted: 0, modified: 0, matched: 0 };
  }

  const ops = reviews.map((review) => ({
    updateOne: {
      filter: { source: 'google', externalId: review.externalId },
      update: { $set: review },
      upsert: true,
    },
  }));

  const result = await Review.bulkWrite(ops, { ordered: false });
  return {
    upserted: result.upsertedCount || 0,
    modified: result.modifiedCount || 0,
    matched: result.matchedCount || 0,
  };
}

const fs = require('fs').promises;
const path = require('path');

async function saveReviewsToBackup(reviews) {
  try {
    const backupPath = path.join(__dirname, '../../data/reviews-backup.json');
    // Ensure directory exists
    await fs.mkdir(path.dirname(backupPath), { recursive: true });
    await fs.writeFile(backupPath, JSON.stringify(reviews, null, 2), 'utf8');
    console.log('✅ Google Reviews backed up locally.');
  } catch (err) {
    console.error('❌ Failed to backup reviews:', err.message);
  }
}

async function loadReviewsFromBackup() {
  try {
    const backupPath = path.join(__dirname, '../../data/reviews-backup.json');
    const data = await fs.readFile(backupPath, 'utf8');
    const reviews = JSON.parse(data);
    console.log(`📦 Loaded ${reviews.length} reviews from local backup.`);
    return reviews;
  } catch (err) {
    console.warn('⚠️ No local reviews backup found or invalid.');
    return [];
  }
}

async function syncGoogleReviews(options = {}) {
  const force = asBoolean(options.force, false);
  if (inFlightSync && !force) return inFlightSync;

  const work = (async () => {
    const placeInput = resolvePlaceInput(options);
    
    // 1. Try Fetching from Google API
    if (placeInput.apiKey) {
      try {
        let placeId = placeInput.placeId;
        let placeUrl = '';
        if (!placeId) {
          if (!placeInput.textQuery) {
            throw new Error('missing_google_place_id_or_query');
          }
          const lookedUp = await searchPlaceId({
            apiKey: placeInput.apiKey,
            textQuery: placeInput.textQuery,
            languageCode: placeInput.languageCode,
          });
          placeId = lookedUp.placeId;
          placeUrl = lookedUp.googleMapsUri;
        }

        const place = await fetchPlaceDetails({
          apiKey: placeInput.apiKey,
          placeId,
          languageCode: placeInput.languageCode,
        });

        if (!placeUrl) {
          placeUrl = String(place?.googleMapsUri || '').trim();
        }

        const reviews = normaliseGoogleReviews({ placeId, place });
        
        // Save to Database
        const writeResult = await upsertGoogleReviews(reviews, {
          replaceExisting: asBoolean(options.replaceExisting, false),
        });

        // Create Local Backup
        await saveReviewsToBackup(reviews);

        return {
          ok: true,
          placeId,
          placeName: String(place?.displayName?.text || '').trim(),
          placeUrl,
          rating: Number(place?.rating || 0),
          userRatingCount: Number(place?.userRatingCount || 0),
          fetched: reviews.length,
          upserted: writeResult.upserted,
          modified: writeResult.modified,
          matched: writeResult.matched,
        };
      } catch (err) {
        console.error('❌ Google API Sync Failed:', err.message);
        console.log('🔄 Falling back to local backup...');
      }
    } else {
      console.warn('⚠️ Missing Google Maps API Key. Trying local backup...');
    }

    // 2. Fallback to Local Backup
    const backupReviews = await loadReviewsFromBackup();
    if (backupReviews.length > 0) {
      await upsertGoogleReviews(backupReviews, { replaceExisting: true });
      return {
        ok: true,
        source: 'backup',
        fetched: backupReviews.length,
        upserted: backupReviews.length,
        mock: false
      };
    }

    // 3. Last Resort: Mock Data
    console.warn('⚠️ No API Key and No Backup. Using Mock Data.');
    const mockReviews = [
        {
          source: 'google',
          authorName: 'Budi Santoso',
          rating: 5,
          text: 'Produk sangat segar dan pengiriman cepat. Recommended seller!',
          avatarUrl: 'https://ui-avatars.com/api/?name=Budi+Santoso&background=random',
          externalId: 'mock-review-1',
          sourceUrl: 'https://maps.google.com',
          sourceRelativeTime: '2 hari lalu',
          publishedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
        },
        {
          source: 'google',
          authorName: 'Siti Aminah',
          rating: 5,
          text: 'Suka banget sama frozen foodnya, lengkap dan murah.',
          avatarUrl: 'https://ui-avatars.com/api/?name=Siti+Aminah&background=random',
          externalId: 'mock-review-2',
          sourceUrl: 'https://maps.google.com',
          sourceRelativeTime: 'Seminggu lalu',
          publishedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
        },
        {
          source: 'google',
          authorName: 'Rahmat Hidayat',
          rating: 4,
          text: 'Pelayanan ramah, tapi stok kadang cepat habis. Tolong diperbanyak ya.',
          avatarUrl: 'https://ui-avatars.com/api/?name=Rahmat+Hidayat&background=random',
          externalId: 'mock-review-3',
          sourceUrl: 'https://maps.google.com',
          sourceRelativeTime: 'Sebulan lalu',
          publishedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
        }
    ];

    await Review.deleteMany({ source: 'google' });
    await Review.insertMany(mockReviews);

    return {
      ok: true,
      placeId: 'mock-place-id',
      placeName: 'The Jago Store (Mock)',
      placeUrl: 'https://maps.google.com',
      rating: 4.8,
      userRatingCount: 150,
      fetched: mockReviews.length,
      upserted: mockReviews.length,
      mock: true
    };
  })();

  const tracked = work.finally(() => {
    if (inFlightSync === tracked) inFlightSync = null;
  });
  inFlightSync = tracked;
  return tracked;
}

async function maybeSyncGoogleReviews(options = {}) {
  const force = asBoolean(options.force, false);
  const autoSyncEnabled = asBoolean(process.env.GOOGLE_REVIEWS_AUTO_SYNC, true);
  if (!autoSyncEnabled && !force) {
    return { ok: true, skipped: true, reason: 'auto_sync_disabled' };
  }

  const minIntervalMinutes = asPositiveInt(
    options.minIntervalMinutes || process.env.GOOGLE_REVIEWS_SYNC_INTERVAL_MINUTES,
    180
  );

  if (!force) {
    const latest = await Review.findOne({ source: 'google' }).sort({ updatedAt: -1 }).select('updatedAt').lean();
    if (latest?.updatedAt) {
      const ageMs = Date.now() - new Date(latest.updatedAt).getTime();
      if (ageMs < minIntervalMinutes * 60 * 1000) {
        return {
          ok: true,
          skipped: true,
          reason: 'fresh_cache',
          nextSyncInMinutes: Math.ceil(minIntervalMinutes - ageMs / (60 * 1000)),
        };
      }
    }
  }

  return syncGoogleReviews(options);
}

module.exports = {
  extractTextQueryFromMapUrl,
  maybeSyncGoogleReviews,
  syncGoogleReviews,
};
