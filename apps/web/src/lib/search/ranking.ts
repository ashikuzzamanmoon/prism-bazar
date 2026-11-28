import type { IProduct } from "@/types/productTypes";

function normalize(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .trim();
}

function tokenize(value: string) {
  return normalize(value).split(/\s+/).filter(Boolean);
}

function levenshteinDistance(a: string, b: string) {
  const matrix = Array.from({ length: b.length + 1 }, () => [] as number[]);

  for (let index = 0; index <= b.length; index += 1) {
    matrix[index][0] = index;
  }

  for (let index = 0; index <= a.length; index += 1) {
    matrix[0][index] = index;
  }

  for (let row = 1; row <= b.length; row += 1) {
    for (let column = 1; column <= a.length; column += 1) {
      const cost = a[column - 1] === b[row - 1] ? 0 : 1;
      matrix[row][column] = Math.min(
        matrix[row - 1][column] + 1,
        matrix[row][column - 1] + 1,
        matrix[row - 1][column - 1] + cost,
      );
    }
  }

  return matrix[b.length][a.length];
}

function fuzzyScore(term: string, haystackTerms: string[]) {
  return haystackTerms.reduce((score, candidate) => {
    const distance = levenshteinDistance(term, candidate);
    if (distance === 0) {
      return score + 6;
    }
    if (distance === 1) {
      return score + 3;
    }
    if (distance === 2 && term.length > 4) {
      return score + 1;
    }
    return score;
  }, 0);
}

function getPopularitySignal(product: IProduct) {
  const unsafeProduct = product as IProduct & {
    viewsCount?: number;
    salesCount?: number;
    popularityScore?: number;
  };

  return (
    (unsafeProduct.viewsCount || 0) * 0.02 +
    (unsafeProduct.salesCount || 0) * 0.08 +
    (unsafeProduct.popularityScore || 0) * 0.1
  );
}

export function scoreSearchResult(product: IProduct, query: string) {
  const terms = tokenize(query);
  const title = normalize(product.title);
  const description = normalize(product.description || "");
  const brand = normalize(product.brand?.title || "");
  const titleTerms = tokenize(product.title);
  const descriptionTerms = tokenize(product.description || "");

  let score = 0;

  for (const term of terms) {
    if (title.includes(term)) score += 20;
    if (brand.includes(term)) score += 10;
    if (description.includes(term)) score += 6;
    score += fuzzyScore(term, [...titleTerms, ...descriptionTerms]);
  }

  if (title === normalize(query)) score += 15;

  score += (product.ratings || 0) * 4;
  score += Math.min(product.reviewsCount || 0, 50) * 0.4;
  score += getPopularitySignal(product);
  score += Number(product.price) <= 150000 ? 1.5 : 0;

  return score;
}

export function rankSearchResults(products: IProduct[], query: string) {
  return [...products].sort((left, right) => {
    const scoreDelta =
      scoreSearchResult(right, query) - scoreSearchResult(left, query);

    if (scoreDelta !== 0) {
      return scoreDelta;
    }

    return Number(left.price) - Number(right.price);
  });
}
