# Message Contracts — RabbitMQ

All async communication flows through a single topic exchange `campus.events`.
Each message has a standard envelope wrapping the event-specific payload.

---

## Exchange Configuration

```
Name:    campus.events
Type:    topic
Durable: true

Dead Letter Exchange: campus.dlx
Dead Letter Queue:    campus.dead-letters
```

---

## Standard Message Envelope

Every message published to `campus.events` wraps its payload in this envelope:

```json
{
  "eventType": "<routing-key>",
  "timestamp": "2024-02-15T10:30:00Z",
  "payload": { ... }
}
```

---

## Queue Bindings

| Queue | Routing Key(s) | Consumer |
|-------|----------------|----------|
| `campus.ticket.queue` | `registration.completed` | Ticket Service |
| `campus.notification.queue` | `registration.completed` | Notification Service |
| `campus.notification.queue` | `announcement.created` | Notification Service |
| `campus.notification.queue` | `results.published` | Notification Service |
| `campus.certificate.queue` | `attendance.completed` | Certificate Service |

---

## Event: `registration.completed`

**Publisher:** Registration Service
**Consumers:** Ticket Service, Notification Service

**Trigger:** A student successfully registers for an event.

```json
{
  "eventType": "registration.completed",
  "timestamp": "2024-02-15T10:30:00Z",
  "payload": {
    "registrationId": 1,
    "studentId": "STU-001",
    "studentName": "Alice Johnson",
    "studentEmail": "alice@college.edu",
    "eventId": 1,
    "eventTitle": "Spring Boot Workshop",
    "eventDate": "2024-02-20T10:00:00Z"
  }
}
```

**Ticket Service action:**
1. Validate registration via Feign call to Registration Service
2. Generate QR code using ZXing with content:
   ```json
   { "registrationId": 1, "studentId": "STU-001", "eventId": 1 }
   ```
3. Store base64 PNG in `ticket_db`

**Notification Service action:**
1. Log notification record:
   - `type`: `REGISTRATION`
   - `subject`: `"Registration Confirmed: Spring Boot Workshop"`
   - `message`: `"You have successfully registered for Spring Boot Workshop on Feb 20, 2024."`

---

## Event: `attendance.completed`

**Publisher:** Attendance Service
**Consumer:** Certificate Service

**Trigger:** Attendance is marked as PRESENT for a student.

```json
{
  "eventType": "attendance.completed",
  "timestamp": "2024-02-20T11:00:00Z",
  "payload": {
    "attendanceId": 1,
    "registrationId": 1,
    "studentId": "STU-001",
    "studentName": "Alice Johnson",
    "studentEmail": "alice@college.edu",
    "eventId": 1,
    "eventTitle": "Spring Boot Workshop",
    "markedAt": "2024-02-20T10:45:00Z"
  }
}
```

**Certificate Service action:**
1. Verify attendance via Feign call to Attendance Service
2. Generate PDF certificate using PDFBox with:
   - Student name
   - Event title
   - Date
   - Unique certificate number (UUID-based)
3. Store certificate record + PDF bytes in `certificate_db`

---

## Event: `announcement.created`

**Publisher:** Announcement Service
**Consumer:** Notification Service

**Trigger:** An announcement is published.

```json
{
  "eventType": "announcement.created",
  "timestamp": "2024-02-18T09:00:00Z",
  "payload": {
    "announcementId": 1,
    "title": "Venue Change Notice",
    "content": "The venue for Spring Boot Workshop has been changed to Room 301, Block B.",
    "eventId": 1,
    "eventTitle": "Spring Boot Workshop",
    "type": "VENUE_CHANGE",
    "publishedBy": "admin"
  }
}
```

**Notification Service action:**
1. Log notification record:
   - `type`: based on announcement `type` field
   - `subject`: announcement `title`
   - `message`: announcement `content`
   - `recipientId`: null (broadcast — log once)

---

## Event: `results.published`

**Publisher:** Leaderboard Service
**Consumer:** Notification Service

**Trigger:** Competition results are published.

```json
{
  "eventType": "results.published",
  "timestamp": "2024-02-20T18:00:00Z",
  "payload": {
    "eventId": 1,
    "eventTitle": "Hackathon 2024",
    "publishedAt": "2024-02-20T18:00:00Z",
    "topResults": [
      {
        "position": 1,
        "studentId": "STU-001",
        "studentName": "Alice Johnson",
        "category": "Overall",
        "points": 100
      },
      {
        "position": 2,
        "studentId": "STU-002",
        "studentName": "Bob Smith",
        "category": "Overall",
        "points": 80
      }
    ]
  }
}
```

**Notification Service action:**
1. Log notification:
   - `type`: `RESULT`
   - `subject`: `"Results Published: Hackathon 2024"`
   - `message`: `"Results for Hackathon 2024 are now available. Top performer: Alice Johnson (1st place)"`

---

## Idempotency

Each consumer must handle duplicate messages safely:

| Consumer | Idempotency Strategy |
|----------|---------------------|
| Ticket Service | Check for existing ticket with `registrationId` before generating |
| Certificate Service | Check for existing certificate with `registrationId` before generating |
| Notification Service | Allow duplicates (append-only log — duplicate notifications are acceptable) |

---

## RabbitMQ Configuration (Spring Boot)

Each service that consumes or publishes declares its own beans:

```java
@Configuration
public class RabbitMQConfig {

    public static final String EXCHANGE = "campus.events";
    public static final String TICKET_QUEUE = "campus.ticket.queue";
    public static final String NOTIFICATION_QUEUE = "campus.notification.queue";
    public static final String CERTIFICATE_QUEUE = "campus.certificate.queue";
    public static final String DLX = "campus.dlx";
    public static final String DLQ = "campus.dead-letters";

    @Bean
    public TopicExchange campusExchange() {
        return new TopicExchange(EXCHANGE, true, false);
    }

    @Bean
    public DirectExchange deadLetterExchange() {
        return new DirectExchange(DLX, true, false);
    }

    @Bean
    public Queue deadLetterQueue() {
        return QueueBuilder.durable(DLQ).build();
    }

    // Service-specific queue — example for Ticket Service:
    @Bean
    public Queue ticketQueue() {
        return QueueBuilder.durable(TICKET_QUEUE)
            .withArgument("x-dead-letter-exchange", DLX)
            .withArgument("x-dead-letter-routing-key", "dead-letter")
            .build();
    }

    @Bean
    public Binding ticketBinding(Queue ticketQueue, TopicExchange campusExchange) {
        return BindingBuilder.bind(ticketQueue)
            .to(campusExchange)
            .with("registration.completed");
    }
}
```

---

## Message Flow Diagram

```
Registration Service
       │
       │  POST /api/registrations
       │  (sync: validates Event + Venue)
       │
       ├──► campus.events [registration.completed]
       │           │
       │           ├──► campus.ticket.queue ──► Ticket Service
       │           │                             (generates QR)
       │           │
       │           └──► campus.notification.queue ──► Notification Service
       │                                               (logs confirmation)
       │
Attendance Service
       │
       │  POST /api/attendance
       │  (sync: validates Registration)
       │
       └──► campus.events [attendance.completed]
                   │
                   └──► campus.certificate.queue ──► Certificate Service
                                                      (generates PDF cert)

Announcement Service
       │
       └──► campus.events [announcement.created]
                   │
                   └──► campus.notification.queue ──► Notification Service
                                                       (logs broadcast)

Leaderboard Service
       │
       └──► campus.events [results.published]
                   │
                   └──► campus.notification.queue ──► Notification Service
                                                       (logs result notif)
```
