import assert from 'node:assert/strict'
import { spawnSync } from 'node:child_process'
import { cpSync, mkdtempSync, mkdirSync, readdirSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join, resolve } from 'node:path'
import { PrismaClient } from '../../keystone/prisma'
import { assertEphemeralDatabaseUrl, verifyDatabaseMigrationContract } from './verify-migration-contract'

const prismaCli = resolve('node_modules/prisma/build/index.js')

function deploy(schema: string, databaseUrl: string, config?: string) {
  const args = [prismaCli, 'migrate', 'deploy', '--schema', schema]
  if (config) args.push('--config', config)
  const result = spawnSync(process.execPath, args, {
    cwd: resolve('.'),
    env: { ...process.env, DATABASE_URL: databaseUrl },
    encoding: 'utf8',
  })
  assert.equal(result.status, 0, `Migration deploy failed:\n${result.stdout}\n${result.stderr}`)
  return result.stdout
}

async function main() {
  const databaseUrl = process.env.DATABASE_URL
  const database = assertEphemeralDatabaseUrl(databaseUrl, 'DATABASE_URL')
  const prisma = new PrismaClient()
  const temp = mkdtempSync(join(tmpdir(), 'sportsbook-retained-upgrade-'))
  try {
    const [{ migrationTable }] = await prisma.$queryRaw<Array<{ migrationTable: string | null }>>`SELECT to_regclass('public._prisma_migrations')::text AS "migrationTable"`
    assert.equal(migrationTable, null, 'Retained-upgrade verification requires an empty database')

    const schemaPath = join(temp, 'schema.prisma')
    const migrationRoot = join(temp, 'migrations')
    mkdirSync(migrationRoot)
    writeFileSync(schemaPath, `datasource postgresql {\n  provider = "postgresql"\n}\n\ngenerator client {\n  provider = "prisma-client"\n  output = "./generated"\n}\n`)
    const configPath = join(temp, 'prisma.config.ts')
    writeFileSync(configPath, `export default { schema: ${JSON.stringify(schemaPath)}, migrations: { path: ${JSON.stringify(migrationRoot)} }, datasource: { url: process.env.DATABASE_URL } }\n`)
    cpSync(resolve('migrations/migration_lock.toml'), join(migrationRoot, 'migration_lock.toml'))
    const starterMigrations = readdirSync(resolve('migrations'), { withFileTypes: true })
      .filter(entry => entry.isDirectory() && entry.name < '20260817175949_sportsbook_backend_core')
      .map(entry => entry.name)
      .sort()
    assert.equal(starterMigrations.length, 7, 'Representative starter migration count changed; review upgrade fixture')
    for (const migration of starterMigrations) cpSync(resolve('migrations', migration), join(migrationRoot, migration), { recursive: true })
    deploy(schemaPath, databaseUrl!, configPath)

    await prisma.$executeRawUnsafe(`INSERT INTO "Role" (id,name,"canCreateTodos","canManageAllTodos") VALUES ('retained-role','Retained role',true,true)`)
    await prisma.$executeRawUnsafe(`INSERT INTO "User" (id,name,email,password,role) VALUES ('retained-user','Retained user','retained-upgrade@test.local','not-a-runtime-credential','retained-role')`)
    await prisma.$executeRawUnsafe(`INSERT INTO "Todo" (id,label,"assignedTo") VALUES ('retained-todo','preserve me','retained-user')`)
    await prisma.$executeRawUnsafe(`INSERT INTO "TodoImage" (id,"imagePath","altText") VALUES ('retained-image','legacy/path','preserve image')`)
    await prisma.$executeRawUnsafe(`INSERT INTO "_Todo_todoImages" ("A","B") VALUES ('retained-todo','retained-image')`)

    deploy(resolve('schema.prisma'), databaseUrl!)

    const retained = await prisma.retainedStarterTodo.findUnique({
      where: { id: 'retained-todo' },
      include: { assignedTo: true, imageLinks: { include: { image: true } } },
    })
    assert.equal(retained?.label, 'preserve me')
    assert.equal(retained?.assignedTo?.email, 'retained-upgrade@test.local')
    assert.equal(retained?.imageLinks[0]?.image.altText, 'preserve image')
    const contract = await verifyDatabaseMigrationContract(prisma)
    process.stdout.write(`${JSON.stringify({ status: 'valid', database, starterMigrations: starterMigrations.length, retainedTodo: retained.id, ...contract })}\n`)
  } finally {
    await prisma.$disconnect()
    rmSync(temp, { recursive: true, force: true })
  }
}

main().catch(error => {
  process.stderr.write(`${error instanceof Error ? error.stack : String(error)}\n`)
  process.exitCode = 1
})
