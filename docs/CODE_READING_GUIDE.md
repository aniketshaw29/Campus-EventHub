# How to Read the Codebase

A step-by-step guide to understanding the project. Each step builds on the previous one — follow them in order.

---

## The Mental Model (read this first)

Every service in this project follows the exact same 4-layer stack:

```
HTTP request
    → Controller          maps URL to a method
        → Service         business logic
            → Repository  reads/writes the database
            → Publisher   (optional) fires a RabbitMQ message

RabbitMQ message
    → Consumer            @RabbitListener, like a controller for async
        → Service         same layer as above
            → Repository  reads/writes the database
```

Once you understand one service deeply, every other service is just a variation.

---

## Step 1 — Understand the project shape

**Time: 5 minutes**

Read [pom.xml](../pom.xml) at the project root. Only look at two sections:
- `<modules>` — the 14 services
- `<dependencyManagement>` — Spring Boot 3.2.5 + Spring Cloud 2023 shared by all

**What you learn:** This is a Maven multi-module project. Every service inherits the same parent POM so they all use the same framework versions.

---

## Step 2 — Service registry (Eureka)

**Time: 10 minutes**

Read in this order:

1. [eureka-server/src/main/resources/application.yml](../eureka-server/src/main/resources/application.yml)
   Focus on `register-with-eureka: false` and `fetch-registry: false` — it doesn't register itself.

2. [eureka-server/src/main/java/com/campuseventhub/eureka/EurekaServerApplication.java](../eureka-server/src/main/java/com/campuseventhub/eureka/EurekaServerApplication.java)
   It's just `@EnableEurekaServer` on `main`. That's all Eureka needs.

**What you learn:** Eureka is a phone book. Every service registers itself here by name when it starts. Other services look each other up by name instead of hardcoded IPs or ports.

---

## Step 3 — API Gateway (routing)

**Time: 10 minutes**

Read:

1. [api-gateway/src/main/resources/application.yml](../api-gateway/src/main/resources/application.yml)
   Focus on the `routes:` block. Each entry maps a URL path pattern to a service name.

**What you learn:** The gateway is the single front door. Everything from the browser hits port `4069`, and Spring Cloud Gateway forwards it to whichever service owns that path — without the caller knowing where the service lives.

---

## Step 4 — Simplest service: pure CRUD (event-service)

**Time: 30 minutes**

`event-service` has no external calls and no messaging. It's the cleanest example of the 4-layer pattern.

Read in this order:

1. [event-service/src/main/java/com/campuseventhub/event/entity/Event.java](../event-service/src/main/java/com/campuseventhub/event/entity/Event.java)
   `@Entity` maps this class to a database table. Each field is a column.

2. [event-service/src/main/java/com/campuseventhub/event/repository/EventRepository.java](../event-service/src/main/java/com/campuseventhub/event/repository/EventRepository.java)
   Extends `JpaRepository` — Spring Data generates all SQL automatically from method names like `findByStatus`.

3. [event-service/src/main/java/com/campuseventhub/event/service/EventService.java](../event-service/src/main/java/com/campuseventhub/event/service/EventService.java)
   Business logic lives here. Notice it throws specific exceptions (`EventNotFoundException`, capacity conflict) instead of letting raw DB errors bubble up.

4. [event-service/src/main/java/com/campuseventhub/event/controller/EventController.java](../event-service/src/main/java/com/campuseventhub/event/controller/EventController.java)
   Maps HTTP verbs and paths (`GET /api/events/{id}`) to service methods. Returns `ResponseEntity` with the correct status code.

**What you learn:** Entity → Repository → Service → Controller. Every service in this project follows this exact stack. Learn it once here, apply it everywhere.

---

## Step 5 — Service calling another service (registration-service)

**Time: 30 minutes**

`registration-service` calls `event-service` over HTTP using Feign. It also has a circuit breaker.

Read in this order:

1. [registration-service/src/main/java/com/campuseventhub/registration/client/EventClient.java](../registration-service/src/main/java/com/campuseventhub/registration/client/EventClient.java)
   An interface annotated `@FeignClient`. Spring generates the actual HTTP call from it — you just call `eventClient.getEventById(id)` like a normal method.

2. [registration-service/src/main/java/com/campuseventhub/registration/client/EventClientFallback.java](../registration-service/src/main/java/com/campuseventhub/registration/client/EventClientFallback.java)
   What happens when `event-service` is down. Instead of crashing, this fallback runs — controlled failure.

3. [registration-service/src/main/java/com/campuseventhub/registration/service/RegistrationService.java](../registration-service/src/main/java/com/campuseventhub/registration/service/RegistrationService.java)
   See how it calls `eventClient.getEventById()` then checks capacity before saving. Two services coordinating through a simple method call.

**What you learn:** Feign turns an HTTP call into a method call. Resilience4j wraps it with a circuit breaker — if `event-service` is down, the fallback kicks in instead of the whole request failing.

