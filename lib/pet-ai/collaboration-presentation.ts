const COUNSELOR_AVATAR_SRC = "/agents-icons/Therapist.png"

export function getCollaborationEventPresentation(kind: string, sourceTitle: string) {
  if (kind === "handoff") {
    return { title: "转交咨询师智能体", avatarSrc: null }
  }
  if (kind === "professional") {
    return { title: "咨询师智能体专业建议", avatarSrc: COUNSELOR_AVATAR_SRC }
  }
  return { title: sourceTitle, avatarSrc: null }
}
