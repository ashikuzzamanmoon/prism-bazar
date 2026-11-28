const { Client } = require('pg');

async function checkInventory() {
  const client = new Client({
    connectionString: 'postgresql://postgres:Postgres123@localhost:5432/prism_bazar?schema=public'
  });
  await client.connect();
  const prods = await client.query('SELECT id, slug, title FROM "Product";');
  for (const p of prods.rows) {
    const inv = await client.query('SELECT * FROM "ProductInventory" WHERE "productId" = $1;', [p.id]);
    const col = await client.query('SELECT * FROM "ProductColor" WHERE "productId" = $1;', [p.id]);
    console.log(`[${p.slug}] Inventories:`, inv.rows, 'Colors:', col.rows);
  }
  await client.end();
}

checkInventory().catch(console.error);
