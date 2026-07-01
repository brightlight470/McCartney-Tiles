/**
 * One-off: drop the deprecated per-size columns from `products` via raw SQL, so the DB matches the
 * final (colour-level) schema and Payload's dev push has nothing to drop (its interactive
 * data-loss confirmation can't be answered from a non-TTY script). Run after migrate:colours.
 *
 * Run: pnpm --filter @mccartney/cms exec tsx src/drop-legacy-size-cols.ts
 */
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { Pool } from 'pg'

const dirname = path.dirname(fileURLToPath(import.meta.url))
const MCC = path.resolve(dirname, '../../..')

async function main(): Promise<void> {
  try {
    process.loadEnvFile?.(path.join(MCC, '.env'))
  } catch {
    /* ambient env */
  }
  const pool = new Pool({ connectionString: process.env.DATABASE_URI })
  await pool.query(`
    ALTER TABLE products
      DROP COLUMN IF EXISTS size_mm,
      DROP COLUMN IF EXISTS size_band,
      DROP COLUMN IF EXISTS thickness_mm,
      DROP COLUMN IF EXISTS tiles_per_box,
      DROP COLUMN IF EXISTS m2_per_box,
      DROP COLUMN IF EXISTS tiles_per_m2;
  `)
  await pool.query('DROP TYPE IF EXISTS enum_products_size_band;')
  console.log('Dropped legacy per-size columns + enum from products.')
  await pool.end()
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
