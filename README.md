# dent-guide

Next.js + Vercel + JSON 기반의 치과 가격 Q&A MVP입니다.

## 핵심 아이디어
- 가격 원본은 `data/prices.json`
- 가격 계산/생성은 하지 않고 JSON 데이터만 사용
- OpenAI는 애매한 질문 해석에만 선택적으로 사용
- 전체 가격표 공개 대신 질문형 인터페이스 제공

## 실행
```bash README.md
npm install
npm run dev
```

## 환경변수
로컬에서 OpenAI를 사용하려면 `.env.local`에 아래 값을 넣습니다.

```env README.md
OPENAI_API_KEY=sk-...
OPENAI_MODEL=gpt-4.1-mini
NEXT_PUBLIC_CLINIC_NAME=예시치과
```

API 키가 없어도 기본 JSON 검색은 동작합니다.

브라우저 경로:
- `/`
- `/chat`

## API
- `POST /api/ask`

예시 요청:
```json README.md
{
  "question": "임플란트 비용 알려줘"
}
```

## 검색엔진 노출 정책
이 프로젝트는 MVP 기본값으로 검색엔진 색인을 막습니다.

- robots metadata
- `robots.txt` 차단
- `X-Robots-Tag: noindex, nofollow, noarchive`

## 문서
상세 문서는 `docs/` 폴더 참고.
