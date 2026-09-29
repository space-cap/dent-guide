import { NextResponse } from 'next/server';

import { findByNormalizedItemName, findPriceItem, getCatalog, getPublicItems } from '@/lib/price-search';
import { buildAmbiguousResponse, buildNotFoundResponse, buildSuccessResponse } from '@/lib/response-builder';
import { isOpenAIEnabled, normalizeQuestionWithAI } from '@/lib/openai';
import type { AskRequestBody, AskResponseBody } from '@/lib/types';

export const runtime = 'nodejs';

type SafeRequestBody = Partial<AskRequestBody>;

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

    if (searchResult.type === 'match') {
      return NextResponse.json<AskResponseBody>(
        buildSuccessResponse({
          catalog,
          question,
          item: searchResult.item,
          matchType: searchResult.matchType,
        }),
      );
    }

    if (searchResult.type === 'ambiguous') {
      return NextResponse.json<AskResponseBody>(
        buildAmbiguousResponse({
          catalog,
          question,
          candidateNames: searchResult.candidates.map((candidate) => candidate.item.itemName),
        }),
      );
    }

    if (isOpenAIEnabled()) {
      const normalized = await normalizeQuestionWithAI({
        question,
        items: getPublicItems(),
      });

      if (normalized?.normalizedItemName) {
        const matchedItem = findByNormalizedItemName(normalized.normalizedItemName);

        if (matchedItem) {
          return NextResponse.json<AskResponseBody>(
            buildSuccessResponse({
              catalog,
              question,
              item: matchedItem,
              matchType: 'ai_normalized',
              usedAI: true,
            }),
          );
        }
      }
    }

    return NextResponse.json<AskResponseBody>(
      buildNotFoundResponse({
        catalog,
        question,
        candidateNames: searchResult.candidates.map((candidate) => candidate.item.itemName),
      }),
    );
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
