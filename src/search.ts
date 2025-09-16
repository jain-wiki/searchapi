
import { Item } from './schema/item.ts';
import { Geolocation } from './schema/geolocation.ts'
import { Text } from './schema/text.ts'

import { Hono } from 'hono'
import { z } from 'zod'
import { zValidator } from '@hono/zod-validator';

export const searchRoute = new Hono()

searchRoute.post('/',
  zValidator('query',
    z.object({
      q: z.string().min(1).max(100).optional(), // Search Query
      place: z.string().min(1).max(100).optional(), // Place Item ID
      sect: z.string().min(1).max(100).optional(), // Section Item ID
      instanceOf: z.string().min(1).max(100).optional(), // Instance Of Item ID

      // User Location or Map Center
      latitude: z.number().min(-90).max(90).optional(),
      longitude: z.number().min(-180).max(180).optional(),
      // Pagination
      limit: z.number().min(1).max(100).default(10).optional(), // Result Limit
      offset: z.number().min(0).max(1000).default(0).optional(), // Result Offset

    })),
  async (c) => {
    const validQuery = c.req.valid('query');

    const {
      q, place, sect, instanceOf,
      latitude, longitude,
      limit, offset } = validQuery


    // Implement SQL search logic here using the validated parameters



    return c.json({
      success: true,
      message: ``,
      data: [],
      query: validQuery
    });

  });
