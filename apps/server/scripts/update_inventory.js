const { Client } = require('pg');

const stockMapping = {
  'sundarban-pure-honey-500g': 150,
  'cold-pressed-mustard-oil-1l': 200,
  'pure-desi-cow-ghee-500g': 100,
  'premium-black-seed-oil-100ml': 120,
  'organic-mixed-nuts-and-dates-400g': 180,
  'primary-secondary-study-guide-printed': 250,
  'ssc-math-special-sheet-pdf': 9999,
  'hsc-science-handnote-pdf': 9999,
};

async function updateStock() {
  const client = new Client({
    connectionString: 'postgresql://postgres:Postgres123@localhost:5432/prism_bazar?schema=public'
  });
  await client.connect();

  for (const [slug, qty] of Object.entries(stockMapping)) {
    const prodRes = await client.query('SELECT id, title FROM "Product" WHERE slug = $1;', [slug]);
    if (prodRes.rows.length === 0) {
      console.warn(`Product not found: ${slug}`);
      continue;
    }
    const productId = prodRes.rows[0].id;

    // Check if ProductInventory exists
    const invRes = await client.query('SELECT id FROM "ProductInventory" WHERE "productId" = $1;', [productId]);
    if (invRes.rows.length > 0) {
      await client.query('UPDATE "ProductInventory" SET quantity = $1 WHERE id = $2;', [qty, invRes.rows[0].id]);
      console.log(`Updated inventory for [${slug}] to ${qty}`);
    } else {
      await client.query(
        'INSERT INTO "ProductInventory" (id, "productId", quantity) VALUES (gen_random_uuid(), $1, $2);',
        [productId, qty]
      );
      console.log(`Created inventory for [${slug}] with quantity ${qty}`);
    }
  }

  const check = await client.query(`
    SELECT p.slug, p.title, COALESCE(SUM(i.quantity), 0) as total_stock
    FROM "Product" p
    LEFT JOIN "ProductInventory" i ON p.id = i."productId"
    GROUP BY p.slug, p.title;
  `);

  console.log('\n=== CURRENT TOTAL STOCK PER PRODUCT ===');
  for (const r of check.rows) {
    console.log(`- ${r.slug}: ${r.total_stock} units (${r.title})`);
  }

  await client.end();
}

updateStock().catch(err => {
  console.error(err);
  process.exit(1);
});
