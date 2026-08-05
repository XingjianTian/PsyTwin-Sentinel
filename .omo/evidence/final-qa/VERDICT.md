# F3 — Real Manual QA Report

**Date**: 2026-03-05
**Executor**: Sisyphus-Junior (claude-opus-4-6)
**Starting State**: Clean (all infra already deployed by prior tasks)

---

## Scenario Results

| # | Task | Scenario | Checks | Result |
|---|------|----------|--------|--------|
| 1 | Task 1 | `.env` contains DATABASE_URL | PASS | `.env` 有完整 DATABASE_URL 和强密码 |
| 2 | Task 1 | `.env.example` password = `your_password_here` | PASS | 占位符正确 |
| 3 | Task 1 | `.gitignore` contains `.env` | PASS | `.env*.local` 和 `.env` 均在忽略列表 |
| 4 | Task 3 | Docker container healthy | PASS | `psytwin-postgres-dev` status: `Up (healthy)` |
| 5 | Task 3 | PostgreSQL accepting connections | PASS | `pg_isready`: accepting connections |
| 6 | Task 4 | `@prisma/client` installed | PASS | v6.19.2 |
| 7 | Task 4 | `prisma` installed | PASS | v6.19.2 |
| 8 | Task 4 | `tsx` installed | PASS | v4.21.0 |
| 9 | Task 6 | `npx prisma format` succeeds | PASS | Formatted in 22ms |
| 10 | Task 6 | `npx prisma validate` succeeds | PASS | Schema is valid |
| 11 | Task 7 | `npx prisma migrate status` up to date | PASS | "Database schema is up to date!" |
| 12 | Task 8 | Seed first run succeeds | PASS | "Seed completed successfully." |
| 13 | Task 8 | Seed second run (idempotency) | PASS | No duplicate errors |
| 14 | Task 9 | All 17 tables have data | PASS | See counts below |
| 15 | Task 9 | `npm run build` succeeds | PASS | Next.js 16.1.6 compiled in 4.6s |

## Data Counts

| Table | Count |
|-------|-------|
| students | 10 |
| work_orders | 10 |
| alerts | 10 |
| devices | 6 |
| vr_sessions | 10 |
| vital_signs | 60 |
| faculties | 6 |
| psych_profiles | 10 |
| timeline_events | 30 |
| intervention_records | 5 |
| vr_scenes | 4 |
| consultation_rooms | 4 |
| room_devices | 6 |
| voice_analyses | 60 |
| expression_data | 60 |
| ai_documents | 5 |
| ai_prompt_presets | 4 |

## Evidence Files

- `task-1-env-files.txt`
- `task-3-docker.txt`
- `task-4-deps.txt`
- `task-6-schema.txt`
- `task-7-migration.txt`
- `task-8-seed.txt`
- `task-9-data-build.txt`

---

## Scenarios [15/15 pass] | VERDICT: APPROVE
