# transactional-outbox

NestJS + Prisma + Kafka로 **Transactional Outbox 패턴을 “아주 단순하게” 구현**해 본 예제 프로젝트입니다.  
블로그 글에서 설명한 흐름을 그대로 따라가며, 최소한의 코드로 다음을 확인할 수 있습니다.

- **Write path**: 주문(Order) 저장과 Outbox 이벤트 적재를 **단일 DB 트랜잭션**으로 처리
- **Relay**: Outbox 테이블을 폴링하여 Kafka로 이벤트 발행 후 `processedAt` 마킹
- **Read path**: Consumer에서 Inbox 테이블로 **멱등성(Idempotency)** 확보

블로그 글 링크: https://fredly.dev/transactional-outbox

---

## 아키텍처 한눈에 보기

1. `POST /orders` 요청 수신
2. DB 트랜잭션으로 `Order` 저장 + `Outbox` 저장
3. `OutboxProcessor`가 미처리 Outbox를 조회해 Kafka 토픽(`order.created`)으로 발행
4. `OrdersConsumer`가 메시지를 수신하고 `Inbox`에 먼저 기록해 중복 처리 방지

---

## 준비물

- Node.js / pnpm
- Docker (PostgreSQL, Kafka 실행용)

---

## 빠른 시작(로컬)

1. 의존성 설치

```bash
pnpm install
```

2. 인프라(Postgres, Kafka) 실행

```bash
docker compose up -d
```

3. 환경변수 설정

루트에 `.env`를 만들고 아래 값을 채웁니다.

```bash
DATABASE_URL="postgresql://user:password@localhost:5432/order_db?schema=public"
KAFKA_BROKERS="localhost:9092"
KAFKA_GROUP_ID="order-group"
PORT=3000
```

4. DB 마이그레이션/클라이언트 생성

```bash
pnpm db:migrate
pnpm db:generate
```

5. 애플리케이션 실행(HTTP + Kafka Consumer 함께)

```bash
pnpm start:dev
```

---

## 동작 확인

주문 생성:

```bash
curl -X POST "http://localhost:3000/orders" \
  -H "Content-Type: application/json" \
  -d '{"productId":"P-001"}'
```

기대하는 흐름:

- DB에 `Order`와 `Outbox`가 함께 저장됨
- 몇 초 내 `OutboxProcessor`가 `order.created` 이벤트를 발행하고 `processedAt`을 갱신함
- `OrdersConsumer`가 메시지를 수신하고 `Inbox`에 기록(중복이면 경고 로그 후 종료)

---

## 주요 토픽/이벤트

- Kafka topic: `order.created`
- Payload 타입(공용): `src/orders/events/order-created.event.ts`

---

## 프로젝트 구조

- `src/orders/orders.service.ts`
  - 주문 저장 + Outbox 적재를 **DB 트랜잭션으로 묶는** 핵심 코드
- `src/orders/outbox.processor.ts`
  - 미처리 Outbox 조회 → Kafka 발행 → `processedAt` 업데이트
- `src/orders/orders.consumer.ts`
  - `order.created` 수신 → Inbox 기록으로 멱등 처리
- `schema.prisma`
  - `Order`, `Outbox`, `Inbox` 모델 정의

---

## 주의/한계(의도된 단순화)

이 프로젝트는 “패턴을 이해하기 위한 최소 구현”이라 아래는 단순화되어 있습니다.

- Outbox 폴링은 크론 기반이며, 경쟁 조건/락 전략은 생략되어 있음
- 재시도, DLQ(Dead Letter Queue), 스키마 버저닝, payload 런타임 검증 등은 미포함

---

## 라이선스

MIT
