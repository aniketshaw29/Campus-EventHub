-- =============================================================================
-- Campus Event Hub — Sample Seed Data
-- Run against all containers:
--   docker exec -i event-db psql -U postgres -d event_db < seed-data.sql
--   docker exec -i venue-db psql -U postgres -d venue_db < seed-data.sql
--   ... etc. (see seed.sh for one-shot execution)
-- =============================================================================

-- ─── venue_db ─────────────────────────────────────────────────────────────────
\c venue_db

INSERT INTO venues (id, name, location, capacity, type, facilities, created_at) VALUES
(1, 'Main Auditorium',       'Block A, Ground Floor',  500, 'AUDITORIUM',    'Projector, Mic, AC, Stage',             NOW()),
(2, 'Seminar Hall 1',        'Block B, 2nd Floor',     120, 'SEMINAR_HALL',  'Projector, Whiteboard, AC',             NOW()),
(3, 'Computer Lab 3',        'Block C, 1st Floor',      60, 'LAB',           'Computers, AC, Projector',              NOW()),
(4, 'Open Amphitheatre',     'Central Campus',         800, 'OUTDOOR',       'Stage, Sound System, Open Sky',         NOW()),
(5, 'Classroom 201',         'Block D, 2nd Floor',      80, 'CLASSROOM',     'Whiteboard, Projector',                 NOW())
ON CONFLICT (id) DO NOTHING;

INSERT INTO venue_bookings (id, venue_id, event_id, start_time, end_time, status, created_at) VALUES
(1, 1, 1, '2026-06-15 09:00:00', '2026-06-15 17:00:00', 'BOOKED',    NOW()),
(2, 2, 2, '2026-06-20 10:00:00', '2026-06-20 13:00:00', 'BOOKED',    NOW()),
(3, 3, 3, '2026-06-25 14:00:00', '2026-06-25 18:00:00', 'BOOKED',    NOW()),
(4, 4, 4, '2026-07-01 18:00:00', '2026-07-01 22:00:00', 'BOOKED',    NOW()),
(5, 5, 5, '2026-07-05 09:00:00', '2026-07-05 12:00:00', 'CANCELLED', NOW())
ON CONFLICT (id) DO NOTHING;

-- ─── event_db ─────────────────────────────────────────────────────────────────
\c event_db

