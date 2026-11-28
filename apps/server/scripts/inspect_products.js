const { Client } = require('pg');

async function inspect() {
  const client = new Client({
    connectionString: 'postgresql://postgres:Postgres123@localhost:5432/prism_bazar?schema=public'
  });
  await client.connect();
  
  const prodsRes = await client.query(`
    SELECT id, slug, title, type, condition, "isDigital",
           author, publisher, ingredients, "nutritionInfo", "expiryDate"
    FROM "Product"
    ORDER BY "createdAt" ASC;
  `);
  console.table(prodsRes.rows.map(p => ({
    slug: p.slug,
    type: p.type,
    condition: p.condition,
    isDigital: p.isDigital,
    author: p.author,
    publisher: p.publisher
  })));
  
  console.log('=== PRODUCTS (' + prodsRes.rows.length + ') ===');
  for (const p of prodsRes.rows) {
    console.log(`\nID: ${p.id}`);
    console.log(`Slug: ${p.slug}`);
    console.log(`Title: ${p.title}`);
    console.log(`Price: ${p.price} (Base: ${p.basePrice}, Discount: ${p.discount}%)`);
    console.log(`Digital: ${p.isDigital}`);
    console.log(`Author: ${p.author} | Publisher: ${p.publisher}`);
    console.log(`Ingredients: ${p.ingredients}`);
    console.log(`Nutrition: ${p.nutritionInfo}`);
    console.log(`Expiry: ${p.expiryDate}`);
    console.log(`Description: ${p.description}`);
  }

  const imgsRes = await client.query(`
    SELECT id, "productId", url, "isPrimary"
    FROM "ProductImage"
    ORDER BY "productId", "isPrimary" DESC;
  `);
  
  console.log('\n=== PRODUCT IMAGES (' + imgsRes.rows.length + ') ===');
  for (const img of imgsRes.rows) {
    console.log(`Prod: ${img.productId} | isPrimary: ${img.isPrimary} | url: ${img.url}`);
  }

  const catsRes = await client.query(`SELECT id, name, slug FROM "Category";`);
  console.log('\n=== CATEGORIES ===');
  for (const c of catsRes.rows) {
    console.log(`[${c.id}] ${c.slug} : ${c.name}`);
  }

  const brandsRes = await client.query(`SELECT id, title, slug FROM brands;`);
  console.log('\n=== BRANDS ===');
  for (const b of brandsRes.rows) {
    console.log(`[${b.id}] ${b.slug} : ${b.title}`);
  }

  await client.end();
}

inspect().catch(err => {
  console.error(err);
  process.exit(1);
});
