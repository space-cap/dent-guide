import priceCatalog from '@/data/prices.json';
import type { PriceCatalog, PriceItem, SearchResult, PriceMatchCandidate } from '@/lib/types';

const catalog = priceCatalog as PriceCatalog;

function normalizeText(value: string): string {
  return value
    .toLowerCase()
    .replace(/[?.,/#!$%^&*;:{}=\-_`~()]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function compactText(value: string): string {
  return normalizeText(value).replace(/\s+/g, '');
}

function includesNormalized(source: string, target: string): boolean {
  const normalizedSource = normalizeText(source);
  const normalizedTarget = normalizeText(target);
  const compactSource = compactText(source);
  const compactTarget = compactText(target);

  return (
    normalizedSource.includes(normalizedTarget) ||
    normalizedTarget.includes(normalizedSource) ||
    compactSource.includes(compactTarget) ||
    compactTarget.includes(compactSource)
  );
}

function getItemTokens(item: PriceItem): string[] {
  return [item.itemName, ...(item.aliases ?? []), ...(item.keywords ?? [])]
    .map(normalizeText)
    .filter(Boolean);
}

function scoreItem(question: string, item: PriceItem): PriceMatchCandidate | null {
  if (!item.public || item.displayType === 'hidden') {
    return null;
  }

  const normalizedQuestion = normalizeText(question);
  const normalizedItemName = normalizeText(item.itemName);

  if (normalizedQuestion === normalizedItemName) {
    return {
      item,
      score: 100,
      matchType: 'direct',
      matchedOn: item.itemName,
    };
  }

  if (includesNormalized(question, item.itemName)) {
    return {
      item,
      score: 92,
      matchType: 'direct',
      matchedOn: item.itemName,
    };
  }

  if (compactText(question).includes(compactText(item.itemName))) {
    return {
      item,
      score: 88,
      matchType: 'direct',
      matchedOn: item.itemName,
    };
  }

  for (const alias of item.aliases ?? []) {
    if (includesNormalized(question, alias)) {
      return {
        item,
        score: 84,
        matchType: 'alias',
        matchedOn: alias,
      };
    }

    if (compactText(question).includes(compactText(alias))) {
      return {
        item,
        score: 82,
        matchType: 'alias',
        matchedOn: alias,
      };
    }
  }

  const questionTokens = new Set(normalizedQuestion.split(' ').filter(Boolean));
  let score = 0;
  let matchedOn = '';
  let matchType: PriceMatchCandidate['matchType'] = 'keyword';

  for (const token of getItemTokens(item)) {
    const tokenParts = token.split(' ').filter(Boolean);
    const overlap = tokenParts.filter((part) => questionTokens.has(part));

    if (overlap.length === tokenParts.length && tokenParts.length > 0) {
      score = Math.max(score, 76 + tokenParts.length);
      matchedOn = token;
      matchType = item.aliases?.some((alias) => normalizeText(alias) === token) ? 'alias' : 'keyword';
    } else if (overlap.length > 0) {
      score = Math.max(score, 60 + overlap.length * 5);
      matchedOn = overlap.join(', ');
      matchType = 'keyword';
    }
  }

  if (score > 0) {
    return {
      item,
      score,
      matchType,
      matchedOn,
    };
  }

  return null;
}

function dedupeCandidates(candidates: PriceMatchCandidate[]): PriceMatchCandidate[] {
  const map = new Map<string, PriceMatchCandidate>();

  for (const candidate of candidates) {
    const existing = map.get(candidate.item.id);

    if (!existing || candidate.score > existing.score) {
      map.set(candidate.item.id, candidate);
    }
  }

  return Array.from(map.values()).sort((a, b) => b.score - a.score);
}

export function getCatalog(): PriceCatalog {
  return catalog;
}

export function getPublicItems(): PriceItem[] {
  return catalog.items.filter((item) => item.public && item.displayType !== 'hidden');
}

export function findPriceItem(question: string): SearchResult {
  const normalizedQuestion = normalizeText(question);
  const candidates = dedupeCandidates(
    getPublicItems()
      .map((item) => scoreItem(question, item))
      .filter((candidate): candidate is PriceMatchCandidate => candidate !== null),
  );

  if (candidates.length === 0) {
    return {
      type: 'not_found',
      candidates: [],
    };
  }

  const [top, second] = candidates;
  const categoryKeywords = ['크라운', '보철', '임플란트', '충전', '신경치료', '심미치료', '상담'];
  const matchedCategoryKeyword = categoryKeywords.find((categoryKeyword) =>
    normalizedQuestion.includes(normalizeText(categoryKeyword)),
  );

  if (matchedCategoryKeyword && top.score < 90) {
    const categoryCandidates = candidates.filter((candidate) => {
      const normalizedCategory = normalizeText(candidate.item.category);
      const normalizedItemName = normalizeText(candidate.item.itemName);
      const keyword = normalizeText(matchedCategoryKeyword);

      return normalizedCategory.includes(keyword) || normalizedItemName.includes(keyword);
    });

    if (categoryCandidates.length >= 2) {
      return {
        type: 'ambiguous',
        candidates: categoryCandidates.slice(0, 3),
      };
    }
  }

  if (second && top.score - second.score <= 6 && top.score < 90) {
    return {
      type: 'ambiguous',
      candidates: candidates.slice(0, 3),
    };
  }

  if (top.score < 68) {
    return {
      type: 'not_found',
      candidates: candidates.slice(0, 3),
    };
  }

  return {
    type: 'match',
    matchType: top.matchType,
    item: top.item,
    score: top.score,
    matchedOn: top.matchedOn,
    candidates: candidates.slice(0, 3),
  };
}

export function findByNormalizedItemName(itemName: string): PriceItem | null {
  const normalizedTarget = normalizeText(itemName);

  return (
    getPublicItems().find((item) => {
      if (normalizeText(item.itemName) === normalizedTarget) {
        return true;
      }

      return (item.aliases ?? []).some((alias) => normalizeText(alias) === normalizedTarget);
    }) ?? null
  );
}

export { normalizeText };
