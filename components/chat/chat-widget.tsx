'use client';

import { useMemo, useState } from 'react';

import { ChatForm } from '@/components/chat/chat-form';
import { ChatMessage } from '@/components/chat/chat-message';
import type { AskResponseBody } from '@/lib/types';

type Message = {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  meta?: string;
};

const suggestedQuestions = [
  '지르코니아 크라운 얼마야?',
  '임플란트 비용 알려줘',
  '레진 충전 가격 궁금해',
  '골이식 비용은?',
  '크라운 얼마야?',
];

export function ChatWidget() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const emptyStateText = useMemo(
    () => '정확한 가격은 JSON 데이터 기준으로만 답변합니다. 애매한 표현은 가능한 경우에만 OpenAI가 보조 해석합니다.',
    [],
  );

  async function submitQuestion(question: string) {
    const userMessage: Message = {
      id: `${Date.now()}-user`,
      role: 'user',
      content: question,
    };

    setMessages((previous) => [...previous, userMessage]);
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/ask', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ question }),
      });

      const data = (await response.json()) as AskResponseBody;

      if (!response.ok || !data.ok) {
        throw new Error(data.ok ? '요청 처리에 실패했습니다.' : data.error);
      }

      const assistantMessage: Message = {
        id: `${Date.now()}-assistant`,
        role: 'assistant',
        content: data.answer,
        meta: [
          `매칭: ${data.matchType}`,
          data.usedAI ? 'AI 보조 사용' : '규칙 기반 우선',
          `버전: ${data.version}`,
        ].join(' · '),
      };

      setMessages((previous) => [...previous, assistantMessage]);
    } catch (caughtError) {
      const message = caughtError instanceof Error ? caughtError.message : '알 수 없는 오류가 발생했습니다.';
      setError(message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="chatWidget">
      <div className="panelHeader">
        <div>
          <p className="eyebrow">Dental Price QA MVP</p>
          <h2>질문형 가격 안내</h2>
        </div>
        <span className="badge">Vercel + JSON</span>
      </div>

      <div className="suggestions">
        {suggestedQuestions.map((question) => (
          <button
            key={question}
            type="button"
            className="suggestionChip"
            disabled={loading}
            onClick={() => {
              void submitQuestion(question);
            }}
          >
            {question}
          </button>
        ))}
      </div>

      <div className="messagesArea">
        {messages.length === 0 ? <p className="emptyState">{emptyStateText}</p> : null}
        {messages.map((message) => (
          <ChatMessage key={message.id} role={message.role} content={message.content} meta={message.meta} />
        ))}
        {error ? <p className="errorText">오류: {error}</p> : null}
      </div>

      <ChatForm disabled={loading} onSubmit={submitQuestion} />
    </section>
  );
}
