# Campus EventHub — Microservices-based College Event Management System

A production-grade microservices application built with Java + Spring Boot for managing college events end-to-end: from creation and venue assignment through registration, attendance, certificates, and feedback.

---

## Architecture Overview

```
                          ┌─────────────────────────────────────┐
                          │           API Gateway                │
                          │       (Spring Cloud Gateway)         │
                          │            Port: 8080                │
                          └──────────────┬──────────────────────┘
                                         │
              ┌──────────────────────────┼──────────────────────────┐
              │                          │                           │
   ┌──────────▼────────┐    ┌────────────▼──────────┐  ┌───────────▼──────────┐
   │   Event Service   │    │ Registration Service  │  │   Venue Service      │
   │     Port: 8081    │    │     Port: 8082        │  │   Port: 8083         │
   └───────────────────┘    └───────────────────────┘  └──────────────────────┘
   ┌───────────────────┐    ┌───────────────────────┐  ┌──────────────────────┐
   │Attendance Service │    │ Ticket/QR Service     │  │ Notification Service │
   │     Port: 8084    │    │     Port: 8085        │  │   Port: 8086         │
   └───────────────────┘    └───────────────────────┘  └──────────────────────┘
   ┌───────────────────┐    ┌───────────────────────┐  ┌──────────────────────┐
   │Certificate Service│    │  Feedback Service     │  │ Leaderboard Service  │
   │     Port: 8087    │    │     Port: 8088        │  │   Port: 8089         │
   └───────────────────┘    └───────────────────────┘  └──────────────────────┘
   ┌───────────────────┐    ┌───────────────────────┐  ┌──────────────────────┐
   │Announcement Svc   │    │ Resource Upload Svc   │  │ Sponsor Mgmt Service │
   │     Port: 8090    │    │     Port: 8091        │  │   Port: 8092         │
   └───────────────────┘    └───────────────────────┘  └──────────────────────┘

                          ┌─────────────────────────────────────┐
                          │         Eureka Server                │
                          │       (Service Registry)             │
                          │            Port: 8761                │
                          └─────────────────────────────────────┘

                          ┌─────────────────────────────────────┐
                          │           RabbitMQ                   │
                          │       (Message Broker)               │
                          │     Port: 5672 / UI: 15672           │
                          └─────────────────────────────────────┘
```

---

## Services

| # | Service | Port | Responsibility | Database |
|---|---------|------|----------------|----------|
| 1 | Event Service | 8081 | Create/manage events | `event_db` |
| 2 | Registration Service | 8082 | Register students, track attendees | `registration_db` |
| 3 | Venue Service | 8083 | Manage venues, check availability | `venue_db` |
| 4 | Attendance Service | 8084 | Mark attendance, validate entry | `attendance_db` |
| 5 | Ticket/QR Service | 8085 | Generate & validate QR passes | `ticket_db` |
| 6 | Notification Service | 8086 | Send confirmations, reminders, alerts | `notification_db` |
| 7 | Certificate Service | 8087 | Generate & verify certificates | `certificate_db` |
| 8 | Feedback Service | 8088 | Ratings, comments, summaries | `feedback_db` |
| 9 | Leaderboard Service | 8089 | Rankings, competition results | `leaderboard_db` |
| 10 | Announcement Service | 8090 | Event announcements, broadcasts | `announcement_db` |
| 11 | Resource Upload Service | 8091 | File uploads for posters, notes | `resource_db` |
| 12 | Sponsor Service | 8092 | Sponsor details, tiers | `sponsor_db` |
| — | API Gateway | 8080 | Routing, load balancing | — |
| — | Eureka Server | 8761 | Service discovery | — |

---

## Communication

### Synchronous (REST via OpenFeign + Resilience4j)

```
Registration Service  ──► Event Service      (validate event exists, check capacity)
Registration Service  ──► Venue Service      (check venue availability)
Attendance Service    ──► Registration Service (validate student is registered)
Ticket Service        ──► Registration Service (validate registration before QR)
Certificate Service   ──► Attendance Service  (confirm attendance before cert)
```

