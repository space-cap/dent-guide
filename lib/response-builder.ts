import type { AskResponseBody, MatchType, PriceCatalog, PriceItem } from '@/lib/types';

const ASSISTANT_NAME = '덴티';

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

export function buildFollowUpSuggestions(params: {
  item?: PriceItem;
  candidateNames?: string[];
  matchType: MatchType;
}): string[] {
  if (params.matchType === 'ambiguous') {
    return [...(params.candidateNames ?? []).slice(0, 3)];
  }

  if (params.matchType === 'not_found') {
    return ['임플란트 비용 알려줘', '크라운 가격 궁금해', '레진 충전 얼마야?'];
  }

  if (!params.item) {
    return ['상담 예약하고 싶어요', '다른 치료 가격도 알려줘'];
  }

  switch (params.item.category) {
    case '임플란트':
      return ['뼈이식도 필요한지 궁금해', '임플란트 상담비도 있어?', '크라운 재료도 같이 알려줘'];
    case '크라운':
      return ['재질별 차이도 알려줘', '앞니에도 같은 가격이야?', '신경치료도 같이 필요한가요?'];
    case '충전':
      return ['인레이랑 차이도 알려줘', '앞니/어금니도 같은가요?', '검진 비용도 알려줘'];
    case '신경치료':
      return ['크라운 비용도 같이 알려줘', '통증이 심하면 바로 가도 되나요?', '검진 비용도 알려줘'];
    default:
      return ['다른 치료 가격도 알려줘', '상담 예약하고 싶어요', '검진 비용도 알려줘'];
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
    assistantName: ASSISTANT_NAME,
    supportMode: 'price_found',
    followUpSuggestions: buildFollowUpSuggestions({
      item: params.item,
      matchType: params.matchType,
    }),
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
    answer: `원하시는 치료 범위가 조금 넓어서 바로 하나로 정하기 어렵습니다. ${candidateText} 중 어떤 치료를 말씀하시는지 알려주시면 더 정확히 안내드릴게요.`,
    version: params.catalog.version,
    usedAI: false,
    assistantName: ASSISTANT_NAME,
    supportMode: 'clarify',
    followUpSuggestions: buildFollowUpSuggestions({
      candidateNames: params.candidateNames,
      matchType: 'ambiguous',
    }),
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
    assistantName: ASSISTANT_NAME,
    supportMode: 'consult',
    followUpSuggestions: buildFollowUpSuggestions({
      candidateNames: params.candidateNames,
      matchType: 'not_found',
    }),
  };
}

export { ASSISTANT_NAME };
