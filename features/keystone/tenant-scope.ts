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

/**
 * Keystone 6.5's own Prisma extension catches every query error, logs it and *returns* it as a GraphQLError
 * (code KS_PRISMA_ERROR) instead of throwing. Inside a transaction that means a failed update or a unique
 * conflict does not stop the writer: later statements run (and a P2025 "not found" leaves the transaction
 * committable), conflicts never reach the serializable retry, and the resolver ends in "Unexpected error.".
 * Every result therefore passes through here and the original Prisma error is thrown again.
 */
export function rethrowKeystonePrismaError<T>(value: T): T {
  const extensions = (value as any)?.extensions
  if (!(value instanceof Error) || extensions?.code !== 'KS_PRISMA_ERROR') return value
  const prisma = extensions.prisma ?? {}
  const message = typeof extensions.debug?.message === 'string' ? extensions.debug.message : value.message.replace(/^Prisma error:?\s*/, '')
  throw Object.assign(new Error(message), prisma, { name: prisma.name ?? 'PrismaClientError', code: prisma.code, meta: prisma.meta })
}
const rethrowing = (work: Promise<any> | any) => (work && typeof work.then === 'function' ? work.then(rethrowKeystonePrismaError) : rethrowKeystonePrismaError(work))

/** A transaction client whose model and raw operations throw instead of returning Keystone's error value. */
function throwingClient(tx: any): any {
  return new Proxy(tx, {
    get(target, property, receiver) {
      const value = Reflect.get(target, property, receiver)
      if (typeof property === 'string' && rawOperations.has(property) && typeof value === 'function') return (...args: any[]) => rethrowing(value.apply(target, args))
      if (typeof property === 'string' && value && typeof value === 'object' && [...modelOperations].some((operation) => typeof value[operation] === 'function')) {
        return new Proxy(value, {
          get(delegate, operation, delegateReceiver) {
            const method = Reflect.get(delegate, operation, delegateReceiver)
            if (typeof operation !== 'string' || !modelOperations.has(operation) || typeof method !== 'function') return method
            return (...args: any[]) => rethrowing(method.apply(delegate, args))
          },
        })
      }
      return typeof value === 'function' ? value.bind(target) : value
    },
  })
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
          const settle = (results: any[]) => results.map(rethrowKeystonePrismaError)
          if (Array.isArray(work)) {
            if (tenantId === undefined) return target.$transaction.call(target, work, options).then(settle)
            const setTenant = target.$queryRaw`SELECT set_config('app.tenant_id', ${tenantId ?? ''}, true)`
            return target.$transaction.call(target, [setTenant, ...work], options).then((results: any[]) => settle(results.slice(1)))
          }
          if (tenantId === undefined) return target.$transaction.call(target, (tx: any) => work(throwingClient(tx)), options)
          return target.$transaction.call(target, async (tx: any) => {
            await setLocalTenant(tx, tenantId)
            return work(throwingClient(tx))
          }, options)
        }
      }

      if (typeof property === 'string' && rawOperations.has(property)) {
        return (...args: any[]) => {
          const tenantId = tenantStorage.getStore()
          if (tenantId === undefined) return rethrowing(target[property](...args))
          return withLocalTenant(tenantId, (tx) => rethrowing(tx[property](...args)))
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
              if (tenantId === undefined) return rethrowing(method.apply(delegate, args))
              return withLocalTenant(tenantId, (tx) => rethrowing(tx[property][operation](...args)))
            }
          },
        })
      }
      return typeof value === 'function' ? value.bind(target) : value
    },
  })
}