---

## Step 6 — Async messaging: publishing (registration-service continued)

**Time: 20 minutes**

After saving a registration, the service fires a RabbitMQ message without waiting for anyone to process it.

Read in this order:

1. [registration-service/src/main/java/com/campuseventhub/registration/config/RabbitMQConfig.java](../registration-service/src/main/java/com/campuseventhub/registration/config/RabbitMQConfig.java)
   Defines the exchange, queues, and routing keys. Think of the exchange as a post office, routing keys as addresses, and queues as mailboxes.

2. [registration-service/src/main/java/com/campuseventhub/registration/messaging/RegistrationEventPublisher.java](../registration-service/src/main/java/com/campuseventhub/registration/messaging/RegistrationEventPublisher.java)
   Uses `RabbitTemplate.convertAndSend()` to drop a message on the exchange. It doesn't know or care who picks it up.

**What you learn:** Publishing is fire-and-forget. The service sends a message and moves on immediately. This decouples services — `registration-service` doesn't import or depend on `ticket-service` at all.

---

## Step 7 — Async messaging: consuming (ticket-service)

**Time: 20 minutes**

`ticket-service` listens for the registration message and generates a QR code ticket.

Read in this order:

1. [ticket-service/src/main/java/com/campuseventhub/ticket/messaging/TicketMessageConsumer.java](../ticket-service/src/main/java/com/campuseventhub/ticket/messaging/TicketMessageConsumer.java)
   `@RabbitListener` is the async entry point — just like `@GetMapping` is the HTTP entry point. When a message arrives, this method runs.

2. [ticket-service/src/main/java/com/campuseventhub/ticket/service/TicketService.java](../ticket-service/src/main/java/com/campuseventhub/ticket/service/TicketService.java)
   Look at `generateTicket()`. The first thing it does is check if a ticket already exists for this registration — if yes, it returns the existing one and does nothing. This is idempotency: safe to receive the same message twice.

**What you learn:** `@RabbitListener` is the consumer equivalent of a controller. The idempotency guard (`findByRegistrationId` before creating) means duplicate messages don't cause duplicate data.

---

## Step 8 — The full async chain (attendance → certificate)

**Time: 20 minutes**

`attendance-service` does everything: calls Feign, saves to DB, publishes a message. `certificate-service` consumes it and generates a PDF. Two services connected only through a queue.

Read in this order:

1. [attendance-service/src/main/java/com/campuseventhub/attendance/service/AttendanceService.java](../attendance-service/src/main/java/com/campuseventhub/attendance/service/AttendanceService.java)
   One method: Feign call to validate → save attendance → publish `attendance.completed` event.

2. [certificate-service/src/main/java/com/campuseventhub/certificate/messaging/CertificateMessageConsumer.java](../certificate-service/src/main/java/com/campuseventhub/certificate/messaging/CertificateMessageConsumer.java)
   Receives `attendance.completed`, calls `certificateService.generateCertificate()`. No HTTP call, no knowledge of attendance-service.

**What you learn:** This is the full async chain.

```
Browser → attendance-service (HTTP)
    → validate via Feign (sync)
    → save to DB
    → publish attendance.completed (async, fire-and-forget)
        → certificate-service picks it up
            → generates PDF
            → saves to DB
```

No direct coupling between the two services. If `certificate-service` is down, the message waits in the queue and gets processed when it comes back up.

---

## After Step 8

The remaining services are all simpler variations:

| Service | Pattern | New concept |
|---------|---------|-------------|
| `venue-service` | Pure CRUD (Step 4) | Booking + overlap conflict detection |
| `notification-service` | Consumer only (Step 7) | Handles 3 different routing keys in one consumer |
| `feedback-service` | Pure CRUD + aggregation | Summary avg/distribution computed in the service layer |
| `leaderboard-service` | CRUD + publisher | Auto-assigns points based on position enum |
| `announcement-service` | CRUD + publisher | Broadcasts to all via `announcement.created` routing key |
| `resource-service` | CRUD + file storage | `StorageService` abstraction over local filesystem |
| `sponsor-service` | Two entities, CRUD | `Sponsor` + `EventSponsor` join table, unique constraint |

---

## Message flow across the whole system

```
register student
    └─ registration.completed ──► ticket-service     (QR ticket)
                                └► notification-service (registration email)

mark attendance
    └─ attendance.completed ────► certificate-service (PDF cert)
                                └► notification-service (attendance notification)

publish result
    └─ results.published ───────► notification-service (result notification)

create announcement
    └─ announcement.created ────► notification-service (broadcast)
```

---

## Useful reference docs

- [API Contracts](API_CONTRACTS.md) — all endpoints across every service
- [Message Contracts](MESSAGE_CONTRACTS.md) — exchange, queues, routing keys, and payload shapes
- [Architecture Reference](ARCHITECTURE.md) — deeper design decisions
- [Testing Guide](TESTING.md) — how to run tests and what each test covers
