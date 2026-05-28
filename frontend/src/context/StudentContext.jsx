import { createContext, useContext, useState } from 'react'

const StudentContext = createContext(null)

// Persists a lightweight "session" in localStorage so you don't re-enter
// your name/email on every page load.
const STORAGE_KEY = 'campus_student'

function load() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

export function StudentProvider({ children }) {
  const [student, setStudentState] = useState(load)

  function setStudent(s) {
    if (s) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(s))
    } else {
      localStorage.removeItem(STORAGE_KEY)
    }
    setStudentState(s)
  }

  return (
    <StudentContext.Provider value={{ student, setStudent }}>
      {children}
    </StudentContext.Provider>
  )
}

export function useStudent() {
  return useContext(StudentContext)
}
