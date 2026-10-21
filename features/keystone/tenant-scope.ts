import { AsyncLocalStorage } from 'node:async_hooks'

const tenantStorage = new AsyncLocalStorage<string | null>()
const modelOperations = new Set(['aggregate', 'count', 'create', 'createMany', 'delete', 'deleteMany', 'findFirst', 'findFirstOrThrow', 'findMany', 'findUnique', 'findUniqueOrThrow', 'groupBy', 'update', 'updateMany', 'upsert'])
const rawOperations = new Set(['$executeRaw', '$executeRawUnsafe', '$queryRaw', '$queryRawUnsafe'])

type TenantWork<T> = () => T

export function runWithTenantScope<T>(tenantId: string | null, work: TenantWork<T>): T {
  return tenantStorage.run(tenantId, work)
}

export function currentTenantScope(): string | null {
  return tenantStorage.getStore() ?? null
}

export function enterTenantScope(tenantId: string): void {
  tenantStorage.enterWith(tenantId)
}

async function setLocalTenant(tx: any, tenantId: string | null) {
  await tx.$queryRaw`SELECT set_config('app.tenant_id', ${tenantId ?? ''}, true)`
}

/**
 * Every standalone Prisma operation is run in a short transaction with a
 * transaction-local tenant GUC. Explicit interactive transactions set the GUC
 * once and pass the raw Prisma transaction client through unchanged.
 */
export function tenantScopedPrisma<Client extends object>(client: Client): Client {
  const base = client as any
  const withLocalTenant = async (tenantId: string | null, work: (tx: any) => Promise<any>) =>
    base.$transaction(async (tx: any) => {
      await setLocalTenant(tx, tenantId)
      return work(tx)
    })

  return new Proxy(base, {
    get(target, property, receiver) {
      if (property === '$transaction') {
        return (work: any, options?: any) => {
          const tenantId = tenantStorage.getStore()
          if (tenantId === undefined) return target.$transaction.call(target, work, options)
          if (Array.isArray(work)) {
            const setTenant = target.$queryRaw`SELECT set_config('app.tenant_id', ${tenantId ?? ''}, true)`
            return target.$transaction.call(target, [setTenant, ...work], options).then((results: any[]) => results.slice(1))
          }
          return target.$transaction.call(target, async (tx: any) => {
            await setLocalTenant(tx, tenantId)
            return work(tx)
          }, options)
        }
      }

      if (typeof property === 'string' && rawOperations.has(property)) {
        return (...args: any[]) => {
          const tenantId = tenantStorage.getStore()
          if (tenantId === undefined) return target[property](...args)
          return withLocalTenant(tenantId, (tx) => tx[property](...args))
        }
      }

      const value = Reflect.get(target, property, receiver)
      if (typeof property === 'string' && value && typeof value === 'object' && [...modelOperations].some((operation) => typeof value[operation] === 'function')) {
        return new Proxy(value, {
          get(delegate, operation, delegateReceiver) {
            const method = Reflect.get(delegate, operation, delegateReceiver)
            if (typeof operation !== 'string' || !modelOperations.has(operation) || typeof method !== 'function') return method
            return (...args: any[]) => {
              const tenantId = tenantStorage.getStore()
              if (tenantId === undefined) return method.apply(delegate, args)
              return withLocalTenant(tenantId, (tx) => tx[property][operation](...args))
            }
          },
        })
      }
      return typeof value === 'function' ? value.bind(target) : value
    },
  })
}
