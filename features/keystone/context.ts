import { getContext } from '@keystone-6/core/context'
import config from './index'
import { type Context } from '.keystone/types'
import * as PrismaModule from '@prisma/client'
import { pooledDatabaseUrl } from './database-url'

// Next can evaluate this module in multiple route/RSC bundles. Keep one context
// per Node process in every environment so each bundle does not open a Prisma pool.
const globalForKeystone = globalThis as typeof globalThis & { keystoneContext?: Context }
export const keystoneContext: Context =
  globalForKeystone.keystoneContext ?? getContext({
    ...config,
    // Apply runtime connection policy at the actual client boundary too.
    db: { ...config.db, url: pooledDatabaseUrl(process.env.DATABASE_URL ?? config.db.url, 'web')! },
  }, PrismaModule)
globalForKeystone.keystoneContext = keystoneContext