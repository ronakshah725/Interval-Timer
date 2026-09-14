import { PrismaClient } from '@prisma/client'
import { PrismaNeon } from '@prisma/adapter-neon'

// Workers-compatible Prisma client: Neon's serverless HTTP driver (fetch-based,
// no TCP sockets, no native query engine) instead of the Node-only adapter-pg.

let cached: PrismaClient | undefined

function getConnectionString(): string {
  // Read env lazily per request: Cloudflare Workers inject env vars at request
  // time, so a module-scope read would be `undefined` on the edge.
  const connectionString = process.env.POSTGRES_PRISMA_URL
  if (!connectionString) {
    throw new Error('POSTGRES_PRISMA_URL is not set')
  }
  return connectionString
}

export function getPrisma(): PrismaClient {
  if (!cached) {
    const adapter = new PrismaNeon({ connectionString: getConnectionString() })
    cached = new PrismaClient({ adapter })
  }
  return cached
}