### Asynchronous (RabbitMQ)

```
Registration completed  ──► Notification Service  (confirmation email/log)
Registration completed  ──► Ticket Service        (trigger QR generation)
Attendance completed    ──► Certificate Service   (trigger certificate generation)
Announcement created    ──► Notification Service  (broadcast announcement)
Results published       ──► Notification Service  (leaderboard notification)
```

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Language | Java 17 |
| Framework | Spring Boot 3.x |
| Service Discovery | Spring Cloud Netflix Eureka |
| API Gateway | Spring Cloud Gateway |
| Service-to-Service | OpenFeign |
| Resilience | Resilience4j (Circuit Breaker, Retry, Rate Limiter) |
| Messaging | RabbitMQ |
| Database | PostgreSQL (separate DB per service) |
| QR Generation | ZXing (Zebra Crossing) |
| PDF/Certificate | Apache PDFBox or iText |
| Containerization | Docker + Docker Compose |
| Orchestration | Kubernetes |
| Build Tool | Maven (multi-module) |

---

## Project Structure

```
campus-eventhub/
├── pom.xml                          ← Parent POM
├── eureka-server/
├── api-gateway/
├── event-service/
├── registration-service/
├── venue-service/
├── attendance-service/
├── ticket-service/
├── notification-service/
├── certificate-service/
├── feedback-service/
├── leaderboard-service/
├── announcement-service/
├── resource-service/
├── sponsor-service/
├── docker-compose.yml
├── k8s/
│   ├── namespace.yaml
│   ├── configmap.yaml
│   ├── eureka/
│   ├── gateway/
│   └── services/
└── docs/
    ├── ARCHITECTURE.md
    ├── DEVELOPMENT_PLAN.md
    ├── API_CONTRACTS.md
    └── MESSAGE_CONTRACTS.md
```

---

## Quick Start (Docker Compose)

```bash
# Build all services
mvn clean package -DskipTests

# Start all infrastructure + services
docker-compose up --build

# Access points
# API Gateway:   http://localhost:8080
# Eureka UI:     http://localhost:8761
# RabbitMQ UI:   http://localhost:15672  (guest/guest)
```

## Quick Start (Kubernetes)

```bash
# Apply all manifests
kubectl apply -f k8s/

# Check pods
kubectl get pods -n campus-eventhub

# Port-forward gateway
kubectl port-forward svc/api-gateway 8080:8080 -n campus-eventhub
```

---

## Demo Flow

1. **Create Event** → `POST /api/events`
2. **Create Venue** → `POST /api/venues`
3. **Assign Venue to Event** → `PUT /api/venues/{id}/assign/{eventId}`
4. **Student Registers** → `POST /api/registrations`
   - Validates event capacity (sync → Event Service)
   - Validates venue availability (sync → Venue Service)
   - Publishes `registration.completed` event (async)
5. **QR Pass Generated** → Ticket Service consumes `registration.completed`
6. **Notification Sent** → Notification Service consumes `registration.completed`
7. **Mark Attendance** → `POST /api/attendance`
   - Validates registration (sync → Registration Service)
   - Publishes `attendance.completed` event (async)
8. **Certificate Generated** → Certificate Service consumes `attendance.completed`
9. **Submit Feedback** → `POST /api/feedback`
10. **Publish Leaderboard** → `POST /api/leaderboard/results`
    - Publishes `results.published` event (async)

---

## Failure Scenarios (Demo)

| Scenario | Expected Behavior |
|----------|------------------|
| Event Service down | Registration returns circuit breaker fallback response |
| Registration pod killed | Kubernetes restarts pod automatically |
| RabbitMQ queue backed up | Messages persist, consumed when service recovers |
| DB connection lost | Service returns 503, Resilience4j retry kicks in |

---

## Development Phases

See [DEVELOPMENT_PLAN.md](docs/DEVELOPMENT_PLAN.md) for the full phased plan.
