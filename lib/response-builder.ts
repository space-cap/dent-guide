import type { AskResponseBody, MatchType, PriceCatalog, PriceItem } from '@/lib/types';

function formatPrice(value: number): string {
  return `${new Intl.NumberFormat('ko-KR').format(value)}원`;
}

function appendNote(base: string, note?: string): string {
  return note ? `${base} ${note}` : base;
}

export function buildItemSummary(item: PriceItem) {
  return {
    id: item.id,
    itemName: item.itemName,
    category: item.category,
    displayType: item.displayType,
  };
}

export function buildAnswerFromItem(item: PriceItem): string {
  switch (item.displayType) {
    case 'exact':
      return appendNote(`${item.itemName} 가격은 ${formatPrice(item.price ?? 0)}입니다.`, item.note);
    case 'range':
      return appendNote(
        `${item.itemName}는 ${formatPrice(item.minPrice ?? 0)}~${formatPrice(item.maxPrice ?? 0)} 범위입니다.`,
        item.note,
      );
    case 'inquiry_only':
      return item.note ?? `${item.itemName} 비용은 상태에 따라 달라져 정확한 비용은 상담 후 안내 가능합니다.`;
    case 'hidden':
    default:
      return '정확한 항목을 찾지 못했습니다. 상담을 통해 자세히 안내드릴게요.';
  }
}

export function buildSuccessResponse(params: {
  catalog: PriceCatalog;
  question: string;
  item: PriceItem;
  matchType: MatchType;
  usedAI?: boolean;
}): AskResponseBody {
  return {
    ok: true,
    question: params.question,
    matchType: params.matchType,
    item: buildItemSummary(params.item),
    answer: buildAnswerFromItem(params.item),
    version: params.catalog.version,
    usedAI: params.usedAI ?? false,
  };
}

export function buildAmbiguousResponse(params: {
  catalog: PriceCatalog;
  question: string;
  candidateNames: string[];
}): AskResponseBody {
  const candidateText = params.candidateNames.join(', ');

  return {
    ok: true,
    question: params.question,
    matchType: 'ambiguous',
    item: null,
    candidates: params.candidateNames,
    answer: `정확한 항목을 고르기 어렵습니다. ${candidateText} 중 어떤 치료를 말씀하시는지 알려주시면 더 정확히 안내드릴게요.`,
    version: params.catalog.version,
    usedAI: false,
  };
}

export function buildNotFoundResponse(params: {
  catalog: PriceCatalog;
  question: string;
  candidateNames?: string[];
}): AskResponseBody {
  const suggestion = params.candidateNames && params.candidateNames.length > 0
    ? ` 혹시 ${params.candidateNames.join(', ')} 중 하나를 찾으시나요?`
    : ' 크라운, 임플란트, 레진, 신경치료 중 어떤 치료인지 알려주시면 더 정확히 안내드릴게요.';

  return {
    ok: true,
    question: params.question,
    matchType: 'not_found',
    item: null,
    candidates: params.candidateNames,
    answer: `정확한 항목을 찾지 못했습니다.${suggestion}`,
    version: params.catalog.version,
    usedAI: false,
  };
}
