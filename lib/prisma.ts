import { Pool } from 'pg'
import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '@prisma/client'

// We changed this line to read from your .env file dynamically!
const connectionString = process.env.DATABASE_URL

const prismaClientSingleton = () => {
  // 1. Create a database connection pool
  const pool = new Pool({ connectionString })
  
  // 2. Wrap it in Prisma's adapter
  const adapter = new PrismaPg(pool)
  
  // 3. Pass the adapter to Prisma
  return new PrismaClient({ adapter })
}

declare global {
  var prisma: undefined | ReturnType<typeof prismaClientSingleton>
}

const prisma = globalThis.prisma ?? prismaClientSingleton()

export default prisma

if (process.env.NODE_ENV !== 'production') globalThis.prisma = prisma