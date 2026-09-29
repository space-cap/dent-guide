'use client';

import { FormEvent, useState } from 'react';

type ChatFormProps = {
  disabled?: boolean;
  initialQuestion?: string;
  onSubmit: (question: string) => Promise<void> | void;
};

export function ChatForm({ disabled = false, initialQuestion = '', onSubmit }: ChatFormProps) {
  const [question, setQuestion] = useState(initialQuestion);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const trimmed = question.trim();
    if (!trimmed || disabled) {
      return;
    }

    await onSubmit(trimmed);
    setQuestion('');
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
        placeholder="예: 지르코니아 크라운 얼마야?"
        value={question}
        onChange={(event) => setQuestion(event.target.value)}
        rows={3}
        maxLength={300}
        disabled={disabled}
      />
      <button className="primaryButton" type="submit" disabled={disabled || !question.trim()}>
        {disabled ? '답변 생성 중...' : '질문하기'}
      </button>
    </form>
  );
}
