export type DisplayType = 'exact' | 'range' | 'inquiry_only' | 'hidden';

export type PriceItem = {
  id: string;
  category: string;
  itemName: string;
  aliases?: string[];
  displayType: DisplayType;
  price?: number;
  minPrice?: number;
  maxPrice?: number;
  public: boolean;
  note?: string;
  keywords?: string[];
};

export type PriceCatalog = {
  version: string;
  updatedAt: string;
  clinicName?: string;
  currency: string;
  items: PriceItem[];
};

export type MatchType =
  | 'direct'
  | 'alias'
  | 'keyword'
  | 'ai_normalized'
  | 'not_found'
  | 'ambiguous';

export type PriceMatchCandidate = {
  item: PriceItem;
  score: number;
  matchType: Exclude<MatchType, 'ai_normalized' | 'not_found' | 'ambiguous'>;
  matchedOn: string;
};

export type SearchResult =
  | {
      type: 'match';
      matchType: Exclude<MatchType, 'ai_normalized' | 'not_found' | 'ambiguous'>;
      item: PriceItem;
      score: number;
      matchedOn: string;
      candidates: PriceMatchCandidate[];
    }
  | {
      type: 'ambiguous';
      candidates: PriceMatchCandidate[];
    }
  | {
      type: 'not_found';
      candidates: PriceMatchCandidate[];
    };

export type AskRequestBody = {
  question: string;
};

export type AskResponseBody =
  | {
      ok: true;
      question: string;
      matchType: MatchType;
      item: {
        id: string;
        itemName: string;
        category: string;
        displayType: DisplayType;
      } | null;
      answer: string;
      version: string;
      candidates?: string[];
      usedAI?: boolean;
    }
  | {
      ok: false;
      error: string;
    };

export type OpenAINormalizationResult = {
  normalizedItemName: string | null;
  reason?: string;
};
