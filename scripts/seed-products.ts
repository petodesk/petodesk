/**
 * One-off product seed for a single company.
 *
 * Usage:
 *   npm run seed:products -- --company=<company_uuid> --owner=<owner_profile_uuid> --dry-run
 *   npm run seed:products -- --company=<company_uuid> --owner=<owner_profile_uuid>
 *
 * Optional: --file=path/to/Product.csv   (default: ./Product.csv)
 */
import { readFileSync, writeFileSync } from 'node:fs'
import { parseArgs } from 'node:util'
import { parse } from 'csv-parse/sync'
import { createClient } from '@supabase/supabase-js'

const BATCH_SIZE = 100

// ---------- args & env ----------
const { values } = parseArgs({
  options: {
    company: { type: 'string' },
    owner: { type: 'string' },
    file: { type: 'string', default: 'Product.csv' },
    'dry-run': { type: 'boolean', default: false },
  },
})

const companyId = values.company
const ownerId = values.owner
const dryRun = values['dry-run']!
const file = values.file!

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
if (!companyId || !UUID.test(companyId)) fail('Provide a valid --company=<uuid>')
if (!ownerId || !UUID.test(ownerId)) fail('Provide a valid --owner=<uuid>')

const url = process.env.NEXT_PUBLIC_SUPABASE_URL
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
if (!url || !serviceKey) fail('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local')

function fail(msg: string): never {
  console.error(`\n✗ ${msg}\n`)
  process.exit(1)
}

// ---------- read & clean ----------
type Row = Record<string, string>
const rows: Row[] = parse(readFileSync(file, 'utf8'), {
  columns: true,
  skip_empty_lines: true,
  trim: true,
  bom: true,
})

type Item = { name: string; selling_price: number; quantity: number }
const invalid: { line: number; reason: string; row: Row }[] = []
const grouped = new Map<string, { name: string; prices: Set<number>; quantity: number; lines: number[] }>()

rows.forEach((r, i) => {
  const line = i + 2 // +1 header, +1 for 1-based
  const name = String(r['Item Name'] ?? '').replace(/\s+/g, ' ').trim()
  const price = Number(String(r['Price'] ?? '').replace(/,/g, ''))
  const qty = Number(String(r['Quantity Added'] ?? '').replace(/,/g, ''))

  if (!name) return void invalid.push({ line, reason: 'Missing name', row: r })
  if (!Number.isFinite(price) || price <= 0) return void invalid.push({ line, reason: 'Invalid price', row: r })
  if (!Number.isFinite(qty) || qty < 0) return void invalid.push({ line, reason: 'Invalid quantity', row: r })

  const key = name.toLowerCase()
  const g = grouped.get(key)
  if (g) {
    g.prices.add(price)
    g.quantity += qty
    g.lines.push(line)
  } else {
    grouped.set(key, { name, prices: new Set([price]), quantity: qty, lines: [line] })
  }
})

const items: Item[] = []
const conflicts: { name: string; prices: number[]; lines: number[] }[] = []
let merged = 0

for (const g of grouped.values()) {
  if (g.prices.size > 1) {
    // Same name, different prices: don't guess, let the owner decide
    conflicts.push({ name: g.name, prices: [...g.prices], lines: g.lines })
    continue
  }
  if (g.lines.length > 1) merged += g.lines.length - 1
  items.push({ name: g.name, selling_price: [...g.prices][0], quantity: g.quantity })
}

console.log(`\nFile:               ${file}`)
console.log(`Rows read:          ${rows.length}`)
console.log(`Invalid rows:       ${invalid.length}`)
console.log(`Duplicates merged:  ${merged} (same name + price, quantities added)`)
console.log(`Price conflicts:    ${conflicts.length} (skipped, see seed-report.json)`)
console.log(`Ready to insert:    ${items.length}`)

if (dryRun) {
  console.log('\nDRY RUN: nothing written. Remove --dry-run to insert.\n')
  writeFileSync('seed-report.json', JSON.stringify({ invalid, conflicts }, null, 2))
  process.exit(0)
}

// ---------- insert ----------
async function main() {
  const supabase = createClient(url!, serviceKey!, { auth: { persistSession: false } })

  // Safety check: the company and owner must exist and match
  const { data: owner, error: ownerErr } = await supabase
    .from('profiles')
    .select('id, company_id')
    .eq('id', ownerId)
    .single()
  if (ownerErr || !owner) fail(`Owner profile not found: ${ownerErr?.message ?? ownerId}`)
  if (owner.company_id !== companyId) fail('That owner does not belong to that company. Check the two ids.')

  const runId = Date.now().toString(36)
  let inserted = 0
  const skippedExisting: string[] = []
  const failedBatches: { batch: number; error: string }[] = []

  for (let i = 0; i < items.length; i += BATCH_SIZE) {
    const batchNo = i / BATCH_SIZE + 1
    const payload = items.slice(i, i + BATCH_SIZE).map((it, idx) => ({
      ...it,
      barcode: `IMP-${runId}-${i + idx + 1}`,
    }))

    const { data, error } = await supabase.rpc('seed_import_products', {
      p_company_id: companyId,
      p_added_by: ownerId,
      p_items: payload,
    })

    if (error) {
      failedBatches.push({ batch: batchNo, error: error.message })
      console.error(`  ✗ Batch ${batchNo} failed (rolled back): ${error.message}`)
      continue
    }
    inserted += data.inserted
    skippedExisting.push(...data.skipped)
    console.log(`  ✓ Batch ${batchNo}: ${data.inserted} inserted, ${data.skipped.length} already existed`)
  }

  // One activity log entry for the whole import
  if (inserted > 0) {
    const { error } = await supabase.rpc('touch_company_activity', {
      p_company_id: companyId,
      p_user_id: ownerId,
      p_activity: `Imported ${inserted} products`,
    })
    if (error) console.warn(`  ! Activity log not written: ${error.message}`)
  }

  writeFileSync(
    'seed-report.json',
    JSON.stringify({ inserted, skippedExisting, invalid, conflicts, failedBatches }, null, 2)
  )

  console.log(`\nDone. Inserted ${inserted}, already existed ${skippedExisting.length}, failed batches ${failedBatches.length}.`)
  console.log('Details saved to seed-report.json\n')
}

main().catch((e) => fail(e.message))
