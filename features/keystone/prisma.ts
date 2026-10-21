import { PrismaClient as BasePrismaClient } from '@prisma/client'
import { tenantScopedPrisma } from './tenant-scope'

/** Prisma client for processes outside Keystone's server (workers, scripts), scoped like Keystone's own client. */
export class PrismaClient extends BasePrismaClient {
  constructor(options: Record<string, unknown> = {}) {
    super(options as never)
    return tenantScopedPrisma(this) as this
  }
}

export { Prisma } from '@prisma/client'
