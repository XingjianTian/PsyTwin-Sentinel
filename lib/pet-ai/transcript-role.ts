export function isStudentReachyTranscriptRole(value: unknown) {
  const normalized = typeof value === "string" ? value.trim().toLowerCase() : ""
  return normalized === "student" || normalized === "user"
}
