# 문서 개요

이 프로젝트는 **Next.js + Vercel + JSON + OpenAI API** 기반의 **치과 가격 Q&A MVP**를 빠르게 검증하기 위한 서비스입니다.

현재 단계의 핵심 원칙은 아래와 같습니다.

- **가격 원본은 JSON 파일**로 관리한다.
- **실제 가격 판단은 JSON 데이터**를 기준으로 한다.
- **OpenAI는 질문 해석 보조** 용도로만 사용한다.
- **전체 가격표 공개 대신 질문형 노출**을 기본 정책으로 한다.
- **Vercel 배포에 맞춰 읽기 중심 구조**로 설계한다.

## 문서 목록

- [`product-requirements.md`](./product-requirements.md)
  - MVP 목표, 범위, 사용자 시나리오, 공개 정책
- [`architecture.md`](./architecture.md)
  - 시스템 구성, 요청 흐름, Vercel 환경 제약
- [`json-data-spec.md`](./json-data-spec.md)
  - `prices.json` 구조, 필드 정의, 예시 데이터
- [`api-design.md`](./api-design.md)
  - 질문 API 설계, 요청/응답 포맷, 처리 규칙
- [`implementation-plan.md`](./implementation-plan.md)
  - 개발 순서, 작업 우선순위, 완료 기준
- [`deployment.md`](./deployment.md)
  - 로컬 실행, Vercel 배포, 환경변수 가이드
- [`test-scenarios.md`](./test-scenarios.md)
  - 수동 검증용 질문 시나리오 모음

## 현재 MVP 방향

이 MVP는 아래를 빠르게 검증하는 데 목적이 있습니다.

1. 사용자가 질문형 인터페이스로 가격 정보를 잘 찾는가
2. 정확한 금액 대신 `exact / range / inquiry_only` 정책이 실용적인가
3. OpenAI를 붙였을 때 질문 해석 품질이 충분한가
4. 경쟁 치과 노출 리스크를 줄이면서도 환자에게 유용한가

## 이번 단계에서 하지 않을 것

- 관리자 업로드 시스템
- DB 연동
- PDF 자동 파싱
- 로그인/인증 기반 가격 공개 제어
- 다지점/다버전 운영 기능

위 기능들은 MVP 검증 후 2단계에서 확장합니다.

## 현재 구현 상태

현재 저장소에는 아래 MVP 구현물이 포함되어 있습니다.

- `data/prices.json` 샘플 데이터
- `/api/ask` 질문 API
- `/chat` 질문 UI
- 규칙 기반 검색 + 선택적 OpenAI fallback
- Vercel 배포를 고려한 정적 JSON 구조
