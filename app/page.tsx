import Link from 'next/link';

export default function HomePage() {
  return (
    <main className="homePage">
      <section className="heroSection">
        <p className="eyebrow">빠른 검증용 MVP</p>
        <h1>치과 가격 질문형 안내 서비스</h1>
        <p className="heroDescription">
          가격 원본은 JSON으로 유지하고, 질문이 들어오면 서버가 해당 데이터를 찾아 응답합니다.
          OpenAI는 선택적으로 질문 해석에만 사용됩니다.
        </p>

        <div className="heroActions">
          <Link href="/chat" className="primaryButton linkButton">
            채팅 테스트 시작
          </Link>
          <a href="/api/ask" className="secondaryButton linkButton" aria-disabled="true">
            API는 POST만 지원
          </a>
        </div>
      </section>

      <section className="gridSection">
        <article className="infoCard">
          <h2>핵심 원칙</h2>
          <ul>
            <li>가격은 JSON 데이터 기준으로만 안내</li>
            <li>전체 가격표 대신 질문형 노출</li>
            <li>exact / range / inquiry_only 정책 지원</li>
          </ul>
        </article>
        <article className="infoCard">
          <h2>현재 범위</h2>
          <ul>
            <li>Next.js App Router</li>
            <li>Vercel 배포 대응</li>
            <li>OpenAI 없는 기본 검색 가능</li>
          </ul>
        </article>
        <article className="infoCard">
          <h2>확장 방향</h2>
          <ul>
            <li>질문 로그 수집</li>
            <li>CSV 업로드 도입</li>
            <li>DB 이전 판단</li>
          </ul>
        </article>
      </section>
    </main>
  );
}
