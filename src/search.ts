import { db } from './db.ts';

import { Hono } from 'hono'
import { z } from 'zod'
import { zValidator } from '@hono/zod-validator';
import { sql } from 'drizzle-orm';

export const searchRoute = new Hono()

searchRoute.get('/',
  zValidator('query',
    z.object({
      q: z.string().min(1).max(100).optional(), // Search Query
      place: z.string().min(1).max(5).uppercase().trim().optional(), // Place Item ID
      sect: z.string().min(1).max(5).uppercase().trim().optional(), // Section Item ID
      deity: z.string().min(1).max(5).uppercase().trim().optional(), // Deity Item ID
      instanceOf: z.string().min(1).max(5).uppercase().trim().optional(), // Instance Of Item ID

      // User Location or Map Center
      latitude: z.number().min(-90).max(90).optional(),
      longitude: z.number().min(-180).max(180).optional(),
      radius: z.number().min(0).max(10000).default(1000).optional(), // in meters (max 10 km)
      // Pagination
      limit: z.number().min(1).max(100).default(20).optional(), // Result Limit
      offset: z.number().min(0).max(1000).default(0).optional(), // Result Offset

    })),
  async (c) => {
    const validQuery = c.req.valid('query');

    const {
      q, place, sect, deity, instanceOf,
      latitude, longitude, radius,
      limit, offset } = validQuery

    try {
      let results: any[] = [];

      // Check if we have text search parameters
      const hasTextSearch = q || place || sect || deity || instanceOf;

      // Check if we have geolocation parameters
      const hasGeoSearch = latitude !== undefined && longitude !== undefined;

      if (hasTextSearch && hasGeoSearch) {
        // Combined search: text search with geolocation filtering
        results = await performCombinedSearch({
          q, place, sect, deity, instanceOf,
          latitude, longitude, radius,
          limit, offset
        });
      } else if (hasTextSearch) {
        // Text-only search
        results = await performTextSearch({
          q, place, sect, deity, instanceOf,
          limit, offset
        });
      } else if (hasGeoSearch) {
        // Geolocation-only search
        results = await performGeoSearch({
          latitude, longitude, radius,
          limit, offset
        });
      } else {
        // No search parameters provided
        return c.json({
          success: false,
          message: 'Please provide either search text (q, place, sect, deity, instanceOf) or location (latitude, longitude)',
          data: [],
          query: validQuery
        });
      }

      return c.json({
        success: true,
        message: `Found ${results.length} results`,
        data: results,
        query: validQuery
      });

    } catch (error) {
      console.error('Search error:', error);
      return c.json({
        success: false,
        message: 'Internal server error during search',
        data: [],
        query: validQuery
      }, 500);
    }

  });

// Helper function for text-only search
async function performTextSearch(params: {
  q?: string;
  place?: string;
  sect?: string;
  deity?: string;
  instanceOf?: string;
  limit?: number;
  offset?: number;
}) {
  const { q, place, sect, deity, instanceOf, limit = 10, offset = 0 } = params;

  // Build FTS5 query string
  let ftsQuery = '';
  const queryParts: string[] = [];

  if (q) {
    queryParts.push(`name:${q}`);
  }
  if (place) {
    queryParts.push(`place:${place}`);
  }
  if (sect) {
    queryParts.push(`sect:${sect}`);
  }
  if (deity) {
    queryParts.push(`deity:${deity}`);
  }
  if (instanceOf) {
    queryParts.push(`typeof:${instanceOf}`);
  }

  if (queryParts.length === 0) {
    return [];
  }

  ftsQuery = queryParts.join(' AND ');

  // Execute FTS5 search with join to item table
  const results = await db.all(sql`
    SELECT i.id, i.d, t.name, t.place, t.deity, t.sect, t.typeof
    FROM textsearch t
    JOIN item i ON t.id = i.id
    WHERE textsearch MATCH ${ftsQuery}
    ORDER BY rank
    LIMIT ${limit} OFFSET ${offset}
  `);

  return results;
}

// Helper function for geolocation-only search
async function performGeoSearch(params: {
  latitude: number;
  longitude: number;
  radius?: number;
  limit?: number;
  offset?: number;
}) {
  const { latitude, longitude, radius = 1000, limit = 10, offset = 0 } = params;

  // Convert radius from meters to degrees (approximate)
  // 1 degree ≈ 111,000 meters
  const radiusDegrees = radius / 111000;

  const minLat = latitude - radiusDegrees;
  const maxLat = latitude + radiusDegrees;
  const minLng = longitude - radiusDegrees;
  const maxLng = longitude + radiusDegrees;

  // Execute R-tree spatial search with join to item table
  const results = await db.all(sql`
    SELECT i.id, i.d, g.minX, g.maxX, g.minY, g.maxY
    FROM geolocation g
    JOIN item i ON g.id = i.id
    WHERE g.minX <= ${maxLng} AND g.maxX >= ${minLng}
      AND g.minY <= ${maxLat} AND g.maxY >= ${minLat}
    LIMIT ${limit} OFFSET ${offset}
  `);

  return results;
}

// Helper function for combined search (text + geolocation)
async function performCombinedSearch(params: {
  q?: string;
  place?: string;
  sect?: string;
  deity?: string;
  instanceOf?: string;
  latitude: number;
  longitude: number;
  radius?: number;
  limit?: number;
  offset?: number;
}) {
  const {
    q, place, sect, deity, instanceOf,
    latitude, longitude, radius = 1000,
    limit = 10, offset = 0
  } = params;

  // Build FTS5 query string (same as text search)
  let ftsQuery = '';
  const queryParts: string[] = [];

  if (q) {
    queryParts.push(`name:${q}*`);
  }
  if (place) {
    queryParts.push(`place:${place}`);
  }
  if (sect) {
    queryParts.push(`sect:${sect}`);
  }
  if (deity) {
    queryParts.push(`deity:${deity}`);
  }
  if (instanceOf) {
    queryParts.push(`typeof:${instanceOf}`);
  }

  if (queryParts.length === 0) {
    // If no text search params, fall back to geo-only search
    return performGeoSearch({ latitude, longitude, radius, limit, offset });
  }

  ftsQuery = queryParts.join(' AND ');

  // Convert radius from meters to degrees
  const radiusDegrees = radius / 111000;
  const minLat = latitude - radiusDegrees;
  const maxLat = latitude + radiusDegrees;
  const minLng = longitude - radiusDegrees;
  const maxLng = longitude + radiusDegrees;

  // Execute combined search: FTS5 + R-tree spatial search
  const results = await db.all(sql`
    SELECT i.id, i.d, t.name, t.place, t.deity, t.sect, t.typeof,
           g.minX, g.maxX, g.minY, g.maxY
    FROM textsearch t
    JOIN item i ON t.id = i.id
    JOIN geolocation g ON i.id = g.id
    WHERE textsearch MATCH ${ftsQuery}
      AND g.minX <= ${maxLng} AND g.maxX >= ${minLng}
      AND g.minY <= ${maxLat} AND g.maxY >= ${minLat}
    ORDER BY rank
    LIMIT ${limit} OFFSET ${offset}
  `);

  return results;
}
