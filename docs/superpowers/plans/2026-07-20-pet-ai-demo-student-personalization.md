# Pet AI Demo Student Personalization Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Bind Reachy to `stu-test`, reuse the Pocket pet appearance, persist stable differentiated OCEAN values, and diversify demo conversation layout and content.

**Architecture:** Keep Pocket read-only and copy one canonical pet frame into Sentinel public assets. Add deterministic pure generators for OCEAN and conversations, then let the existing student-detail API persist OCEAN only when all five fields still equal their Prisma defaults. Render messages as variable-width chat bubbles.

**Tech Stack:** Next.js 16, React 19, TypeScript, Prisma, Tailwind CSS 4, Node test runner.

## Global Constraints

- Do not modify PsyTwin-Pocket.
- Do not write demo conversations to chat tables.
- Preserve non-default OCEAN values.
- Do not commit or push without user confirmation.

---

### Task 1: Stable personality and conversation generators

**Files:**
- Modify: `lib/pet-ai/demo-data.ts`
- Test: `lib/pet-ai/pet-ai-domain.test.ts`

**Interfaces:**
- Produces: `buildStableOceanPersonality(studentId)` and variable-length `buildDemoConversations(studentId, petName)`.

- [x] Add failing tests asserting all OCEAN values are within 35–85, stable per ID, and distinct across IDs.
- [x] Add a failing test asserting different students receive different conversation counts and that message lengths vary.
- [x] Run `npx tsx --test lib/pet-ai/pet-ai-domain.test.ts` and confirm the new assertions fail.
- [x] Implement deterministic generators using the existing string hash.
- [x] Re-run the focused test and confirm it passes.

### Task 2: Test student binding and Pocket appearance

**Files:**
- Modify: `.env.example`
- Modify: `app/api/pet-ai/students/route.ts`
- Modify: `app/api/pet-ai/students/[studentId]/route.ts`
- Modify: `app/api/pet-ai/reachy/session/route.ts`
- Create: `public/pet/pocket-main-pet.png`
- Test: `lib/pet-ai/pet-ai-api.test.ts`

**Interfaces:**
- Consumes: `buildStableOceanPersonality(studentId)`.
- Produces: student detail with persistent OCEAN and fixed Pocket image for `stu-test`.

- [x] Add failing source/API assertions for the `stu-test` default, Pocket image path, and default-only personality update.
- [x] Run the focused API test and confirm failure.
- [x] Copy Pocket frame `static/pet/ExportedSprites/000_eef1e56dfae4dd8b436c47ebea8d33bc_0.png` into Sentinel.
- [x] Update default binding and persist deterministic OCEAN only when all five values are 50.
- [x] Re-run the focused API test and confirm pass.

### Task 3: Variable-width conversation UI

**Files:**
- Modify: `components/views/pet-ai-management-view.tsx`
- Test: `lib/pet-ai-management-navigation.test.ts`

**Interfaces:**
- Consumes: existing conversation response fields.
- Produces: date separators and sender-aligned `w-fit` chat bubbles.

- [x] Add failing source assertions for `w-fit`, sender labels, and the Pocket-bound demo badge copy.
- [x] Run the UI source test and confirm failure.
- [x] Replace uniform message blocks with sender-aligned chat rows and variable-width bubbles.
- [x] Re-run the UI source test and confirm pass.

### Task 4: Documentation and verification

**Files:**
- Modify: `docs/superpowers/specs/2026-07-20-pet-ai-demo-student-personalization-design.md`
- Modify: `docs/superpowers/plans/2026-07-20-pet-ai-demo-student-personalization.md`

**Interfaces:**
- Produces: synchronized OpenSpec completion state.

- [x] Run focused Node tests and ESLint.
- [x] Run `npx prisma validate` and `npm run build`.
- [x] Verify default selection, image, OCEAN differentiation, chat layout, internal scrolling, and console logs in the browser.
- [x] Mark completed checklist items with the verification date and report any external hardware limitation.
