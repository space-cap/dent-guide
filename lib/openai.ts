import type { OpenAINormalizationResult, PriceItem } from '@/lib/types';

const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions';

function getModel(): string {
  return process.env.OPENAI_MODEL || 'gpt-4.1-mini';
}

export function isOpenAIEnabled(): boolean {
  return Boolean(process.env.OPENAI_API_KEY);
}

export async function normalizeQuestionWithAI(params: {
  question: string;
  items: PriceItem[];
}): Promise<OpenAINormalizationResult | null> {
  if (!isOpenAIEnabled()) {
    return null;
  }

  const itemNames = params.items.map((item) => item.itemName).join(', ');

  const prompt = [
    '너는 치과 가격 검색 보조기다.',
    '사용자 질문을 보고 아래 목록 중 가장 가까운 표준 치료명 하나만 고른다.',
    '가격을 만들지 말고, 반드시 목록에 있는 이름만 반환한다.',
    '적절한 항목이 없으면 null을 반환한다.',
    'JSON 형식만 반환한다.',
    '',
    `항목 목록: ${itemNames}`,
    `사용자 질문: ${params.question}`,
    '',
    '반환 형식:',
    '{"normalizedItemName":"... 또는 null","reason":"짧은 이유"}',
  ].join('\n');

  const response = await fetch(OPENAI_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: getModel(),
      temperature: 0,
      messages: [
        {
          role: 'system',
          content: 'You normalize Korean dental treatment questions into one of the allowed item names.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      response_format: {
        type: 'json_object',
      },
    }),
  });

  if (!response.ok) {
    return null;
  }

  const data = (await response.json()) as {
    choices?: Array<{
      message?: {
        content?: string;
      };
    }>;
  };

  const content = data.choices?.[0]?.message?.content;

  if (!content) {
    return null;
  }

  try {
    const parsed = JSON.parse(content) as OpenAINormalizationResult;
    if (!('normalizedItemName' in parsed)) {
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}
