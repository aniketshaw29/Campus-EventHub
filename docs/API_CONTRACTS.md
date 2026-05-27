# API Contracts

All endpoints are accessible through the API Gateway at `http://localhost:8080`.

---

## Event Service — `/api/events`

### Create Event
```
POST /api/events
Content-Type: application/json

{
  "title": "Spring Boot Workshop",
  "description": "Hands-on Spring Boot microservices workshop",
  "eventDate": "2024-02-15T10:00:00",
  "endDate": "2024-02-15T17:00:00",
  "category": "WORKSHOP",
  "maxCapacity": 50
}

Response 201:
{
  "id": 1,
  "title": "Spring Boot Workshop",
  "status": "UPCOMING",
  "currentRegistrations": 0,
  ...
}
```

### Get All Events
```
GET /api/events

Response 200: [ { ...event }, ... ]
```

### Get Event by ID
```
GET /api/events/{id}

Response 200: { ...event }
Response 404: { "error": "Event not found" }
```

### Get Events by Status
```
GET /api/events/status/{status}
Status values: UPCOMING | ONGOING | COMPLETED | CANCELLED

Response 200: [ { ...event }, ... ]
```

### Update Event
```
PUT /api/events/{id}
Content-Type: application/json

{ ...fields to update }

Response 200: { ...updated event }
```

### Delete Event
```
DELETE /api/events/{id}

Response 204
```

### Update Capacity (internal use)
```
PUT /api/events/{id}/capacity
Content-Type: application/json

{ "delta": 1 }   // +1 to register, -1 to cancel

Response 200: { "currentRegistrations": 5 }
Response 409: { "error": "Event is at full capacity" }
```

---

## Venue Service — `/api/venues`

### Create Venue
```
POST /api/venues
Content-Type: application/json

{
  "name": "Main Auditorium",
  "location": "Block A, Ground Floor",
  "capacity": 500,
  "type": "AUDITORIUM",
  "facilities": "Projector, Sound System, AC"
}

Response 201: { "id": 1, ... }
```

### List All Venues
```
GET /api/venues

Response 200: [ { ...venue }, ... ]
```

### Get Venue by ID
```
GET /api/venues/{id}

Response 200: { ...venue }
```

### Check Availability
```
GET /api/venues/{id}/availability?startTime=2024-02-15T09:00:00&endTime=2024-02-15T18:00:00

Response 200: { "available": true }
Response 200: { "available": false, "conflict": { ...conflicting booking } }
```

### Book Venue for Event
```
POST /api/venues/{id}/book
Content-Type: application/json

{
  "eventId": 1,
  "startTime": "2024-02-15T09:00:00",
  "endTime": "2024-02-15T18:00:00"
}

Response 201: { "bookingId": 1, "venueId": 1, "eventId": 1, "status": "BOOKED" }
Response 409: { "error": "Venue is already booked for this time slot" }
```

### Cancel Booking
```
DELETE /api/venues/bookings/{bookingId}

Response 204
```

### Get Venue for Event
```
GET /api/venues/event/{eventId}

Response 200: { ...venue }
Response 404: { "error": "No venue assigned to this event" }
```

---

## Registration Service — `/api/registrations`

### Register Student
```
POST /api/registrations
Content-Type: application/json

{
  "studentId": "STU-001",
  "studentName": "Alice Johnson",
  "studentEmail": "alice@college.edu",
  "eventId": 1
}

Response 201:
{
  "id": 1,
  "studentId": "STU-001",
  "eventId": 1,
  "registeredAt": "...",
  "status": "ACTIVE"
}
Response 409: { "error": "Student already registered for this event" }
Response 409: { "error": "Event is at full capacity" }
Response 503: { "error": "Event service is currently unavailable" }
```

### Get Registration by ID
```
GET /api/registrations/{id}

Response 200: { ...registration }
```

### List Registrations for Event
```
GET /api/registrations/event/{eventId}

Response 200: [ { ...registration }, ... ]
```

### Student's Registrations
```
GET /api/registrations/student/{studentId}

Response 200: [ { ...registration }, ... ]
```

### Cancel Registration
```
DELETE /api/registrations/{id}

Response 204
```

### Check Registration Exists (used by other services)
```
GET /api/registrations/{id}/exists

Response 200: { "exists": true, "status": "ACTIVE" }
Response 200: { "exists": false }
```

---

## Attendance Service — `/api/attendance`

