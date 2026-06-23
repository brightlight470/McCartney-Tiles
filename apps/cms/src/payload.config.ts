import path from 'path'
import { fileURLToPath } from 'url'
import { buildConfig } from 'payload'
import { postgresAdapter } from '@payloadcms/db-postgres'
import { sqliteAdapter } from '@payloadcms/db-sqlite'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import sharp from 'sharp'

import { Accounts } from './collections/Accounts'
import { Media } from './collections/Media'
import { Suppliers } from './collections/Suppliers'
import { Ranges } from './collections/Ranges'
import { Products } from './collections/Products'
import { Stock } from './collections/Stock'
import { Prices } from './collections/Prices'
import { Testimonials } from './collections/Testimonials'
import { Projects } from './collections/Projects'
import { Faqs } from './collections/Faqs'
import { Showrooms } from './collections/Showrooms'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

export default buildConfig({
  admin: {
    user: Accounts.slug,
    importMap: { baseDir: path.resolve(dirname) },
    meta: { titleSuffix: '· McCartney Tiles' },
  },
  collections: [
    Accounts,
    Media,
    Suppliers,
    Ranges,
    Products,
    Stock,
    Prices,
    Testimonials,
    Projects,
    Faqs,
    Showrooms,
  ],
  editor: lexicalEditor(),
  // Postgres is the production/default adapter. DATABASE_ADAPTER=sqlite selects a
  // local file DB for development on machines without Docker/Postgres (no schema/prod change).
  db:
    process.env.DATABASE_ADAPTER === 'sqlite'
      ? sqliteAdapter({
          client: { url: process.env.SQLITE_URL ?? 'file:./mccartney-dev.db' },
        })
      : postgresAdapter({
          pool: { connectionString: process.env.DATABASE_URI ?? '' },
        }),
  secret: process.env.PAYLOAD_SECRET ?? '',
  typescript: { outputFile: path.resolve(dirname, 'payload-types.ts') },
  sharp,
})
