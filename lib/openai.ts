import type {
  ChatHistoryMessage,
  OpenAIConsultationReply,
  OpenAINormalizationResult,
  PriceItem,
} from '@/lib/types';

const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions';

function getModel(): string {
  return process.env.OPENAI_MODEL || 'gpt-4.1-mini';
}

function formatHistory(history: ChatHistoryMessage[] | undefined): string {
  if (!history || history.length === 0) {
    return '없음';
  }

  return history
    .slice(-6)
    .map((message) => `${message.role === 'user' ? '고객' : '상담봇'}: ${message.content}`)
    .join('\n');
}

async function requestOpenAIJson<T>(params: {
  system: string;
  prompt: string;
  temperature?: number;
}): Promise<T | null> {
  if (!isOpenAIEnabled()) {
    return null;
  }

  const response = await fetch(OPENAI_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: getModel(),
      temperature: params.temperature ?? 0,
      messages: [
        {
          role: 'system',
          content: params.system,
        },
        {
          role: 'user',
          content: params.prompt,
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
    return JSON.parse(content) as T;
  } catch {
    return null;
  }
}

export function isOpenAIEnabled(): boolean {
  return Boolean(process.env.OPENAI_API_KEY);
}

export async function normalizeQuestionWithAI(params: {
  question: string;
  items: PriceItem[];
  history?: ChatHistoryMessage[];
}): Promise<OpenAINormalizationResult | null> {
  const itemNames = params.items.map((item) => item.itemName).join(', ');

  const prompt = [
    '너는 치과 가격 검색 보조기다.',
    '사용자 질문과 최근 대화 맥락을 보고 아래 목록 중 가장 가까운 표준 치료명 하나만 고른다.',
    '가격을 만들지 말고, 반드시 목록에 있는 이름만 반환한다.',
    '적절한 항목이 없으면 null을 반환한다.',
    'JSON 형식만 반환한다.',
    '',
    `항목 목록: ${itemNames}`,
    `최근 대화: ${formatHistory(params.history)}`,
    `사용자 질문: ${params.question}`,
    '',
    '반환 형식:',
    '{"normalizedItemName":"... 또는 null","reason":"짧은 이유"}',
  ].join('\n');

  const parsed = await requestOpenAIJson<OpenAINormalizationResult>({
    system: 'You normalize Korean dental treatment questions into one of the allowed item names using only the provided list and conversation history.',
    prompt,
    temperature: 0,
  });

  if (!parsed || !('normalizedItemName' in parsed)) {
    return null;
  }

  return parsed;
}

export async function composeConsultationReply(params: {
  question: string;
  history?: ChatHistoryMessage[];
  factualAnswer: string;
  supportMode: 'price_found' | 'clarify' | 'consult';
  itemName?: string;
  displayType?: string;
  candidateNames?: string[];
  followUpSuggestions: string[];
}): Promise<OpenAIConsultationReply | null> {
  const prompt = [
    '너는 치과 상담 챗봇 "덴티"다.',
    '친절하고 따뜻한 한국어로 답하되, 절대로 제공된 사실 밖의 가격이나 치료 내용을 지어내지 않는다.',
    '답변은 2~4문장 이내로 자연스럽게 작성한다.',
    '후속 질문 suggestions는 짧은 문장 2~3개로 반환한다.',
    '반드시 아래 사실 블록만 근거로 답한다.',
    'JSON 형식만 반환한다.',
    '',
    `상담 모드: ${params.supportMode}`,
    `최근 대화: ${formatHistory(params.history)}`,
    `이번 질문: ${params.question}`,
    `매칭 항목: ${params.itemName ?? '없음'}`,
    `표시 타입: ${params.displayType ?? '없음'}`,
    `후보 항목: ${params.candidateNames?.join(', ') ?? '없음'}`,
    `사실 블록: ${params.factualAnswer}`,
    `추천 가능한 후속 질문: ${params.followUpSuggestions.join(' | ')}`,
    '',
    '반환 형식:',
    '{"message":"...","suggestions":["...","..."]}',
  ].join('\n');

  const parsed = await requestOpenAIJson<OpenAIConsultationReply>({
    system: 'You are a grounded Korean dental consultation assistant. Never invent treatments or prices. Use only provided facts.',
    prompt,
    temperature: 0.4,
  });

  if (!parsed || typeof parsed.message !== 'string') {
    return null;
  }

  return {
    message: parsed.message,
    suggestions: Array.isArray(parsed.suggestions)
      ? parsed.suggestions.filter((suggestion): suggestion is string => typeof suggestion === 'string').slice(0, 3)
      : undefined,
  };
}