### Mark Attendance
```
POST /api/attendance
Content-Type: application/json

{
  "registrationId": 1,
  "studentId": "STU-001",
  "eventId": 1
}

Response 201: { "id": 1, "status": "PRESENT", "markedAt": "..." }
Response 404: { "error": "Registration not found" }
Response 409: { "error": "Attendance already marked" }
```

### Get Attendees for Event
```
GET /api/attendance/event/{eventId}

Response 200: [ { ...attendance }, ... ]
```

### Student's Attendance History
```
GET /api/attendance/student/{studentId}

Response 200: [ { ...attendance }, ... ]
```

### Check Attendance Status (used by Certificate Service)
```
GET /api/attendance/{registrationId}/status

Response 200: { "present": true, "markedAt": "..." }
Response 200: { "present": false }
```

---

## Ticket Service — `/api/tickets`

### Get Ticket for Registration
```
GET /api/tickets/registration/{registrationId}

Response 200:
{
  "id": 1,
  "registrationId": 1,
  "studentId": "STU-001",
  "eventId": 1,
  "qrCode": "data:image/png;base64,iVBORw0...",
  "status": "VALID",
  "generatedAt": "..."
}
Response 404: { "error": "Ticket not yet generated" }
```

### Validate Ticket (at entry)
```
GET /api/tickets/{id}/validate

Response 200: { "valid": true, "ticketId": 1, "studentId": "STU-001", "eventId": 1 }
Response 200: { "valid": false, "reason": "ALREADY_USED" }
Response 404: { "error": "Ticket not found" }
```

### Mark Ticket as Used
```
PUT /api/tickets/{id}/mark-used

Response 200: { "status": "USED" }
```

---

## Notification Service — `/api/notifications`

### Get Student's Notifications
```
GET /api/notifications/student/{studentId}

Response 200: [ { ...notification }, ... ]
```

### Get Notification Detail
```
GET /api/notifications/{id}

Response 200:
{
  "id": 1,
  "type": "REGISTRATION",
  "subject": "Registration Confirmed: Spring Boot Workshop",
  "message": "...",
  "sentAt": "...",
  "status": "SENT"
}
```

### Filter by Type
```
GET /api/notifications/type/{type}
Type values: REGISTRATION | REMINDER | VENUE_CHANGE | ANNOUNCEMENT | RESULT

Response 200: [ { ...notification }, ... ]
```

---

## Certificate Service — `/api/certificates`

### List Student's Certificates
```
GET /api/certificates/student/{studentId}

Response 200:
[
  {
    "id": 1,
    "certificateNumber": "CERT-2024-001",
    "eventTitle": "Spring Boot Workshop",
    "issuedAt": "...",
    "downloadUrl": "/api/certificates/1/download"
  }
]
```

### Download Certificate PDF
```
GET /api/certificates/{id}/download

Response 200 (application/pdf): <binary PDF data>
Content-Disposition: attachment; filename="certificate-CERT-2024-001.pdf"
```

### Verify Certificate (public)
```
GET /api/certificates/verify/{certificateNumber}

Response 200:
{
  "valid": true,
  "studentName": "Alice Johnson",
  "eventTitle": "Spring Boot Workshop",
  "issuedAt": "..."
}
Response 404: { "valid": false, "error": "Certificate not found" }
```

---

## Feedback Service — `/api/feedback`

### Submit Feedback
```
POST /api/feedback
Content-Type: application/json

{
  "studentId": "STU-001",
  "eventId": 1,
  "rating": 5,
  "comment": "Excellent workshop, very hands-on!"
}

Response 201: { "id": 1, "rating": 5, "submittedAt": "..." }
Response 409: { "error": "Feedback already submitted for this event" }
```

### Get Feedback for Event
```
GET /api/feedback/event/{eventId}

Response 200: [ { ...feedback }, ... ]
```

### Get Feedback Summary
```
GET /api/feedback/event/{eventId}/summary

Response 200:
{
  "eventId": 1,
  "averageRating": 4.6,
  "totalResponses": 35,
  "ratingDistribution": {
    "5": 20, "4": 10, "3": 3, "2": 1, "1": 1
  }
}
```

### Student's Feedback History
```
GET /api/feedback/student/{studentId}

Response 200: [ { ...feedback }, ... ]
```

---

## Leaderboard Service — `/api/leaderboard`

