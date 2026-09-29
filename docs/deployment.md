# 배포 및 실행 가이드

## 1. 로컬 실행

### 필수 조건
- Node.js 18 이상 권장
- npm 사용 기준

### 설치
```bash package.json
npm install
```

### 개발 서버 실행
```bash package.json
npm run dev
```

브라우저에서 아래 경로를 확인한다.

- `/`
- `/chat`

## 2. OpenAI 없이 실행

이 MVP는 OpenAI API 키가 없어도 동작한다.

- 기본 검색은 `prices.json` 기반 규칙 검색으로 처리
- OpenAI는 애매한 질문일 때만 보조적으로 사용
- API 키가 없으면 AI 보조 단계를 자동으로 건너뜀

즉, 초기 검증 단계에서는 키 없이도 충분히 테스트 가능하다.

## 3. OpenAI 사용 시 환경변수

Vercel 또는 로컬 환경에 아래 값을 설정한다.

- `OPENAI_API_KEY`
- `OPENAI_MODEL` (예: `gpt-4.1-mini`)
- `NEXT_PUBLIC_CLINIC_NAME` (선택)

예시 값:
- `OPENAI_MODEL = gpt-4.1-mini`
- `NEXT_PUBLIC_CLINIC_NAME = 예시치과`

## 4. Vercel 배포

### 검색 노출 차단 기본값
이 MVP는 경쟁 치과 노출 리스크를 줄이기 위해 기본적으로 검색엔진 색인을 막도록 설정되어 있다.

적용 방식:
- `app/layout.tsx`의 robots 메타데이터
- `app/robots.ts`의 robots 정책
- `next.config.js`의 `X-Robots-Tag` 헤더

즉, 배포 후에도 기본값은 `noindex` 상태다.

### 절차
1. Git 저장소 연결
2. Vercel에서 프로젝트 import
3. Framework preset은 Next.js 사용
4. 환경변수 등록
5. 배포 실행

### 권장 환경변수
- `OPENAI_API_KEY`
- `OPENAI_MODEL`
- `NEXT_PUBLIC_CLINIC_NAME`

## 5. 운영 시 데이터 수정 방식

현재 구조는 DB가 아니라 정적 JSON 기반이다.

따라서 가격 수정은 다음 방식으로 한다.

1. `data/prices.json` 수정
2. 변경사항 커밋
3. 재배포

이 방식은 MVP에는 충분히 단순하고 빠르다.

## 6. 확인 체크리스트

배포 후 아래를 점검한다.

- 홈 화면이 정상적으로 보이는가
- `/chat`에서 질문 입력이 되는가
- `지르코니아 크라운 얼마야?` 질문 시 정상 응답하는가
- `크라운 얼마야?` 질문 시 다중 후보 안내가 되는가
- `골이식 비용은?` 질문 시 상담 유도 응답이 되는가
- OpenAI 키가 없을 때도 서버 에러가 나지 않는가
- 응답 헤더에 `X-Robots-Tag: noindex, nofollow, noarchive`가 포함되는가
- `robots.txt`가 전체 크롤링 차단으로 응답되는가
