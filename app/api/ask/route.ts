import { NextResponse } from 'next/server';

import { composeConsultationReply, isOpenAIEnabled, normalizeQuestionWithAI } from '@/lib/openai';
import { findByNormalizedItemName, findPriceItem, getCatalog, getPublicItems } from '@/lib/price-search';
import { buildAmbiguousResponse, buildNotFoundResponse, buildSuccessResponse } from '@/lib/response-builder';
import type { AskRequestBody, AskResponseBody, ChatHistoryMessage } from '@/lib/types';

export const runtime = 'nodejs';

type SafeRequestBody = Partial<AskRequestBody>;

function sanitizeHistory(value: SafeRequestBody['history']): ChatHistoryMessage[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .filter(
      (message): message is ChatHistoryMessage =>
        Boolean(message) &&
        (message.role === 'user' || message.role === 'assistant') &&
        typeof message.content === 'string' &&
        message.content.trim().length > 0,
    )
    .slice(-8)
    .map((message) => ({
      role: message.role,
      content: message.content.trim().slice(0, 500),
    }));
}

function hasContextualSignal(question: string): boolean {
  const contextualKeywords = ['그럼', '그거', '그건', '그 치료', '그 시술', '이거', '저거', '앞니', '어금니'];
  return contextualKeywords.some((keyword) => question.includes(keyword));
}

function shouldTryAINormalization(question: string, confidence?: number): boolean {
  return hasContextualSignal(question) || (confidence !== undefined && confidence < 85);
}

async function polishResponse(response: AskResponseBody, history: ChatHistoryMessage[]) {
  if (!response.ok || !isOpenAIEnabled()) {
    return response;
  }

  const polished = await composeConsultationReply({
    question: response.question,
    history,
    factualAnswer: response.answer,
    supportMode: response.supportMode,
    itemName: response.item?.itemName,
    displayType: response.item?.displayType,
    candidateNames: response.candidates,
    followUpSuggestions: response.followUpSuggestions,
  });

  if (!polished?.message) {
    return response;
  }

  return {
    ...response,
    answer: polished.message,
    followUpSuggestions:
      polished.suggestions && polished.suggestions.length > 0 ? polished.suggestions : response.followUpSuggestions,
  } satisfies AskResponseBody;
}

export async function GET() {
  return NextResponse.json<AskResponseBody>(
    {
      ok: false,
      error: 'use POST /api/ask with a JSON body: {"question":"..."}',
    },
    { status: 405 },
  );
}

export async function POST(request: Request) {
  try {
    let body: SafeRequestBody;

    try {
      body = (await request.json()) as SafeRequestBody;
    } catch {
      return NextResponse.json<AskResponseBody>(
        {
          ok: false,
          error: 'invalid json body',
        },
        { status: 400 },
      );
    }

    const question = typeof body.question === 'string' ? body.question.trim() : '';
    const history = sanitizeHistory(body.history);

    if (!question) {
      return NextResponse.json<AskResponseBody>(
        {
          ok: false,
          error: 'question is required',
        },
        { status: 400 },
      );
    }

    if (question.length > 300) {
      return NextResponse.json<AskResponseBody>(
        {
          ok: false,
          error: 'question is too long',
        },
        { status: 400 },
      );
    }

    const catalog = getCatalog();
    const searchResult = findPriceItem(question);
    const publicItems = getPublicItems();

    const shouldUseAINormalization =
      isOpenAIEnabled() &&
      (searchResult.type === 'not_found' ||
        (searchResult.type === 'ambiguous' && (history.length > 0 || hasContextualSignal(question))) ||
        (searchResult.type === 'match' && shouldTryAINormalization(question, searchResult.score)));

    if (shouldUseAINormalization) {
      const normalized = await normalizeQuestionWithAI({
        question,
        items: publicItems,
        history,
      });

      if (normalized?.normalizedItemName) {
        const matchedItem = findByNormalizedItemName(normalized.normalizedItemName);

        if (matchedItem) {
          const aiResponse = buildSuccessResponse({
            catalog,
            question,
            item: matchedItem,
            matchType: 'ai_normalized',
            usedAI: true,
          });

          return NextResponse.json<AskResponseBody>(await polishResponse(aiResponse, history));
        }
      }
    }

    if (searchResult.type === 'match') {
      const response = buildSuccessResponse({
        catalog,
        question,
        item: searchResult.item,
        matchType: searchResult.matchType,
      });

      return NextResponse.json<AskResponseBody>(await polishResponse(response, history));
    }

    if (searchResult.type === 'ambiguous') {
      const response = buildAmbiguousResponse({
        catalog,
        question,
        candidateNames: searchResult.candidates.map((candidate) => candidate.item.itemName),
      });

      return NextResponse.json<AskResponseBody>(await polishResponse(response, history));
    }

    const response = buildNotFoundResponse({
      catalog,
      question,
      candidateNames: searchResult.candidates.map((candidate) => candidate.item.itemName),
    });

    return NextResponse.json<AskResponseBody>(await polishResponse(response, history));
  } catch (error) {
    console.error('POST /api/ask failed', error);

    return NextResponse.json<AskResponseBody>(
      {
        ok: false,
        error: 'internal server error',
      },
      { status: 500 },
    );
  }
}
