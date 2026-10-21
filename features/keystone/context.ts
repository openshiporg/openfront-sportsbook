import { getContext } from '@keystone-6/core/context'
import config from './index'
import { type Context } from '.keystone/types'
import * as PrismaModule from '@prisma/client'

// Next can evaluate this module in multiple route/RSC bundles. Keep one context
// per Node process in every environment so each bundle does not open a Prisma pool.
const globalForKeystone = globalThis as typeof globalThis & { keystoneContext?: Context }
export const keystoneContext: Context =
  globalForKeystone.keystoneContext ?? getContext(config, PrismaModule)
globalForKeystone.keystoneContext = keystoneContext