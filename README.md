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

## 문서
상세 문서는 `docs/` 폴더 참고.
