import { ChatWidget } from '@/components/chat/chat-widget';

export default function ChatPage() {
  return (
    <main className="chatPage">
      <div className="chatLayout">
        <section className="chatIntro chatIntroRich">
          <div className="introMascotCard">
            <img className="introMascotImage" src="/mascot-denti.svg" alt="덴티 캐릭터" width={120} height={120} />
            <div>
              <p className="eyebrow">실제 상담형 챗봇</p>
              <h1>덴티가 치료 비용 상담을 도와드릴게요</h1>
              <p>
                치료명을 정확히 모르셔도 괜찮아요. “앞니를 자연스럽게 씌우고 싶어요”, “빠진 치아 심는 거 비용은요?”처럼
                편하게 말씀하시면 대화 맥락을 이어서 가격, 범위, 추가 확인사항까지 자연스럽게 안내합니다.
              </p>
            </div>
          </div>

          <div className="infoStack">
            <div className="infoCard compact">
              <h2>상담 방식</h2>
              <ul>
                <li>이전 대화 맥락을 참고해 후속 질문 처리</li>
                <li>가격 안내 후 다음에 물을 만한 질문까지 제안</li>
                <li>모호한 경우에는 바로 재질/치료 종류를 다시 확인</li>
              </ul>
            </div>
            <div className="infoCard compact">
              <h2>안전 장치</h2>
              <ul>
                <li>가격은 JSON 데이터만 사용</li>
                <li>OpenAI는 질문 해석과 말투 보조만 담당</li>
                <li>찾지 못한 가격은 추측하지 않고 상담으로 연결</li>
              </ul>
            </div>
          </div>
        </section>

        <ChatWidget />
      </div>
    </main>
  );
}
