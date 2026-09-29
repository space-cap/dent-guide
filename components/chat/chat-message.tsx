type ChatMessageProps = {
  role: 'user' | 'assistant';
  content: string;
  meta?: string;
  assistantName?: string;
};

export function ChatMessage({ role, content, meta, assistantName = '덴티' }: ChatMessageProps) {
  return (
    <article className={`messageCard ${role === 'user' ? 'messageUser' : 'messageAssistant'}`}>
      <div className="messageShell">
        {role === 'assistant' ? (
          <img className="messageAvatar" src="/mascot-denti.svg" alt={`${assistantName} 캐릭터`} width={44} height={44} />
        ) : null}

        <div className="messageContent">
          <div className="messageHeader">
            <strong>{role === 'user' ? '고객' : assistantName}</strong>
            {meta ? <span>{meta}</span> : null}
          </div>
          <p>{content}</p>
        </div>
      </div>
    </article>
  );
}
