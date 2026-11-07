import { PrismaClient as BasePrismaClient } from '@prisma/client'
import { tenantScopedPrisma } from './tenant-scope'
import { pooledDatabaseUrl, POOL_SIZES } from './database-url'

/** Prisma client for processes outside Keystone's server (workers, scripts), scoped like Keystone's own client. */
export class PrismaClient extends BasePrismaClient {
  constructor(options: Record<string, unknown> & { pool?: keyof typeof POOL_SIZES } = {}) {
    const { pool = 'worker', ...rest } = options
    const callerChoseDatasource = rest.datasourceUrl !== undefined || rest.datasources !== undefined
    const datasourceUrl = callerChoseDatasource ? undefined : pooledDatabaseUrl(process.env.DATABASE_URL, pool)
    super({ ...rest, ...(datasourceUrl ? { datasourceUrl } : {}) } as never)
    return tenantScopedPrisma(this) as this
  }
}

export { Prisma } from '@prisma/client'
