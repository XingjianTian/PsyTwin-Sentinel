import { NextResponse } from "next/server"

import { prisma } from "@/lib/prisma"

const db = prisma

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

const MAX_LIMIT = 200
const DEFAULT_LIMIT = 50
const DEFAULT_OFFSET = 0
const OPENCLAW_TABLE_PATTERN = /^openclaw_[a-z0-9_]+$/i
const BLOCKED_SQL_KEYWORDS = [
  "DROP",
  "DELETE",
  "INSERT",
  "UPDATE",
  "ALTER",
  "CREATE",
  "TRUNCATE",
  "GRANT",
  "REVOKE",
  "COMMENT",
  "COPY",
  "MERGE",
  "CALL",
  "DO",
]

function toInt(value: string | null, fallback: number) {
  const parsed = Number.parseInt(value ?? "", 10)
  return Number.isFinite(parsed) ? parsed : fallback
}

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max)
}

function quoteIdentifier(identifier: string) {
  return `"${identifier.replace(/"/g, '""')}"`
}

function serializeValue(value: unknown): unknown {
  if (typeof value === "bigint") {
    const num = Number(value)
    return Number.isSafeInteger(num) ? num : value.toString()
  }

  if (value instanceof Date) {
    return value.toISOString()
  }

  if (Array.isArray(value)) {
    return value.map((item) => serializeValue(item))
  }

  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>).map(([key, item]) => [key, serializeValue(item)]),
    )
  }

  return value
}

function normalizeReadonlyQuery(input: string) {
  const raw = input.trim()
  const withoutTrailingSemicolon = raw.replace(/;+\s*$/, "")

  if (!withoutTrailingSemicolon) {
    return { ok: false as const, error: "Query cannot be empty" }
  }

  if (withoutTrailingSemicolon.includes(";")) {
    return { ok: false as const, error: "Only single-statement queries are allowed" }
  }

  if (!/^\s*(SELECT|PRAGMA)\b/i.test(withoutTrailingSemicolon)) {
    return { ok: false as const, error: "Only SELECT and PRAGMA queries are allowed" }
  }

  const upper = withoutTrailingSemicolon.toUpperCase()
  for (const keyword of BLOCKED_SQL_KEYWORDS) {
    const pattern = new RegExp(`\\b${keyword}\\b`, "i")
    if (pattern.test(upper)) {
      return { ok: false as const, error: `Query contains blocked keyword: ${keyword}` }
    }
  }

  return { ok: true as const, query: withoutTrailingSemicolon }
}

async function listOpenClawTables() {
  return db.$queryRaw<Array<{ name: string }>>`
    SELECT tablename AS name
    FROM pg_tables
    WHERE schemaname = 'public'
      AND tablename LIKE 'openclaw\_%' ESCAPE '\\'
    ORDER BY tablename
  `
}

async function getTableColumns(tableName: string) {
  return db.$queryRaw<
    Array<{
      name: string
      type: string
      notNull: boolean
      defaultValue: string | null
      isPrimaryKey: boolean
    }>
  >`
    SELECT
      c.column_name AS name,
      c.data_type AS type,
      (c.is_nullable = 'NO') AS "notNull",
      c.column_default AS "defaultValue",
      EXISTS (
        SELECT 1
        FROM information_schema.table_constraints tc
        JOIN information_schema.key_column_usage kcu
          ON tc.constraint_name = kcu.constraint_name
         AND tc.table_schema = kcu.table_schema
        WHERE tc.table_schema = c.table_schema
          AND tc.table_name = c.table_name
          AND tc.constraint_type = 'PRIMARY KEY'
          AND kcu.column_name = c.column_name
      ) AS "isPrimaryKey"
    FROM information_schema.columns c
    WHERE c.table_schema = 'public'
      AND c.table_name = ${tableName}
    ORDER BY c.ordinal_position
  `
}

async function getTableRowCount(tableName: string) {
  const safeTableName = quoteIdentifier(tableName)
  const rows = await db.$queryRawUnsafe<Array<{ count: bigint }>>(`SELECT COUNT(*)::bigint AS count FROM ${safeTableName}`)
  return Number(rows[0]?.count ?? 0)
}

