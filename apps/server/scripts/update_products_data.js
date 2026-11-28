const { Client } = require('pg');

const productsData = [
  {
    slug: 'sundarban-pure-honey-500g',
    title: 'সুন্দরবনের প্রাকৃতিক খাঁটি মধু (৫০০ গ্রাম)',
    price: 650.00,
    basePrice: 750.00,
    discount: 13,
    description: 'সুন্দরবনের গহিন অরণ্যের প্রাকৃতিক মৌচাক থেকে মৌয়ালদের দ্বারা সরাসরি সংগৃহীত ১০০% নির্ভেজাল ও কাঁচা (Raw) মধু। এতে কোনো প্রকার চিনি, কৃত্রিম মিষ্টি বা প্রিজারভেটিভ মেশানো হয় না। প্রাকৃতিকভাবে অ্যান্টিঅক্সিডেন্ট ও এনজাইম সমৃদ্ধ, যা রোগ প্রতিরোধ ক্ষমতা বাড়ায়, সর্দি-কাশি উপশম করে এবং শরীরের ক্লান্তি দূর করে। সিরাজগঞ্জ ও কাজীপুর এলাকায় দ্রুত হোম ডেলিভারি দেওয়া হয়।',
    ingredients: '১০০% সুন্দরবনের প্রাকৃতিক বুনো ফুলের খাঁটি কাঁচা মধু',
    nutritionInfo: 'প্রতি ১০০ গ্রামে: ক্যালোরি ৩০৪ kcal, প্রাকৃতিক কার্বোহাইড্রেট ৮২ গ্রাম (গ্লুকোজ ও ফ্রুক্টোজ), পটাসিয়াম ৫২ মিগ্রা, ভিটামিন সি, ক্যালসিয়াম ও আয়রন',
    bestBefore: 'উৎপাদন হতে ২ বছর',
    author: null,
    publisher: null,
    isDigital: false,
    features: JSON.stringify([
      '১০০% সুন্দরবনের প্রাকৃতিক বুনো ফুলের মধু',
      'কোনো চিনি বা কৃত্রিম মিষ্টি মিশ্রণ নেই',
      'কোল্ড ফিল্টার্ড - প্রাকৃতিক এনজাইম ও পোলেন সুরক্ষিত',
      'হালকা কাঠের ছিপিসহ বায়ুরোধী কাচের জার প্যাকেজিং',
      'সিরাজগঞ্জ ও কাজীপুর এলাকায় সরাসরি দ্রুত ক্যাশ অন ডেলিভারি'
    ]),
    imageFileName: 'sundarban-pure-honey-500g.jpg'
  },
  {
    slug: 'cold-pressed-mustard-oil-1l',
    title: 'ঘানিভাঙা খাঁটি সরিষার তেল (১ লিটার)',
    price: 320.00,
    basePrice: 360.00,
    discount: 11,
    description: 'ঐতিহ্যবাহী কাঠের ঘানিতে কম তাপমাত্রায় (Cold-Pressed) ধীরে ধীরে ভাঙানো খাঁটি দেশি মাঘী সরিষার তেল। কোনো প্রকার ক্ষতিকারক কেমিক্যাল বা কৃত্রিম ঝাঁঝের ব্যবহার ছাড়াই প্রস্তুত। প্রাকৃতিকভাবে তীব্র সুগন্ধ ও সুস্বাদু ঝাঁঝযুক্ত। রান্নায় আনে অতুলনীয় স্বাদ ও ঘ্রাণ, পাশাপাশি এটি শিশুর শরীর মালিশ এবং ত্বকের যত্নেও অত্যন্ত নিরাপদ।',
    ingredients: '১০০% বাছাইকৃত দেশি লাল মাঘী সরিষা বীজ',
    nutritionInfo: 'প্রতি ১০০ মিলি: এনার্জি ৮৮৪ kcal, সুস্থ ওমেগা-৩ ও ওমেগা-৬ ফ্যাটি এসিড, মনো-আনস্যাচুরেটেড ফ্যাট ৬০%, ভিটামিন ই ও অ্যান্টিঅক্সিডেন্ট',
    bestBefore: 'উৎপাদন হতে ১২ মাস',
    author: null,
    publisher: null,
    isDigital: false,
    features: JSON.stringify([
      'ঐতিহ্যবাহী কাঠের ঘানিতে ভাঙানো শতভাগ খাঁটি তেল',
      'কোনো কৃত্রিম ঝাঁঝ, রঙ বা কেমিক্যাল প্রিজারভেটিভ নেই',
      'কোলেস্টেরল মুক্ত ও হৃদযন্ত্রের জন্য উপকারী ওমেগা-৩ সমৃদ্ধ',
      'ফুড-গ্রেড সিলগালা বোতল প্যাকেজিং',
      'সিরাজগঞ্জ ও কাজীপুরে ঘরে বসে দ্রুত হোম ডেলিভারি'
    ]),
    imageFileName: 'cold-pressed-mustard-oil-1l.jpg'
  },
  {
    slug: 'pure-desi-cow-ghee-500g',
    title: 'খাঁটি গাওয়া গাভী ঘি (৫০০ গ্রাম)',
    price: 850.00,
    basePrice: 950.00,
    discount: 11,
    description: 'গ্রামের ঘাস খাওয়া দেশি গাভীর খাঁটি দুধের মাখন থেকে ঐতিহ্যবাহী মৃদু আঁচে জ্বাল দিয়ে তৈরি সুস্বাদু দানাদার খাঁটি গাওয়া ঘি। তীব্র প্রাকৃতিক সুবাস ও সোনালী দানাদার টেক্সচারে ভরপুর। ভাত, খিচুড়ি, পোলাও বা মিষ্টি রান্নায় যোগ করে রাজকীয় স্বাদ। শিশুদের শারীরিক বিকাশ ও পুষ্টি পূরণে আদর্শ।',
    ingredients: 'গ্রামের দেশি গাভীর ১০০% খাঁটি দুধের মাখন (বিলোনার পদ্ধতি)',
    nutritionInfo: 'প্রতি ১০০ গ্রামে: এনার্জি ৮৮৩ kcal, ভিটামিন এ, ডি, ই এবং কে, বুট্রিক এসিড ও স্বাস্থ্যকর ফ্যাটি এসিড',
    bestBefore: 'উৎপাদন হতে ৯ মাস',
    author: null,
    publisher: null,
    isDigital: false,
    features: JSON.stringify([
      'ঘাস খাওয়া দেশি গাভীর খাঁটি দুধের মাখন থেকে প্রস্তুত',
      'আসল দানাদার টেক্সচার ও মন মাতানো প্রাকৃতিক সুঘ্রাণ',
      'কোনো ভেজাল, ডালডা বা কৃত্রিম সেন্ট নেই',
      'হাইজিনিক এয়ারটাইট কাচের বয়াম প্যাকেজিং',
      'কাজীপুর ও সিরাজগঞ্জে নির্ভরযোগ্য হোম ডেলিভারি'
    ]),
    imageFileName: 'pure-desi-cow-ghee-500g.jpg'
  },
  {
    slug: 'premium-black-seed-oil-100ml',
    title: 'প্রিমিয়াম কালোজিরা তেল (১০০ মিলি)',
    price: 240.00,
    basePrice: 280.00,
    discount: 14,
    description: 'উচ্চমানের বাছাইকৃত দেশি কালোজিরা বীজ থেকে কোল্ড-প্রেস এক্সট্রাকশন পদ্ধতিতে সংগৃহীত শতভাগ খাঁটি ও ঘন কালোজিরা তেল। বিশ্বস্ত প্রাকৃতিক মহৌষধ, যাতে রয়েছে সক্রিয় থাইমোকুইনোন (Thymoquinone)। নিয়মিত সেবনে এটি রোগ প্রতিরোধ ক্ষমতা বৃদ্ধি করে, ডায়াবেটিস নিয়ন্ত্রণে সহায়তা করে এবং চুল ও ত্বকের সুস্বাস্থ্য নিশ্চিত করে।',
    ingredients: '১০০% ফার্স্ট কোল্ড-প্রেসড প্রিমিয়াম দেশি কালোজিরা নির্যাস',
    nutritionInfo: 'প্রতি ৫ মিলি: সক্রিয় থাইমোকুইনোন (TQ), প্রয়োজনীয় ওমেগা ফ্যাটি এসিড, ভিটামিন এ, অ্যান্টিঅক্সিডেন্ট',
    bestBefore: 'উৎপাদন হতে ২ বছর',
    author: null,
    publisher: null,
    isDigital: false,
    features: JSON.stringify([
      'প্রথম চাপের কোল্ড-প্রেস ১০০% খাঁটি কালোজিরা তেল',
      'উচ্চমাত্রার প্রাকৃতিক থাইমোকুইনোন ও অ্যান্টিঅক্সিডেন্ট',
      'সূর্যালোক সুরক্ষায় ডার্ক অ্যাম্বার গ্লাস বোতল ও ড্রপার',
      'বহুমুখী ব্যবহার: সরাসরি সেবন, শ্বাসকষ্ট উপশম ও চুলের যত্নে',
      'শতভাগ নির্ভেজাল কোয়ালিটি গ্যারান্টি'
    ]),
    imageFileName: 'premium-black-seed-oil-100ml.jpg'
  },
  {
    slug: 'organic-mixed-nuts-and-dates-400g',
    title: 'প্রাকৃতিক ড্রাই ফ্রুটস ও প্রিমিয়াম নাটস মিক্স (৪০০ গ্রাম)',
    price: 560.00,
    basePrice: 650.00,
    discount: 14,
    description: 'বিশ্বের সেরা বাগান থেকে বাছাই করা ৭ প্রকার প্রিমিয়াম বাদাম ও ড্রাই ফ্রুটসের শক্তিবর্ধক পুষ্টিকর মিশ্রণ। এতে রয়েছে ক্যালিফোর্নিয়া কাঠবাদাম, রোস্টেড কাজুবাদাম, আখরোট, পেস্তা, কিশমিশ, কুমড়ার বীজ এবং প্রিমিয়াম মেডজুল খেজুর। সকালের নাশতায়, শরীরচর্চার পর অথবা শিশুদের টিফিনে তাৎক্ষণিক স্বাস্থ্যকর শক্তির চমৎকার উৎস।',
    ingredients: 'ক্যালিফোর্নিয়া কাঠবাদাম, কাজুবাদাম, আখরোট, পেস্তা, কিশমিশ, মিষ্টি কুমড়ার বীজ ও প্রিমিয়াম খেজুর',
    nutritionInfo: 'প্রতি ১০০ গ্রামে: ক্যালোরি ৫৫০ kcal, প্রোটিন ১৮ গ্রাম, ডায়াটারি ফাইবার ৯ গ্রাম, ওমেগা-৩, আয়রন ও জিংক',
    bestBefore: 'উৎপাদন হতে ৮ মাস',
    author: null,
    publisher: null,
    isDigital: false,
    features: JSON.stringify([
      '৭টি প্রিমিয়াম বাদাম ও ড্রাই ফ্রুটসের সুষম স্বাস্থ্যকর কম্বো',
      'উচ্চমাত্রার ন্যাচারাল এনার্জি, প্রোটিন ও ব্রেন বুস্টিং ওমেগা-৩',
      'কোনো অতিরিক্ত চিনি, লবণ বা প্রিজারভেটিভ নেই',
      'ফুড-গ্রেড জিপলক পাউচে ময়েশ্চার-প্রুফ ফ্রেশনেস প্যাকেজিং',
      'সিরাজগঞ্জ ও কাজীপুর এলাকায় দ্রুত হোম ডেলিভারি'
    ]),
    imageFileName: 'organic-mixed-nuts-and-dates-400g.jpg'
  },
  {
    slug: 'ssc-math-special-sheet-pdf',
    title: 'এসএসসি ও দাখিল চূড়ান্ত গণিত স্পেশাল শিট (ডিজিটাল পিডিএফ)',
    price: 120.00,
    basePrice: 200.00,
    discount: 40,
    description: 'এসএসসি ও দাখিল পরীক্ষার্থীদের গণিতে নিশ্চিত A+ পাওয়ার লক্ষ্যে প্রস্তুতকৃত একটি স্বয়ংসম্পূর্ণ ডিজিটাল রিভিশন শিট। প্রতিটি অধ্যায়ের মৌলিক সূত্র, শর্টকাট টেকনিক, বিগত ১০ বছরের বোর্ড প্রশ্ন বিশ্লেষণ ও সর্বাধিক কমনোপযোগী সৃজনশীল ও নৈর্ব্যক্তিক (MCQ) প্রশ্নের সহজ সমাধান এতে সন্নিবেশিত। অনলাইনে পেমেন্ট করার সাথে সাথেই ইনস্ট্যান্ট ডাউনলোড করে পড়তে পারবেন।',
    ingredients: null,
    nutritionInfo: null,
    bestBefore: null,
    author: 'প্রিজম শিক্ষা গবেষণা পর্ষদ',
    publisher: 'প্রিজম পাবলিকেশন্স',
    isDigital: true,
    features: JSON.stringify([
      'অধ্যায়ভিত্তিক সকল প্রয়োজনীয় সূত্র ও শর্টকাট টেকনিকের সংকলন',
      'বিগত বছরের বোর্ড প্রশ্ন ও শীর্ষ স্কুলের টেস্ট প্রশ্ন সমাধান',
      'সহজ ও বোধগম্য ভাষায় রচিত সৃজনশীল ও MCQ প্রশ্নোত্তর',
      'ক্রিস্টাল ক্লিয়ার এইচডি ভেক্টর ডায়াগ্রাম ও ফর্মুলা চার্ট',
      'মোবাইল, ট্যাবলেট ও ল্যাপটপে সহজে পড়ার উপযোগী ডিজিটাল PDF'
    ]),
    imageFileName: 'ssc-math-special-sheet-pdf.jpg'
  },
  {
    slug: 'hsc-science-handnote-pdf',
    title: 'এইচএসসি সাধারণ বিজ্ঞান ও প্রযুক্তি হ্যান্ডনোট (ডিজিটাল পিডিএফ)',
    price: 150.00,
    basePrice: 250.00,
    discount: 40,
    description: 'এইচএসসি শিক্ষার্থীদের জন্য পদার্থবিজ্ঞান, রসায়ন ও জীববিজ্ঞানের জটিল টপিকগুলোকে সহজবোধ্য করার বিশেষ হ্যান্ডনোট। দৃষ্টিনন্দন রঙিন ডায়াগ্রাম, ফ্লোচার্ট এবং মাইন্ডম্যাপের সাহায্যে বিষয়গুলো উপস্থাপন করা হয়েছে। বোর্ড পরীক্ষা ও বিশ্ববিদ্যালয় ভর্তি পরীক্ষার শেষ মুহূর্তের রিভিশনের জন্য এটি এক অপরিহার্য ডিজিটাল সংকলন।',
    ingredients: null,
    nutritionInfo: null,
    bestBefore: null,
    author: 'প্রিজম সায়েন্স একাডেমি',
    publisher: 'প্রিজম পাবলিকেশন্স',
    isDigital: true,
    features: JSON.stringify([
      'পদার্থ, রসায়ন ও জীববিজ্ঞান ৩টি বিষয়ের পূর্ণাঙ্গ সমন্বিত নোট',
      'কালারফুল থ্রিডি ডায়াগ্রাম, রিয়্যাকশন মেকানিজম ও চার্ট',
      'টপিকভিত্তিক কনসেপ্ট ক্লিয়ারিং ও বোর্ড এক্সাম টিপস',
      'এডমিশন টেস্টের জন্য বিশেষ গুরুত্বপূর্ণ শর্টকাট পয়েন্ট',
      'আজীবন অ্যাক্সেস ও আনলিমিটেড অফলাইন পড়ার সুবিধা'
    ]),
    imageFileName: 'hsc-science-handnote-pdf.jpg'
  },
  {
    slug: 'primary-secondary-study-guide-printed',
    title: 'প্রাইমারি ও মাধ্যমিক অল-ইন-ওয়ান স্টাডি গাইড (প্রিন্টেড বুক)',
    price: 450.00,
    basePrice: 520.00,
    discount: 13,
    description: 'সিরাজগঞ্জ ও কাজীপুর অঞ্চলের প্রাথমিক ও মাধ্যমিক স্তরের শিক্ষার্থীদের জন্য রচিত পূর্ণাঙ্গ মুদ্রিত গাইড বই। নতুন পাঠ্যক্রম অনুসারে প্রণীত বাংলা, ইংরেজি, গণিত ও সাধারণ বিজ্ঞান বিষয়ের সহজ পাঠ ও অনুশীলনীর সমাধান রয়েছে এতে। সাথে রয়েছে মডেল টেস্ট ও ওএমআর শিট প্র্যাকটিস সুবিধা। অফলাইন ক্লাসরুম ও ঘরে বসে পড়ার জন্য আদর্শ।',
    ingredients: null,
    nutritionInfo: null,
    bestBefore: null,
    author: 'মো. রফিকুল ইসলাম ও সহযোগী শিক্ষকবৃন্দ',
    publisher: 'প্রিজম একাডেমি পাবলিকেশন্স',
    isDigital: false,
    features: JSON.stringify([
      'নতুন শিক্ষাক্রমের আলোকে রচিত অল-ইন-ওয়ান প্র্যাকটিস বুক',
      'বাংলা, ইংরেজি, গণিত ও বিজ্ঞানের সহজ পাঠ ও অনুশীলনী',
      'অধ্যায়ভিত্তিক মডেল টেস্ট ও স্ব-মূল্যায়ন ওয়ার্কশিট',
      'উন্নত মানের কাগজের প্রিন্ট ও টেকসই মজবুত বাইন্ডিং',
      'কাজীপুর ও সিরাজগঞ্জের শিক্ষার্থীদের জন্য সরাসরি হোম ডেলিভারি'
    ]),
    imageFileName: 'primary-secondary-study-guide-printed.jpg'
  }
];

