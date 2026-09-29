'use client';

import { FormEvent, KeyboardEvent, useState } from 'react';

type ChatFormProps = {
  disabled?: boolean;
  initialQuestion?: string;
  onSubmit: (question: string) => Promise<void> | void;
};

export function ChatForm({ disabled = false, initialQuestion = '', onSubmit }: ChatFormProps) {
  const [question, setQuestion] = useState(initialQuestion);

  async function submitCurrentQuestion() {
    const trimmed = question.trim();
    if (!trimmed || disabled) {
      return;
    }

    await onSubmit(trimmed);
    setQuestion('');
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await submitCurrentQuestion();
  }

  async function handleKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      await submitCurrentQuestion();
    }
  }

  return (
    <form className="chatForm" onSubmit={handleSubmit}>
      <label className="srOnly" htmlFor="question">
        가격 질문 입력
      </label>
      <textarea
        id="question"
        name="question"
        className="chatTextarea"
        placeholder="예: 앞니를 자연스럽게 씌우는 비용이 궁금해요"
        value={question}
        onChange={(event) => setQuestion(event.target.value)}
        onKeyDown={(event) => {
          void handleKeyDown(event);
        }}
        rows={3}
        maxLength={300}
        disabled={disabled}
      />
      <div className="chatFormFooter">
        <p className="chatFormHint">Enter로 전송, Shift + Enter로 줄바꿈</p>
        <button className="primaryButton" type="submit" disabled={disabled || !question.trim()}>
          {disabled ? '상담 답변 준비 중...' : '상담받기'}
        </button>
      </div>
    </form>
  );
}
