type ChatMessageProps = {
  role: 'user' | 'assistant';
  content: string;
  meta?: string;
};

export function ChatMessage({ role, content, meta }: ChatMessageProps) {
  return (
    <article className={`messageCard ${role === 'user' ? 'messageUser' : 'messageAssistant'}`}>
      <div className="messageHeader">
        <strong>{role === 'user' ? '질문' : '답변'}</strong>
        {meta ? <span>{meta}</span> : null}
      </div>
      <p>{content}</p>
    </article>
  );
}
