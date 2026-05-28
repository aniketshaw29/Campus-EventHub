import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { StudentProvider } from './context/StudentContext.jsx'
import Navbar from './components/Navbar.jsx'
import Events from './pages/Events.jsx'
import EventDetail from './pages/EventDetail.jsx'
import Register from './pages/Register.jsx'
import MyRegistrations from './pages/MyRegistrations.jsx'
import MyTickets from './pages/MyTickets.jsx'
import Attendance from './pages/Attendance.jsx'
import Certificates from './pages/Certificates.jsx'
import Feedback from './pages/Feedback.jsx'
import Leaderboard from './pages/Leaderboard.jsx'
import Admin from './pages/Admin.jsx'

export default function App() {
  return (
    <StudentProvider>
      <BrowserRouter>
        <Navbar />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Navigate to="/events" replace />} />
            <Route path="/events" element={<Events />} />
            <Route path="/events/:id" element={<EventDetail />} />
            <Route path="/events/:id/register" element={<Register />} />
            <Route path="/my-registrations" element={<MyRegistrations />} />
            <Route path="/my-tickets" element={<MyTickets />} />
            <Route path="/attendance/:eventId" element={<Attendance />} />
            <Route path="/certificates" element={<Certificates />} />
            <Route path="/feedback/:eventId" element={<Feedback />} />
            <Route path="/leaderboard" element={<Leaderboard />} />
            <Route path="/admin" element={<Admin />} />
          </Routes>
        </main>
      </BrowserRouter>
    </StudentProvider>
  )
}
