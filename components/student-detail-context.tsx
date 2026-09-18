"use client"

import { createContext, useContext } from "react"
import type { StudentDetail } from "@/app/actions/students"

const StudentDetailContext = createContext<StudentDetail | null>(null)

export function StudentDetailProvider({
  student,
  children,
}: {
  student: StudentDetail
  children: React.ReactNode
}) {
  return (
    <StudentDetailContext.Provider value={student}>
      {children}
    </StudentDetailContext.Provider>
  )
}

export function useStudentDetail() {
  const student = useContext(StudentDetailContext)
  if (!student) {
    throw new Error("useStudentDetail must be used within StudentDetailProvider")
  }
  return student
}