export async function GET(request: Request) {

  const { searchParams } = new URL(request.url)
  const action = searchParams.get("action") || "tables"
  const table = searchParams.get("table")
  const limit = clamp(toInt(searchParams.get("limit"), DEFAULT_LIMIT), 1, MAX_LIMIT)
  const offset = clamp(toInt(searchParams.get("offset"), DEFAULT_OFFSET), 0, Number.MAX_SAFE_INTEGER)
  const query = searchParams.get("query")

  try {
    if (action === "tables") {
      const tables = await listOpenClawTables()
      const tableInfo = await Promise.all(
        tables.map(async ({ name }) => {
          const [rowCount, columns] = await Promise.all([getTableRowCount(name), getTableColumns(name)])
          return {
            name,
            rowCount,
            columns: serializeValue(columns),
          }
        }),
      )

      return NextResponse.json({ tables: serializeValue(tableInfo) })
    }

    if (action === "browse") {
      if (!table || !OPENCLAW_TABLE_PATTERN.test(table)) {
        return NextResponse.json(
          { error: "Invalid table. Only openclaw_* tables are allowed" },
          { status: 400 },
        )
      }

      const tableExists = await db.$queryRaw<Array<{ name: string }>>`
        SELECT tablename AS name
        FROM pg_tables
        WHERE schemaname = 'public'
          AND tablename = ${table}
          AND tablename LIKE 'openclaw\_%' ESCAPE '\\'
        LIMIT 1
      `

      if (!tableExists.length) {
        return NextResponse.json({ error: `Table "${table}" not found` }, { status: 404 })
      }

      const safeTableName = quoteIdentifier(table)
      const [total, columns, rows] = await Promise.all([
        getTableRowCount(table),
        getTableColumns(table),
        db.$queryRawUnsafe<Array<Record<string, unknown>>>(
          `SELECT * FROM ${safeTableName} LIMIT $1 OFFSET $2`,
          limit,
          offset,
        ),
      ])

      return NextResponse.json({
        table,
        columns: serializeValue(columns),
        rows: serializeValue(rows),
        total,
        limit,
        offset,
        hasMore: offset + limit < total,
      })
    }

    if (action === "query") {
      if (!query) {
        return NextResponse.json({ error: "Missing query parameter" }, { status: 400 })
      }

      const normalized = normalizeReadonlyQuery(query)
      if (!normalized.ok) {
        return NextResponse.json({ error: normalized.error }, { status: 400 })
      }

      const rows = await db.$queryRawUnsafe<Array<Record<string, unknown>>>(normalized.query)
      const safeRows = serializeValue(rows) as Array<Record<string, unknown>>

      return NextResponse.json({
        query: normalized.query,
        columns: safeRows.length > 0 ? Object.keys(safeRows[0]) : [],
        rows: safeRows.slice(0, limit),
        total: safeRows.length,
        truncated: safeRows.length > limit,
      })
    }

    if (action === "stats") {
      const [dbSizeRows, tableSizes] = await Promise.all([
        db.$queryRaw<Array<{ sizeBytes: bigint; sizePretty: string }>>`
          SELECT
            pg_database_size(current_database())::bigint AS "sizeBytes",
            pg_size_pretty(pg_database_size(current_database())) AS "sizePretty"
        `,
        db.$queryRaw<
          Array<{
            name: string
            sizeBytes: bigint
            sizePretty: string
          }>
        >`
          SELECT
            tablename AS name,
            pg_total_relation_size(format('%I.%I', schemaname, tablename))::bigint AS "sizeBytes",
            pg_size_pretty(pg_total_relation_size(format('%I.%I', schemaname, tablename))) AS "sizePretty"
          FROM pg_tables
          WHERE schemaname = 'public'
            AND tablename LIKE 'openclaw\_%' ESCAPE '\\'
          ORDER BY pg_total_relation_size(format('%I.%I', schemaname, tablename)) DESC
        `,
      ])

      const size = dbSizeRows[0] ?? { sizeBytes: 0, sizePretty: "0 bytes" }

      return NextResponse.json({
        sizeBytes: serializeValue(size.sizeBytes),
        sizeFormatted: size.sizePretty,
        tableCount: tableSizes.length,
        tables: serializeValue(tableSizes),
      })
    }

    return NextResponse.json({ error: "Invalid action. Use: tables, browse, query, stats" }, { status: 400 })
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Unknown database error",
      },
      { status: 500 },
    )
  }
}
