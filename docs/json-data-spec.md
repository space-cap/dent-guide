# JSON 데이터 명세

## 1. 목적

`data/prices.json`은 MVP 단계의 **가격 데이터 단일 원본**이다.

이 파일은 다음 요구를 만족해야 한다.

- 사람이 직접 수정 가능해야 한다.
- 질문 검색에 필요한 별칭 정보를 포함해야 한다.
- 공개 정책을 항목별로 제어할 수 있어야 한다.
- 향후 DB로 이전하기 쉬운 구조여야 한다.

## 2. 최상위 구조

```json
{
  "version": "2026-09",
  "updatedAt": "2026-09-29T10:00:00Z",
  "clinicName": "예시치과",
  "currency": "KRW",
  "items": []
}
```

## 3. 최상위 필드 정의

| 필드 | 타입 | 필수 | 설명 |
|---|---|---:|---|
| `version` | string | Y | 가격표 버전 |
| `updatedAt` | string | Y | 마지막 수정 시각 ISO 문자열 |
| `clinicName` | string | N | 치과명 |
| `currency` | string | Y | 통화 코드, 기본 `KRW` |
| `items` | array | Y | 가격 항목 목록 |

## 4. 가격 항목 구조

```json
{
  "id": "zirconia-crown",
  "category": "크라운",
  "itemName": "지르코니아 크라운",
  "aliases": ["지르코니아", "흰색 크라운", "하얀 크라운"],
  "displayType": "exact",
  "price": 500000,
  "public": true,
  "note": "치아 상태에 따라 최종 비용은 달라질 수 있습니다.",
  "keywords": ["보철", "앞니", "어금니"]
}
```

## 5. 가격 항목 필드 정의

| 필드 | 타입 | 필수 | 설명 |
|---|---|---:|---|
| `id` | string | Y | 내부 식별자, 고유값 |
| `category` | string | Y | 분류명 예: 임플란트, 크라운 |
| `itemName` | string | Y | 표준 노출명 |
| `aliases` | string[] | N | 사용자 표현 대응용 별칭 |
| `displayType` | string | Y | `exact`, `range`, `inquiry_only`, `hidden` |
| `price` | number | 조건부 | `exact`일 때 사용 |
| `minPrice` | number | 조건부 | `range`일 때 사용 |
| `maxPrice` | number | 조건부 | `range`일 때 사용 |
| `public` | boolean | Y | 외부 노출 가능 여부 |
| `note` | string | N | 부가 설명 |
| `keywords` | string[] | N | 단순 검색용 보조 키워드 |

## 6. displayType 규칙

### 6.1 `exact`
정확한 가격을 공개한다.

필수 필드:
- `price`

예시:
```json
{
  "id": "resin-filling",
  "category": "충전",
  "itemName": "레진 충전",
  "displayType": "exact",
  "price": 80000,
  "public": true
}
```

### 6.2 `range`
정확한 단일 금액 대신 범위를 공개한다.

필수 필드:
- `minPrice`
- `maxPrice`

예시:
```json
{
  "id": "implant-osstem",
  "category": "임플란트",
  "itemName": "오스템 임플란트",
  "displayType": "range",
  "minPrice": 990000,
  "maxPrice": 1490000,
  "public": true
}
```

### 6.3 `inquiry_only`
가격 수치 대신 상담 필요 메시지를 노출한다.

예시:
```json
{
  "id": "bone-graft",
  "category": "부가 시술",
  "itemName": "뼈이식",
  "displayType": "inquiry_only",
  "public": true,
  "note": "정확한 비용은 진단 후 안내드립니다."
}
```

### 6.4 `hidden`
외부 응답에서 제외한다.

예시:
```json
{
  "id": "internal-package-a",
  "category": "내부",
  "itemName": "프로모션 패키지 A",
  "displayType": "hidden",
  "public": false
}
```

## 7. 권장 데이터 작성 원칙

### 7.1 별칭은 실제 질문 기준으로 작성
권장 예:
- `지르코니아 크라운`
  - `지르코니아`
  - `흰색 크라운`
  - `앞니 하얀 크라운`

### 7.2 항목명은 표준화
- 사용자 노출용 이름은 일관되게 유지한다.
- 같은 항목을 여러 이름으로 중복 생성하지 않는다.
- 중복 대신 `aliases`를 활용한다.

### 7.3 공개 정책을 먼저 정한다
모든 항목을 `exact`로 만들지 않는다.

권장 예:
- 스케일링: `exact`
- 임플란트: `range`
- 뼈이식: `inquiry_only`
- 내부 프로모션: `hidden`

## 8. 전체 예시

```json
{
  "version": "2026-09",
  "updatedAt": "2026-09-29T10:00:00Z",
  "clinicName": "예시치과",
  "currency": "KRW",
  "items": [
    {
      "id": "zirconia-crown",
      "category": "크라운",
      "itemName": "지르코니아 크라운",
      "aliases": ["지르코니아", "흰색 크라운", "하얀 크라운"],
      "displayType": "exact",
      "price": 500000,
      "public": true,
      "note": "치아 상태에 따라 최종 비용은 달라질 수 있습니다.",
      "keywords": ["보철", "앞니", "어금니"]
    },
    {
      "id": "implant-osstem",
      "category": "임플란트",
      "itemName": "오스템 임플란트",
      "aliases": ["임플란트", "오스템"],
      "displayType": "range",
      "minPrice": 990000,
      "maxPrice": 1490000,
      "public": true,
      "note": "뼈이식 여부에 따라 비용이 달라질 수 있습니다.",
      "keywords": ["식립", "인공치아"]
    },
    {
      "id": "bone-graft",
      "category": "부가 시술",
      "itemName": "뼈이식",
      "aliases": ["골이식", "뼈 이식"],
      "displayType": "inquiry_only",
      "public": true,
      "note": "정확한 비용은 진단 후 안내드립니다.",
      "keywords": ["임플란트 추가 시술"]
    }
  ]
}
```

## 9. 검증 규칙

개발 시 아래 규칙을 검사하는 것이 좋다.

- `id`는 고유해야 한다.
- `displayType = exact`이면 `price`가 있어야 한다.
- `displayType = range`이면 `minPrice`, `maxPrice`가 있어야 한다.
- `displayType = hidden`이면 외부 응답에 포함되면 안 된다.
- `public = false`이면 응답 대상에서 제외한다.

## 10. 향후 DB 이전 시 매핑 방향

나중에 DB로 이전할 때 아래처럼 매핑할 수 있다.

- `id` → `price_items.id`
- `category` → `price_items.category`
- `itemName` → `price_items.item_name`
- `aliases` → 별도 `aliases` 테이블 또는 JSON 컬럼
- `displayType` → `display_type`
- `price`, `minPrice`, `maxPrice` → 가격 컬럼
- `public` → `public_visible`
- `note` → `note`
