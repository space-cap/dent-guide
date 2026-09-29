import { ChatWidget } from '@/components/chat/chat-widget';

export default function ChatPage() {
  return (
    <main className="chatPage">
      <div className="chatLayout">
        <section className="chatIntro">
          <p className="eyebrow">실사용 흐름 검증</p>
          <h1>어떤 치료 비용이 궁금하신가요?</h1>
          <p>
            환자가 자주 묻는 질문을 자연어로 입력하면, 공개 정책에 맞는 방식으로 가격을 안내합니다.
            민감한 항목은 범위 또는 상담 안내로만 응답합니다.
          </p>

          <div className="infoStack">
            <div className="infoCard compact">
              <h2>응답 정책</h2>
              <ul>
                <li>exact: 정확한 가격</li>
                <li>range: 범위형 가격</li>
                <li>inquiry_only: 상담 유도</li>
              </ul>
            </div>
            <div className="infoCard compact">
              <h2>안전 장치</h2>
              <ul>
                <li>가격은 JSON 데이터만 사용</li>
                <li>OpenAI는 질문 해석만 보조</li>
                <li>매칭 실패 시 추측하지 않음</li>
              </ul>
            </div>
          </div>
        </section>

        <ChatWidget />
      </div>
    </main>
  );
}
