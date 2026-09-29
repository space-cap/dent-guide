# API 설계 문서

## 1. 목표

사용자의 자연어 질문을 받아 JSON 가격 데이터를 조회하고, 공개 정책에 맞는 응답을 반환하는 API를 설계한다.

MVP에서는 하나의 핵심 API만 우선 제공한다.

- `POST /api/ask`

## 2. 엔드포인트

### `POST /api/ask`
사용자 질문을 받아 가격 답변을 반환한다.

## 3. 요청 형식

```json
{
  "question": "지르코니아 크라운 얼마야?"
}
```

### 요청 필드

| 필드 | 타입 | 필수 | 설명 |
|---|---|---:|---|
| `question` | string | Y | 사용자 질문 |

## 4. 응답 형식

```json
{
  "ok": true,
  "question": "지르코니아 크라운 얼마야?",
  "matchType": "direct",
  "item": {
    "id": "zirconia-crown",
    "itemName": "지르코니아 크라운",
    "category": "크라운",
    "displayType": "exact"
  },
  "answer": "지르코니아 크라운 가격은 50만원입니다. 치아 상태에 따라 최종 비용은 달라질 수 있습니다.",
  "version": "2026-09"
}
```

## 5. 응답 필드

| 필드 | 타입 | 설명 |
|---|---|---|
| `ok` | boolean | 처리 성공 여부 |
| `question` | string | 원본 질문 |
| `matchType` | string | `direct`, `alias`, `ai_normalized`, `not_found`, `ambiguous` |
| `item` | object \| null | 매칭된 항목 요약 |
| `answer` | string | 사용자에게 보여줄 최종 응답 |
| `version` | string | 사용된 가격표 버전 |
| `candidates` | array | 다중 후보가 있을 때 반환 가능 |

## 6. 처리 순서

### 1단계: 입력 검증
- `question`이 비어 있으면 에러 반환
- 너무 긴 텍스트는 잘라내거나 거부

### 2단계: 질문 정규화
- trim
- 연속 공백 정리
- 비교용 소문자 변환

### 3단계: 직접 검색
다음 순서대로 시도한다.

1. `itemName` 매칭
2. `aliases` 매칭
3. `keywords` 매칭
4. 간단한 점수 기반 후보 추출

### 4단계: OpenAI 보조 정규화
직접 검색 실패 또는 애매한 경우에만 호출한다.

OpenAI에 기대하는 출력 예시:

```json
{
  "normalizedItemName": "지르코니아 크라운",
  "reason": "'앞니 하얀 크라운'은 보통 지르코니아 크라운을 의미할 가능성이 높음"
}
```

### 5단계: 공개 정책 반영
조회된 항목의 `displayType`에 따라 응답을 생성한다.

## 7. displayType별 응답 규칙

### 7.1 exact
- `price`를 사용해 정확한 금액 응답

예시:
```json
{
  "ok": true,
  "matchType": "direct",
  "answer": "지르코니아 크라운 가격은 50만원입니다."
}
```

### 7.2 range
- `minPrice`, `maxPrice`를 사용해 범위 응답

예시:
```json
{
  "ok": true,
  "matchType": "alias",
  "answer": "오스템 임플란트는 99만~149만원 범위입니다."
}
```

### 7.3 inquiry_only
- 금액 없이 상담 유도 응답

예시:
```json
{
  "ok": true,
  "matchType": "direct",
  "answer": "뼈이식 비용은 상태에 따라 달라져 정확한 비용은 진단 후 안내 가능합니다."
}
```

### 7.4 hidden
- 외부 노출 불가 처리
- `not_found`처럼 응답하거나 일반 상담 유도 문구 사용

## 8. 매칭 실패 응답

```json
{
  "ok": true,
  "question": "치아 씌우는 비용 궁금해",
  "matchType": "not_found",
  "item": null,
  "answer": "정확한 항목을 찾지 못했습니다. 크라운, 임플란트, 레진 중 어떤 치료인지 알려주시면 더 정확히 안내드릴게요.",
  "version": "2026-09"
}
```

## 9. 다중 후보 응답

```json
{
  "ok": true,
  "question": "크라운 얼마야?",
  "matchType": "ambiguous",
  "item": null,
  "candidates": [
    "지르코니아 크라운",
    "PFM 크라운",
    "골드 크라운"
  ],
  "answer": "크라운은 재질에 따라 가격이 다릅니다. 지르코니아, PFM, 골드 중 어떤 재질을 원하시나요?",
  "version": "2026-09"
}
```

## 10. 에러 응답

### 잘못된 요청
```json
{
  "ok": false,
  "error": "question is required"
}
```

### 서버 오류
```json
{
  "ok": false,
  "error": "internal server error"
}
```

## 11. OpenAI 사용 원칙

- 모든 질문에 OpenAI를 사용하지 않는다.
- 직접 매칭 실패 시에만 제한적으로 사용한다.
- OpenAI는 가격을 계산하거나 생성하지 않는다.
- OpenAI 출력은 `normalizedItemName` 같은 보조 신호로만 사용한다.

## 12. 로깅 권장 항목

MVP에서도 아래는 남겨두면 유용하다.

- 원본 질문
- 직접 매칭 성공/실패 여부
- OpenAI 사용 여부
- 최종 매칭 항목
- 응답 타입

추후 검색 정확도 개선에 도움이 된다.
