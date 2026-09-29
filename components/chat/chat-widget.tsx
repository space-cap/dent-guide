'use client';

import { useMemo, useState } from 'react';

import { ChatForm } from '@/components/chat/chat-form';
import { ChatMessage } from '@/components/chat/chat-message';
import type { AskResponseBody, ChatHistoryMessage } from '@/lib/types';

type Message = {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  meta?: string;
};

const assistantName = '덴티';
const starterSuggestions = [
  '임플란트 비용 알려줘',
  '앞니를 자연스럽게 씌우는 비용이 궁금해요',
  '골이식도 같이 필요한지 궁금해',
  '크라운은 재질별로 어떻게 달라?',
];

const initialAssistantMessage: Message = {
  id: 'assistant-welcome',
  role: 'assistant',
  content:
    '안녕하세요. 저는 가격 상담 도우미 덴티예요. 치료 이름을 정확히 몰라도 괜찮아요. 증상이나 원하는 느낌을 말씀해 주시면 비용 범위와 다음 질문까지 자연스럽게 안내해드릴게요.',
  meta: '상담 시작',
};

function toHistory(messages: Message[]): ChatHistoryMessage[] {
  return messages.slice(-8).map((message) => ({ role: message.role, content: message.content }));
}

export function ChatWidget() {
  const [messages, setMessages] = useState<Message[]>([initialAssistantMessage]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [suggestions, setSuggestions] = useState<string[]>(starterSuggestions);

  const statusText = useMemo(
    () => '가격은 내부 JSON 데이터 기준으로만 안내되고, OpenAI는 자연스러운 상담 흐름과 애매한 표현 해석을 보조합니다.',
    [],
  );

  async function submitQuestion(question: string) {
    const userMessage: Message = {
      id: `${Date.now()}-user`,
      role: 'user',
      content: question,
    };

    const nextMessages = [...messages, userMessage];

    setMessages(nextMessages);
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/ask', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          question,
          history: toHistory(nextMessages),
        }),
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
          data.supportMode === 'price_found' ? '가격 안내' : data.supportMode === 'clarify' ? '추가 확인 필요' : '상담 유도',
          data.usedAI ? 'AI 보조' : '규칙 기반',
        ].join(' · '),
      };

      setMessages((previous) => [...previous, assistantMessage]);
      setSuggestions(data.followUpSuggestions);
    } catch (caughtError) {
      const message = caughtError instanceof Error ? caughtError.message : '알 수 없는 오류가 발생했습니다.';
      setError(message);
    } finally {
      setLoading(false);
    }
  }

  function resetConversation() {
    setMessages([initialAssistantMessage]);
    setSuggestions(starterSuggestions);
    setError(null);
  }

  return (
    <section className="chatWidget">
      <div className="panelHeader panelHeaderChat">
        <div className="assistantProfile">
          <img className="assistantHeroAvatar" src="/mascot-denti.svg" alt="덴티 캐릭터" width={68} height={68} />
          <div>
            <p className="eyebrow">Dental Consultation Assistant</p>
            <h2>{assistantName}와 상담하기</h2>
            <p className="assistantStatus">실시간 가격 안내 · 맥락 이어서 대화 가능</p>
          </div>
        </div>
        <div className="chatHeaderActions">
          <span className="badge">Vercel + JSON + OpenAI</span>
          <button type="button" className="secondaryButton resetButton" onClick={resetConversation} disabled={loading}>
            대화 새로 시작
          </button>
        </div>
      </div>

      <div className="assistantOverviewCard">
        <p>{statusText}</p>
      </div>

      <div className="suggestions suggestionsTop">
        {suggestions.map((question) => (
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
        {messages.map((message) => (
          <ChatMessage
            key={message.id}
            role={message.role}
            content={message.content}
            meta={message.meta}
            assistantName={assistantName}
          />
        ))}
        {loading ? <p className="emptyState">덴티가 답변을 정리하고 있어요...</p> : null}
        {error ? <p className="errorText">오류: {error}</p> : null}
      </div>

      <ChatForm disabled={loading} onSubmit={submitQuestion} />
    </section>
  );
}