### Publish Results
```
POST /api/leaderboard/results
Content-Type: application/json

{
  "eventId": 1,
  "eventTitle": "Hackathon 2024",
  "results": [
    { "studentId": "STU-001", "studentName": "Alice Johnson", "position": 1, "category": "Overall", "points": 100 },
    { "studentId": "STU-002", "studentName": "Bob Smith", "position": 2, "category": "Overall", "points": 80 }
  ]
}

Response 201: { "published": true, "count": 2 }
```

### Get Rankings for Event
```
GET /api/leaderboard/event/{eventId}

Response 200: [ { ...result ordered by position }, ... ]
```

### Student's Achievements
```
GET /api/leaderboard/student/{studentId}

Response 200: [ { ...result }, ... ]
```

### Top Performers Overall
```
GET /api/leaderboard/top?limit=10

Response 200: [ { "studentId": "...", "studentName": "...", "totalPoints": 250 }, ... ]
```

---

## Announcement Service — `/api/announcements`

### Create Announcement
```
POST /api/announcements
Content-Type: application/json

{
  "title": "Venue Change Notice",
  "content": "The venue for Spring Boot Workshop has been changed to Room 301.",
  "eventId": 1,
  "type": "VENUE_CHANGE",
  "publishedBy": "admin"
}

Response 201: { "id": 1, "publishedAt": "..." }
```

### List All Announcements
```
GET /api/announcements

Response 200: [ { ...announcement }, ... ]
```

### Announcements for Event
```
GET /api/announcements/event/{eventId}

Response 200: [ { ...announcement }, ... ]
```

### Get Announcement Detail
```
GET /api/announcements/{id}

Response 200: { ...announcement }
```

---

## Resource Service — `/api/resources`

### Upload File
```
POST /api/resources/upload
Content-Type: multipart/form-data

eventId=1
uploadedBy=STU-001
description=Workshop slides
file=<binary>

Response 201: { "id": 1, "fileName": "slides.pdf", "downloadUrl": "/api/resources/1/download" }
Response 413: { "error": "File too large. Maximum size is 10MB" }
```

### List Resources for Event
```
GET /api/resources/event/{eventId}

Response 200: [ { "id": 1, "fileName": "slides.pdf", "fileType": "application/pdf", "fileSize": 1024000 }, ... ]
```

### Download File
```
GET /api/resources/{id}/download

Response 200 (appropriate Content-Type): <binary file data>
```

### Delete Resource
```
DELETE /api/resources/{id}

Response 204
```

---

## Sponsor Service — `/api/sponsors`

### Add Sponsor
```
POST /api/sponsors
Content-Type: application/json

{
  "name": "TechCorp",
  "logoUrl": "https://techcorp.com/logo.png",
  "website": "https://techcorp.com",
  "tier": "GOLD",
  "contactPerson": "John Doe",
  "contactEmail": "john@techcorp.com",
  "description": "Leading technology company"
}

Response 201: { "id": 1, ... }
```

### List All Sponsors
```
GET /api/sponsors

Response 200: [ { ...sponsor }, ... ]
```

### Get Sponsor Detail
```
GET /api/sponsors/{id}

Response 200: { ...sponsor }
```

### Update Sponsor
```
PUT /api/sponsors/{id}
Content-Type: application/json

{ ...fields to update }

Response 200: { ...updated sponsor }
```

### Link Sponsor to Event
```
POST /api/sponsors/{sponsorId}/events/{eventId}
Content-Type: application/json

{
  "contribution": 50000.00,
  "notes": "Primary sponsor for refreshments"
}

Response 201: { "id": 1, "eventId": 1, "sponsorId": 1 }
```

### Get Sponsors for Event
```
GET /api/sponsors/event/{eventId}

Response 200: [ { ...sponsor, "contribution": 50000.00 }, ... ]
```

---

## Standard Error Response Format

All services return errors in this format:

```json
{
  "timestamp": "2024-01-15T10:30:00Z",
  "status": 404,
  "error": "Not Found",
  "message": "Event not found with id: 99",
  "path": "/api/events/99"
}
```

## HTTP Status Codes

| Code | Usage |
|------|-------|
| 200 | OK — GET/PUT success |
| 201 | Created — POST success |
| 204 | No Content — DELETE success |
| 400 | Bad Request — validation error |
| 404 | Not Found — resource missing |
| 409 | Conflict — duplicate or capacity full |
| 413 | Payload Too Large — file upload limit |
| 503 | Service Unavailable — circuit breaker open |