async function updateAll() {
  const client = new Client({
    connectionString: 'postgresql://postgres:Postgres123@localhost:5432/prism_bazar?schema=public'
  });
  await client.connect();

  for (const item of productsData) {
    const prodRes = await client.query('SELECT id FROM "Product" WHERE slug = $1;', [item.slug]);
    if (prodRes.rows.length === 0) {
      console.warn(`Product slug not found: ${item.slug}`);
      continue;
    }
    const productId = prodRes.rows[0].id;

    // Update Product details
    await client.query(`
      UPDATE "Product"
      SET 
        title = $1,
        description = $2,
        price = $3,
        "basePrice" = $4,
        discount = $5,
        ingredients = $6,
        "nutritionInfo" = $7,
        author = $8,
        publisher = $9,
        "isDigital" = $10,
        features = $11,
        "isPublish" = true,
        "isDeleted" = false
      WHERE id = $12;
    `, [
      item.title,
      item.description,
      item.price,
      item.basePrice,
      item.discount,
      item.ingredients,
      item.nutritionInfo,
      item.author,
      item.publisher,
      item.isDigital,
      item.features,
      productId
    ]);

    // Check existing ProductImage
    const imgUrl = `/products/${item.imageFileName}`;
    const imgCheck = await client.query('SELECT id FROM "ProductImage" WHERE "productId" = $1;', [productId]);
    if (imgCheck.rows.length > 0) {
      await client.query(`
        UPDATE "ProductImage"
        SET url = $1, "isPrimary" = true, "altText" = $2
        WHERE id = $3;
      `, [imgUrl, item.title, imgCheck.rows[0].id]);
    } else {
      await client.query(`
        INSERT INTO "ProductImage" (id, "productId", url, "altText", "isPrimary", "sortOrder", "isDeleted", "createdAt")
        VALUES (gen_random_uuid(), $1, $2, $3, true, 0, false, NOW());
      `, [productId, imgUrl, item.title]);
    }

    console.log(`Updated product [${item.slug}] -> image: ${imgUrl}`);
  }

  await client.end();
  console.log('All products successfully updated in database!');
}

updateAll().catch(err => {
  console.error(err);
  process.exit(1);
});