INSERT INTO events (id, title, description, event_date, end_date, category, max_capacity, current_registrations, status, venue_id, created_at, updated_at) VALUES
(1, 'HackBITS 2026',           'Annual 24-hour hackathon for all students',        '2026-06-15 09:00:00', '2026-06-16 09:00:00', 'HACKATHON',  200, 120, 'UPCOMING',  1, NOW(), NOW()),
(2, 'AI/ML Workshop',          'Hands-on intro to machine learning with Python',   '2026-06-20 10:00:00', '2026-06-20 13:00:00', 'WORKSHOP',   100,  85, 'UPCOMING',  2, NOW(), NOW()),
(3, 'Web Dev Bootcamp',        'Full-stack development using Spring Boot & React', '2026-06-25 14:00:00', '2026-06-25 18:00:00', 'BOOTCAMP',    60,  60, 'UPCOMING',  3, NOW(), NOW()),
(4, 'Cultural Fest 2026',      'Annual cultural evening with performances',        '2026-07-01 18:00:00', '2026-07-01 22:00:00', 'CULTURAL',   500, 310, 'UPCOMING',  4, NOW(), NOW()),
(5, 'Cloud Computing Seminar', 'Industry talk on cloud-native architectures',      '2026-07-05 09:00:00', '2026-07-05 12:00:00', 'SEMINAR',     80,   0, 'UPCOMING',  5, NOW(), NOW()),
(6, 'Data Structures Contest', 'Competitive programming contest',                  '2026-05-10 10:00:00', '2026-05-10 13:00:00', 'COMPETITION', 100, 100, 'COMPLETED', 2, NOW(), NOW()),
(7, 'Robotics Demo Day',       'Student robotics project showcase',                '2026-05-20 11:00:00', '2026-05-20 16:00:00', 'SHOWCASE',   150,  90, 'COMPLETED', 1, NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- ─── registration_db ──────────────────────────────────────────────────────────
\c registration_db

INSERT INTO registrations (id, student_id, student_name, student_email, event_id, registered_at, status) VALUES
(1,  'STU001', 'Alice Johnson',  'alice@bits.edu',   1, NOW(), 'ACTIVE'),
(2,  'STU002', 'Bob Smith',      'bob@bits.edu',     1, NOW(), 'ACTIVE'),
(3,  'STU003', 'Carol White',    'carol@bits.edu',   1, NOW(), 'ACTIVE'),
(4,  'STU001', 'Alice Johnson',  'alice@bits.edu',   2, NOW(), 'ACTIVE'),
(5,  'STU004', 'David Lee',      'david@bits.edu',   2, NOW(), 'ACTIVE'),
(6,  'STU005', 'Eva Martinez',   'eva@bits.edu',     3, NOW(), 'ACTIVE'),
(7,  'STU002', 'Bob Smith',      'bob@bits.edu',     3, NOW(), 'CANCELLED'),
(8,  'STU003', 'Carol White',    'carol@bits.edu',   4, NOW(), 'ACTIVE'),
(9,  'STU004', 'David Lee',      'david@bits.edu',   4, NOW(), 'ACTIVE'),
(10, 'STU005', 'Eva Martinez',   'eva@bits.edu',     6, NOW(), 'ACTIVE'),
(11, 'STU001', 'Alice Johnson',  'alice@bits.edu',   6, NOW(), 'ACTIVE'),
(12, 'STU002', 'Bob Smith',      'bob@bits.edu',     6, NOW(), 'ACTIVE'),
(13, 'STU003', 'Carol White',    'carol@bits.edu',   7, NOW(), 'ACTIVE'),
(14, 'STU004', 'David Lee',      'david@bits.edu',   7, NOW(), 'ACTIVE')
ON CONFLICT (id) DO NOTHING;

-- ─── attendance_db ────────────────────────────────────────────────────────────
\c attendance_db

INSERT INTO attendance (id, registration_id, student_id, event_id, student_name, student_email, event_title, marked_at, status) VALUES
(1,  10, 'STU005', 6, 'Eva Martinez',  'eva@bits.edu',   'Data Structures Contest', NOW(), 'PRESENT'),
(2,  11, 'STU001', 6, 'Alice Johnson', 'alice@bits.edu', 'Data Structures Contest', NOW(), 'PRESENT'),
(3,  12, 'STU002', 6, 'Bob Smith',     'bob@bits.edu',   'Data Structures Contest', NOW(), 'ABSENT'),
(4,  13, 'STU003', 7, 'Carol White',   'carol@bits.edu', 'Robotics Demo Day',       NOW(), 'PRESENT'),
(5,  14, 'STU004', 7, 'David Lee',     'david@bits.edu', 'Robotics Demo Day',       NOW(), 'PRESENT')
ON CONFLICT (id) DO NOTHING;

-- ─── ticket_db ────────────────────────────────────────────────────────────────
\c ticket_db

INSERT INTO tickets (id, registration_id, student_id, event_id, qr_code, generated_at, status) VALUES
(1,  1,  'STU001', 1, 'QR-REG001-EVT001-A1B2C3', NOW(), 'VALID'),
(2,  2,  'STU002', 1, 'QR-REG002-EVT001-D4E5F6', NOW(), 'VALID'),
(3,  3,  'STU003', 1, 'QR-REG003-EVT001-G7H8I9', NOW(), 'VALID'),
(4,  4,  'STU001', 2, 'QR-REG004-EVT002-J1K2L3', NOW(), 'VALID'),
(5,  5,  'STU004', 2, 'QR-REG005-EVT002-M4N5O6', NOW(), 'VALID'),
(6,  6,  'STU005', 3, 'QR-REG006-EVT003-P7Q8R9', NOW(), 'VALID'),
(7,  7,  'STU002', 3, 'QR-REG007-EVT003-S1T2U3', NOW(), 'CANCELLED'),
(8,  8,  'STU003', 4, 'QR-REG008-EVT004-V4W5X6', NOW(), 'VALID'),
(9,  9,  'STU004', 4, 'QR-REG009-EVT004-Y7Z8A9', NOW(), 'VALID'),
(10, 10, 'STU005', 6, 'QR-REG010-EVT006-B1C2D3', NOW(), 'USED'),
(11, 11, 'STU001', 6, 'QR-REG011-EVT006-E4F5G6', NOW(), 'USED'),
(12, 12, 'STU002', 6, 'QR-REG012-EVT006-H7I8J9', NOW(), 'USED'),
(13, 13, 'STU003', 7, 'QR-REG013-EVT007-K1L2M3', NOW(), 'USED'),
(14, 14, 'STU004', 7, 'QR-REG014-EVT007-N4O5P6', NOW(), 'USED')
ON CONFLICT (id) DO NOTHING;

-- ─── certificate_db ───────────────────────────────────────────────────────────
\c certificate_db

INSERT INTO certificates (id, student_id, student_name, event_id, event_title, registration_id, certificate_number, issued_at) VALUES
(1, 'STU005', 'Eva Martinez',  6, 'Data Structures Contest', 10, 'CERT-2026-0001', NOW()),
(2, 'STU001', 'Alice Johnson', 6, 'Data Structures Contest', 11, 'CERT-2026-0002', NOW()),
(3, 'STU003', 'Carol White',   7, 'Robotics Demo Day',       13, 'CERT-2026-0003', NOW()),
(4, 'STU004', 'David Lee',     7, 'Robotics Demo Day',       14, 'CERT-2026-0004', NOW())
ON CONFLICT (id) DO NOTHING;

-- ─── feedback_db ──────────────────────────────────────────────────────────────
\c feedback_db

INSERT INTO feedback (id, student_id, student_name, event_id, rating, comment, submitted_at) VALUES
(1, 'STU005', 'Eva Martinez',  6, 5, 'Amazing contest! Well organized and challenging problems.',      NOW()),
(2, 'STU001', 'Alice Johnson', 6, 4, 'Really enjoyed it. Could have more time for harder problems.',  NOW()),
(3, 'STU003', 'Carol White',   7, 5, 'Robotics demo was very inspiring. Great team projects!',        NOW()),
(4, 'STU004', 'David Lee',     7, 4, 'Excellent showcase. Would love longer demo slots per team.',    NOW()),
(5, 'STU002', 'Bob Smith',     6, 3, 'Good event but venue was a bit cramped for the crowd.',         NOW())
ON CONFLICT (id) DO NOTHING;

-- ─── leaderboard_db ───────────────────────────────────────────────────────────
\c leaderboard_db

INSERT INTO results (id, event_id, event_title, student_id, student_name, position, category, points, published_at) VALUES
(1, 6, 'Data Structures Contest', 'STU005', 'Eva Martinez',  'FIRST',       'Algorithm', 100, NOW()),
(2, 6, 'Data Structures Contest', 'STU001', 'Alice Johnson', 'SECOND',      'Algorithm',  75, NOW()),
(3, 6, 'Data Structures Contest', 'STU002', 'Bob Smith',     'THIRD',       'Algorithm',  50, NOW()),
(4, 7, 'Robotics Demo Day',       'STU003', 'Carol White',   'FIRST',       'Design',    100, NOW()),
(5, 7, 'Robotics Demo Day',       'STU004', 'David Lee',     'SECOND',      'Design',     75, NOW()),
(6, 6, 'Data Structures Contest', 'STU003', 'Carol White',   'PARTICIPANT', 'Algorithm',  25, NOW()),
(7, 6, 'Data Structures Contest', 'STU004', 'David Lee',     'PARTICIPANT', 'Algorithm',  25, NOW())
ON CONFLICT (id) DO NOTHING;

-- ─── announcement_db ──────────────────────────────────────────────────────────
\c announcement_db

INSERT INTO announcements (id, title, content, event_id, type, published_by, published_at) VALUES
(1, 'HackBITS 2026 Registration Open',     'Registrations are now open for HackBITS 2026! Limited spots available.',                        1, 'GENERAL',      'Admin',      NOW()),
(2, 'AI/ML Workshop — Pre-reading Material','Please complete the pre-reading on NumPy and Pandas before the workshop.',                      2, 'EVENT_UPDATE', 'Organizer',  NOW()),
(3, 'Web Dev Bootcamp — Seats Full',        'Web Dev Bootcamp is now at full capacity. Waitlist is open.',                                   3, 'EVENT_UPDATE', 'Organizer',  NOW()),
(4, 'Cultural Fest Venue Confirmed',        'Cultural Fest 2026 will be held at the Open Amphitheatre as planned.',                          4, 'VENUE_CHANGE', 'Admin',      NOW()),
(5, 'Data Structures Contest Results Out',  'Congratulations to all participants! Results have been published on the leaderboard.',          6, 'GENERAL',      'Organizer',  NOW()),
(6, 'Emergency: Lab Maintenance',           'Computer Lab 3 will be under maintenance on June 24. Bootcamp timings remain unchanged.',       3, 'EMERGENCY',    'Admin',      NOW())
ON CONFLICT (id) DO NOTHING;

-- ─── notification_db ──────────────────────────────────────────────────────────
\c notification_db

INSERT INTO notifications (id, recipient_id, recipient_email, type, subject, message, sent_at, status) VALUES
(1,  'STU001', 'alice@bits.edu', 'REGISTRATION',  'Registration Confirmed — HackBITS 2026',         'Hi Alice, your registration for HackBITS 2026 is confirmed.',           NOW(), 'SENT'),
(2,  'STU002', 'bob@bits.edu',   'REGISTRATION',  'Registration Confirmed — HackBITS 2026',         'Hi Bob, your registration for HackBITS 2026 is confirmed.',             NOW(), 'SENT'),
(3,  'STU001', 'alice@bits.edu', 'REMINDER',      'Reminder: AI/ML Workshop tomorrow',              'Hi Alice, the AI/ML Workshop is tomorrow at 10:00 AM in Seminar Hall.', NOW(), 'SENT'),
(4,  'STU003', 'carol@bits.edu', 'RESULT',        'Contest Results — Data Structures Contest',      'Hi Carol, results for the Data Structures Contest are now published.',  NOW(), 'SENT'),
(5,  'STU005', 'eva@bits.edu',   'RESULT',        'Congratulations! You placed 1st',                'Hi Eva, you placed 1st in the Data Structures Contest. Well done!',     NOW(), 'SENT'),
(6,  'STU003', 'carol@bits.edu', 'ANNOUNCEMENT',  'Cultural Fest Venue Confirmed',                  'Hi Carol, Cultural Fest 2026 venue is confirmed: Open Amphitheatre.',   NOW(), 'SENT'),
(7,  'STU004', 'david@bits.edu', 'VENUE_CHANGE',  'Venue Update — Cultural Fest 2026',              'Hi David, the venue for Cultural Fest 2026 has been confirmed.',        NOW(), 'FAILED'),
(8,  'STU002', 'bob@bits.edu',   'REGISTRATION',  'Registration Cancelled — Web Dev Bootcamp',      'Hi Bob, your registration for Web Dev Bootcamp has been cancelled.',   NOW(), 'SENT')
ON CONFLICT (id) DO NOTHING;

-- ─── resource_db ──────────────────────────────────────────────────────────────
\c resource_db

INSERT INTO resources (id, event_id, uploaded_by, file_name, file_type, file_size, storage_key, description, uploaded_at) VALUES
(1, 1, 'organizer1', 'hackbits_problem_statements.pdf', 'application/pdf',    204800,  'events/1/hackbits_problem_statements.pdf', 'Problem statements for all tracks',          NOW()),
(2, 2, 'organizer2', 'ml_workshop_slides.pptx',         'application/vnd.ms', 1048576, 'events/2/ml_workshop_slides.pptx',         'Workshop presentation slides',               NOW()),
(3, 3, 'organizer3', 'webdev_bootcamp_guide.pdf',       'application/pdf',    512000,  'events/3/webdev_bootcamp_guide.pdf',        'Bootcamp coding guide and exercises',        NOW()),
(4, 6, 'organizer2', 'contest_editorial.pdf',           'application/pdf',    307200,  'events/6/contest_editorial.pdf',            'Editorial and solutions for all problems',   NOW()),
(5, 7, 'organizer1', 'robotics_submission_rules.pdf',   'application/pdf',    153600,  'events/7/robotics_submission_rules.pdf',    'Submission and judging criteria for demos',  NOW())
ON CONFLICT (id) DO NOTHING;

-- ─── sponsor_db ───────────────────────────────────────────────────────────────
\c sponsor_db

INSERT INTO sponsors (id, name, logo_url, website, tier, contact_person, contact_email, description) VALUES
(1, 'TechCorp Solutions',  'https://techcorp.example.com/logo.png',  'https://techcorp.example.com',  'PLATINUM', 'Raj Patel',    'raj@techcorp.example.com',  'Leading software solutions company'),
(2, 'InnovateLabs',        'https://innovatelabs.example.com/logo.png','https://innovatelabs.example.com','GOLD', 'Sara Nair',    'sara@innovatelabs.example.com','R&D firm specializing in AI products'),
(3, 'CloudBase Inc.',      'https://cloudbase.example.com/logo.png', 'https://cloudbase.example.com', 'SILVER',   'Tom Nguyen',   'tom@cloudbase.example.com',  'Cloud infrastructure provider'),
(4, 'StartupBoost',        'https://startupboost.example.com/logo.png','https://startupboost.example.com','BRONZE','Priya Singh', 'priya@startupboost.example.com','Startup accelerator and community')
ON CONFLICT (id) DO NOTHING;

INSERT INTO event_sponsors (id, event_id, sponsor_id, contribution, notes, linked_at) VALUES
(1, 1, 1, 50000.00, 'Title sponsor — branding on all materials',    NOW()),
(2, 1, 2, 25000.00, 'Gold sponsor — booth at venue',                NOW()),
(3, 6, 1, 15000.00, 'Prize money sponsor for top 3',                NOW()),
(4, 7, 3, 10000.00, 'Cloud credits sponsor for participants',       NOW()),
(5, 4, 4, 5000.00,  'Cultural fest community sponsor',              NOW())
ON CONFLICT (id) DO NOTHING;
